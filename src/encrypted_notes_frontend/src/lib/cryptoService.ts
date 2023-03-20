import { v4 as uuidV4 } from 'uuid';
import { User } from '../types/data';

import { loadKey, storeKey } from './keyStorage';

export class CryptoService {
  private deviceAlias: string | null = null;
  private loginUser: User;
  private publicKey: CryptoKey | undefined = undefined;
  private privateKey: CryptoKey | undefined = undefined;

  /** ステップ4: constructorとinit関数の定義 */
  constructor(loginUser: User) {
    this.loginUser = loginUser;
    //   // デバイス名を取得
    //   // const deviceAlias = window.localStorage.getItem('deviceAlias');
    //   if (deviceAlias) {
    //     this.deviceAlias = deviceAlias;
    //   } else {
    //     this.deviceAlias = uuidV4();
    //     window.localStorage.setItem('deviceAlias', this.deviceAlias);
    //   }
    //   console.log('deviceAlias: ' + this.deviceAlias);
  }

  // デバイスエイリアスとキーを生成する
  public async init(): Promise<void> {
    /**
     * window.localStorageはstring型のデータを扱うことができ、
     * かつもうひとつデータベースを作成するのが手間なので、
     * 今回deviceAliasはwindow.localStorageに保存する。
     *  */
    // ローカルストレージからデバイスエイリアスを取得し、存在しない場合は生成する。
    // TODO: この部分の処理は、必要があればconstructorに移動する
    this.deviceAlias = window.localStorage.getItem('deviceAlias');
    if (!this.deviceAlias) {
      this.deviceAlias = uuidV4();
      window.localStorage.setItem('deviceAlias', this.deviceAlias);
    }
    console.log(`deviceAlias: ${this.deviceAlias}`);// TODO: delete

    // キーペアをデータベースから取得し、存在しない場合は生成する。
    this.publicKey = await loadKey('publicKey');
    this.privateKey = await loadKey('privateKey');
    if (!this.publicKey || !this.privateKey) {
      const keyPair: CryptoKeyPair = await this.generateKeyPair();

      await storeKey('publicKey', keyPair.publicKey);
      await storeKey('privateKey', keyPair.privateKey);

      this.publicKey = keyPair.publicKey;
      this.privateKey = keyPair.privateKey;
    }

    // publicKeyをexportしてBase64に変換する
    const exported = await window.crypto.subtle.exportKey('spki', this.publicKey);
    const convertedPublicKey = this.arrayBufferToBase64(exported);

    // 親デバイスとなる場合、対称鍵を作成する
    const isSeed = await this.loginUser.actor.isSeed();
    console.log(`isSeed: ${isSeed}`); // TODO: delete
    if (isSeed) {
      const symmetricKey: CryptoKey = await this.generateSymmetricKey();
      // symmetricKeyを自身のpublicKeyで暗号化をする
      const encrypted = await this.encryptSymmetricKey(symmetricKey, this.publicKey);
      console.log(`encrypted: ${encrypted}`); // TODO: delete
      // Base64に変換する
      const convertedEncryptedSymmetricKey = this.arrayBufferToBase64(encrypted);

      const result = await this.loginUser.actor.uploadSeedSecret(convertedPublicKey, convertedEncryptedSymmetricKey);
      console.log(`uploadSeedSecret: ${result}`);
    }

    // デバイスエイリアスとPublicKeyをバックエンドキャニスターに保存する
    const result = await this.loginUser.actor.registerDevice(this.deviceAlias, convertedPublicKey);
    if (result.Ok) {
      console.log(`registerDevice result: ${result.Ok}`);
    } else {
      alert(`${Object.keys(result.Err)[0]}`);
    }
  }

  /** ステップ1: 鍵の生成 */
  private async generateSymmetricKey(): Promise<CryptoKey> {
    const symmetricKey = await window.crypto.subtle.generateKey(
      {
        // キー生成のアルゴリズムを指定
        name: "AES-GCM",
        // キー長
        length: 256,
      },
      // キーを抽出可能（バイト配列としてエクスポートできる）とする
      true,
      // キーがサポートする使用法
      ["encrypt", "decrypt"]
    );
    return symmetricKey;
  }

  private async generateKeyPair(): Promise<CryptoKeyPair> {
    console.log(`=== generateKeyPair ===`);// TODO: delete
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        // キー長
        modulusLength: 2048,
        // 公開指数（65537 == 0x010001）
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        // ハッシュアルゴリズム
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    console.log(`in generateKeyPair: ${keyPair}`);// TODO: delete
    return keyPair;
  }

  /** ステップ2: 鍵の暗号化・復号 */

  // 対称鍵を公開鍵で暗号化する
  private async encryptSymmetricKey(symmetricKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
    // 対称鍵をバイト配列としてCryptoKeyオブジェクトから取り出す
    const exportedKey = await window.crypto.subtle.exportKey(
      "raw", // フォーマットを指定
      symmetricKey
    );
    // 公開鍵を使って、エクスポートされた対称鍵を暗号化
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      exportedKey
    );
    return encryptedKey;
  }

  // 暗号化された対称鍵を秘密鍵で復号する
  private async decryptSymmetricKey(encryptedKey: ArrayBuffer, privateKey: CryptoKey): Promise<CryptoKey> {
    // 秘密鍵と暗号化された対称鍵を使って復号を行う
    const decryptedKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP", // 暗号化に使用したRSA-OAEPアルゴリズムを指定
      },
      privateKey,
      encryptedKey
    );

    // バイト配列の復号された鍵データをCryptoKeyオブジェクトに変換(import)する
    const symmetricKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
    return symmetricKey;
  }

  /** ステップ3: メモの暗号化・復号 */
  // 対称鍵でメモを暗号化する
  async encryptMemo(symmetricKey: CryptoKey, memoText: string): Promise<ArrayBuffer> {
    // 12バイトの初期化ベクター（IV）を生成する。
    // 同じ鍵で複数回の暗号化操作を行う際に、それぞれの暗号文が異なるようにするために使用される。
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    // 対称鍵を使って、テキストデータを暗号化する
    const encryptedMemo = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      symmetricKey,
      encoder.encode(memoText)
    );
    return encryptedMemo; // メモとIVを連結してArrayBufferに保存している
  }


  // 対称鍵で暗号化されたメモを復号する
  async decryptMemo(symmetricKey: CryptoKey, encryptedMemo: ArrayBuffer): Promise<string> {
    // encryptedMemoの最初の12バイトをIVとして抽出する。これをもとにデータを復号する
    const iv = new Uint8Array(encryptedMemo, 0, 12);
    // ArrayBuffer形式のデータを文字列に変換するために使用
    const decoder = new TextDecoder();
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      symmetricKey,
      encryptedMemo
    );
    return decoder.decode(decryptedData);
  }

  private arrayBufferToBase64(key: ArrayBuffer): string {
    const keyAsString = this.ab2str(key);
    console.log(`exportedAsString: ${keyAsString}`); // TODO: delete
    const keyAsBase64 = window.btoa(keyAsString);
    console.log(`exportedAsBase64: ${keyAsBase64}`); // TODO: delete

    return keyAsBase64;
  }

  /**
   * Convert an ArrayBuffer into a string
   * from https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
   */
  private ab2str(buf: ArrayBuffer): string {
    return String.fromCharCode.apply(undefined, Array.from(new Uint8Array(buf)));
  }
}
