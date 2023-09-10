import { ActorSubclass } from '@dfinity/agent';

import {
  _SERVICE,
} from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';

export class CryptoService {
  static readonly INIT_VECTOR_LENGTH = 12;
  private actor: ActorSubclass<_SERVICE>;
  private intervalId: number | null = null;
  private publicKey: CryptoKey | null;
  private privateKey: CryptoKey | null;
  private symmetricKey: CryptoKey | null;
  private exportedPublicKeyBase64: string | null;
  public readonly deviceAlias: string;

  /** STEP4: コンストラクタを定義します。 */
  constructor() {

  }

  public async init(): Promise<boolean> {
    /** STEP6: 公開鍵・秘密鍵を生成します。 */

    /** STEP8: デバイスデータを登録します。 */

    /** STEP9: 対称鍵を生成します。 */

    return true;
  }

  public async clearDeviceData(): Promise<void> {
    if (this.intervalId !== null) {
      // インターバルを停止します。
      window.clearInterval(this.intervalId);
      // インターバルIDを初期化します。
      this.intervalId = null;
    }

    // ストレージからデバイスデータを削除します。

    // CryptoServiceクラスのメンバー変数を初期化します。
    this.publicKey = null;
    this.privateKey = null;
    this.symmetricKey = null;
    this.exportedPublicKeyBase64 = null;
  }

  public async decryptNote(data: string): Promise<string> {
    if (this.symmetricKey === null) {
      throw new Error('Not found symmetric key');
    }

    /** 復号処理を実装します。 */

    return data;
  }

  public async encryptNote(data: string): Promise<string> {
    if (this.symmetricKey === null) {
      throw new Error('Not found symmetric key');
    }

    /** 暗号化処理を実装します。 */

    return data;
  }

  public async trySyncSymmetricKey(): Promise<boolean> {
    /** 対称鍵が同期されているか確認します。 */

    const syncedSymmetricKey = { Err: 'dummy', };
    if ('Err' in syncedSymmetricKey) {
      /** エラー処理を行います。 */
      return false;
    } else {
      /** 暗号化された対称鍵を取得して復号します。 */
      return true;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    // 1. new Uint8Array(buffer)で`buffer`の中身を一要素1バイトの配列に変換します。
    // 2. String.fromCharCode()で文字列に変換します。
    // // 文字コード（Uint8Arrayには文字が数値として格納されている）を文字（string型）として扱うためです。
    const stringData = String.fromCharCode(...new Uint8Array(buffer));
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

  private async syncSymmetricKey(): Promise<void> {
    console.log('Syncing symmetric keys...');
    if (this.symmetricKey === null) {
      throw new Error('Symmetric key is not generated');
    }

    // 暗号化された対称鍵を持たない公開鍵一覧を取得します。
    const unsyncedPublicKeys: string[] = [];
    const symmetricKey = this.symmetricKey;
    const encryptedKeys: Array<[string, string]> = [];

    // 自身が保有する対称鍵を公開鍵で暗号化します。
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
      // 公開鍵と暗号化された対称鍵をペアにして保存します。
      encryptedKeys.push([unsyncedPublicKey, wrappedSymmetricKeyBase64]);
    }
    // 公開鍵と暗号化された対称鍵のペアをアップロードします。
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
}