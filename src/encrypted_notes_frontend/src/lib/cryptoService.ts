import { ActorSubclass } from '@dfinity/agent';
import { v4 as uuidV4 } from 'uuid';

import {
  _SERVICE,
  RegisterKeyResult,
  SynchronizeKeyResult,
} from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { clearKeys, loadKey, storeKey } from './keyStorage';

export class CryptoService {
  private actor: ActorSubclass<_SERVICE>;
  private intervalId: number | null = null;
  private publicKey: CryptoKey | null;
  private privateKey: CryptoKey | null;
  private symmetricKey: CryptoKey | null;
  private exportedPublicKeyBase64: string | null;
  public readonly deviceAlias: string;

  /** STEP1: コンストラクタを定義する */
  constructor(actor: ActorSubclass<_SERVICE>) {
    this.actor = actor;

    this.deviceAlias = window.localStorage.getItem('deviceAlias');
    if (!this.deviceAlias) {
      this.deviceAlias = uuidV4();
      window.localStorage.setItem('deviceAlias', this.deviceAlias);
    }
    console.log(`Device alias: ${this.deviceAlias}`); // TODO: delete
  }

  /**
   * 鍵に関する設定を行う初期化関数です。
   */
  public async init(): Promise<boolean> {
    /** STEP4: 公開鍵・秘密鍵の取得と保存 */
    // データベースから公開鍵・秘密鍵を取得します。
    this.publicKey = await loadKey('publicKey');
    this.privateKey = await loadKey('privateKey');

    if (!this.publicKey || !this.privateKey) {
      // 公開鍵・秘密鍵が存在しない場合は、生成します。
      const keyPair: CryptoKeyPair = await this.generateKeyPair();

      // 生成した鍵をデータベースに保存します。
      await storeKey('publicKey', keyPair.publicKey);
      await storeKey('privateKey', keyPair.privateKey);

      this.publicKey = keyPair.publicKey;
      this.privateKey = keyPair.privateKey;
    }

    // publicKeyをexportしてBase64に変換します。
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      'spki',
      this.publicKey,
    );
    this.exportedPublicKeyBase64 = this.arrayBufferToBase64(exportedPublicKey);

    /** STEP2: デバイスデータの登録*/
    // バックエンドキャニスターにデバイスエイリアスと（"STEP4"が完了したら）公開鍵を登録します。
    await this.actor.registerDevice(
      this.deviceAlias,
      this.exportedPublicKeyBase64,
    );

    /** STEP5: 対称鍵を取得する */
    const isSymKeyRegistered =
      await this.actor.isEncryptedSymmetricKeyRegistered();
    if (!isSymKeyRegistered) {
      console.log('Generate symmetric key...');
      // 対称鍵を生成します。
      this.symmetricKey = await this.generateSymmetricKey();
      // 対称鍵を公開鍵で暗号化します。
      const wrappedSymmetricKeyBase64: string = await this.wrapSymmetricKey(
        this.symmetricKey,
        this.publicKey,
      );
      // 暗号化した対称鍵をバックエンドキャニスターに登録します。
      const result: RegisterKeyResult =
        await this.actor.registerEncryptedSymmetricKey(
          this.exportedPublicKeyBase64,
          wrappedSymmetricKeyBase64,
        );
      if ('Err' in result) {
        if ('UnknownPublicKey' in result.Err) {
          throw new Error('Unknown public key');
        }
        if ('AlreadyRegistered' in result.Err) {
          throw new Error('Already registered');
        }
        if ('DeviceNotRegistered' in result.Err) {
          throw new Error('Device not registered');
        }
      }

      /** STEP6: 対称鍵を同期する */
      console.log('Synchronizing symmetric keys...');
      if (this.intervalId === null) {
        this.intervalId = window.setInterval(
          () => this.syncSymmetricKey(),
          5000,
        );
      }

      return true;
    } else {
      console.log('Get symmetric key...');
      const synced = await this.trySyncSymmetricKey();

      return synced;
    }
  }

  public async trySyncSymmetricKey(): Promise<boolean> {
    // 対称鍵が同期されているか確認します。
    const syncedSymmetricKey: SynchronizeKeyResult =
      await this.actor.getEncryptedSymmetricKey(this.exportedPublicKeyBase64);
    if ('Err' in syncedSymmetricKey) {
      if ('UnknownPublicKey' in syncedSymmetricKey.Err) {
        throw new Error('Unknown public key');
      }
      if ('DeviceNotRegistered' in syncedSymmetricKey.Err) {
        throw new Error('Device not registered');
      }
      if ('KeyNotSynchronized') {
        console.log('Symmetric key is not synchronized');
        return false;
      }
    } else {
      this.symmetricKey = await this.unwrapSymmetricKey(
        syncedSymmetricKey.Ok,
        this.privateKey,
      );
      // 対称鍵が取得できたので、このデバイスでも鍵の同期処理を開始します。
      console.log(`Check intervalId: ${this.intervalId}`); // TODO: delete
      if (this.intervalId === null) {
        console.log('Try syncing symmetric keys...');
        this.intervalId = window.setInterval(
          () => this.syncSymmetricKey(),
          5000,
        );
      }
      return true;
    }
  }

  /** STEP3: デバイスデータの削除 */
  public async clearDeviceData(): Promise<void> {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    await clearKeys();
    window.localStorage.removeItem('deviceAlias');

    this.publicKey = null;
    this.privateKey = null;
    this.symmetricKey = null;
    this.exportedPublicKeyBase64 = null;
  }

  // TODO: 以下の関数はスターターに入れておく
  private async generateKeyPair(): Promise<CryptoKeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        // キー長
        modulusLength: 4096,
        // 公開指数（65537 == 0x010001）
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        // ハッシュアルゴリズム
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
    );
    return keyPair;
  }

  private async generateSymmetricKey(): Promise<CryptoKey> {
    const symmetricKey = await window.crypto.subtle.generateKey(
      {
        // キー生成のアルゴリズム
        name: 'AES-GCM',
        // キー長
        length: 256,
      },
      // キーを抽出可能（バイト配列としてエクスポートできること）とする
      true,
      // キーがサポートする使用法
      ['encrypt', 'decrypt'],
    );
    return symmetricKey;
  }

  private async wrapSymmetricKey(
    symmetricKey: CryptoKey,
    wrappingKey: CryptoKey,
  ): Promise<string> {
    const wrappedSymmetricKey = await window.crypto.subtle.wrapKey(
      'raw',
      symmetricKey,
      wrappingKey,
      {
        name: 'RSA-OAEP',
      },
    );

    const wrappedSymmetricKeyBase64: string =
      this.arrayBufferToBase64(wrappedSymmetricKey);

    return wrappedSymmetricKeyBase64;
  }

  private async unwrapSymmetricKey(
    wrappedSymmetricKeyBase64: string,
    unwrappingKey: CryptoKey,
  ): Promise<CryptoKey> {
    const wrappedSymmetricKey: ArrayBuffer = this.base64ToArrayBuffer(
      wrappedSymmetricKeyBase64,
    );

    const symmetricKey = await window.crypto.subtle.unwrapKey(
      'raw',
      wrappedSymmetricKey,
      unwrappingKey,
      {
        name: 'RSA-OAEP',
      },
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    );

    return symmetricKey;
  }
  /**
   * 対称鍵を同期する関数です。
   *
   * see: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#subjectpublickeyinfo_import
   */
  private async syncSymmetricKey(): Promise<void> {
    console.log('Syncing symmetric keys...');
    if (this.symmetricKey === null) {
      throw new Error('Symmetric key is not generated');
    }

    // 同期されていないデバイスの公開鍵を取得する
    const unsyncedPublicKeys: string[] =
      await this.actor.getUnsyncedPublicKeys();
    const symmetricKey = this.symmetricKey;
    const encryptedKeys: Array<[string, string]> = [];

    for (const unsyncedPublicKey of unsyncedPublicKeys) {
      const publicKey: CryptoKey = await window.crypto.subtle.importKey(
        'spki',
        this.base64ToArrayBuffer(unsyncedPublicKey),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['wrapKey'],
      );
      const wrappedSymmetricKeyBase64: string = await this.wrapSymmetricKey(
        symmetricKey,
        publicKey,
      );
      // 公開鍵と暗号化した対称鍵をペアにして保存します。
      encryptedKeys.push([unsyncedPublicKey, wrappedSymmetricKeyBase64]);
    }
    // `encryptedKeys`をバックエンドキャニスターにアップロードします。
    const result = await this.actor.uploadEncryptedSymmetricKeys(encryptedKeys);
    if ('Err' in result) {
      if ('UnknownPublicKey' in result.Err) {
        throw new Error('Unknown public key');
      }
      if ('DeviceNotRegistered' in result.Err) {
        throw new Error('Device not registered');
      }
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    // 1. new Uint8Array(buffer)で`buffer`の中身を一要素1バイトの配列に変換します。
    // 2. String.fromCharCode()で文字列に変換します。
    // // 文字コード（Uint8Arrayには文字が数値として格納されている）を文字（string型）として扱うためです。
    const stringData = String.fromCharCode(...new Uint8Array(buffer));
    console.log(`stringData: ${stringData}`); // TODO: delete
    // Base64エンコードを行います。
    return window.btoa(stringData);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Base64エンコーディングでエンコードされたデータの文字列をデコードします。
    const stringData = window.atob(base64);
    // 1. 一文字ずつ`charCodeAt()`で文字コードに変換します。
    // 2. `Uint8Array.from()`で配列に変換します。
    return Uint8Array.from(stringData, (dataChar) => dataChar.charCodeAt(0));
  }
}
