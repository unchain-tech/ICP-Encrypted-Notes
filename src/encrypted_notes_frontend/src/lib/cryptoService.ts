import { v4 as uuidV4 } from 'uuid';
import { User } from '../types/data';

import { GetSecretResult, EncryptedSecret, SecretError } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { loadKey, storeKey } from './keyStorage';

export class CryptoService {
  static readonly INIT_VECTOR_VALUE = 12;
  private deviceAlias: string | null = null;
  private loginUser: User;
  private publicKey: CryptoKey | undefined = undefined;
  private privateKey: CryptoKey | undefined = undefined;
  private symmetricKey: CryptoKey | undefined = undefined;

  /** ステップ4: constructorとinit関数の定義 */
  constructor(loginUser: User) {
    this.loginUser = loginUser;
  }

  // デバイスエイリアスとキーを生成する
  public async init(): Promise<void> {
    /**
     * window.localStorageはstring型のデータを扱うことができ、
     * かつもうひとつデータベースを作成するのが手間なので、
     * 今回deviceAliasはwindow.localStorageに保存する。
     *  */
    // ローカルストレージからデバイスエイリアスを取得し、存在しない場合は生成する。
    try {
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
      const exportedPublicKey = await window.crypto.subtle.exportKey('spki', this.publicKey);
      const encodedPublicKey = this.arrayBufferToBase64(exportedPublicKey);

      // デバイスエイリアスとPublicKeyをバックエンドキャニスターに保存する
      const result = await this.loginUser.actor.registerDevice(this.deviceAlias, encodedPublicKey);
      if (result) {
        console.log(`registerDevice result: ${result}`);
      } else {
        console.log(`Already registered!`);
      }

      // 親デバイスとなる場合、対称鍵を作成する
      const isSeed = await this.loginUser.actor.isSeed();
      console.log(`isSeed: ${isSeed}`); // TODO: delete
      if (isSeed) {
        this.symmetricKey = await this.generateSymmetricKey();
        // symmetricKeyを自身のpublicKeyで暗号化をする
        const encryptedSymmetricKey = await this.encryptSymmetricKey(this.symmetricKey, this.publicKey);
        console.log(`encrypted: ${encryptedSymmetricKey}`); // TODO: delete
        // Base64に変換する
        const encodedEncryptedSymmetricKey = this.arrayBufferToBase64(encryptedSymmetricKey);

        const result = await this.loginUser.actor.uploadSeedSecret(encodedPublicKey, encodedEncryptedSymmetricKey);
        console.log(`uploadSeedSecret: ${result}`);
        alert('Uploaded encrypted symmetricKey.');
      } else {
        console.log('Synchronize key...');

        /** ステップ5: 鍵の同期処理 */
        // 以下の処理は、isSeedと最初に認定されたブラウザ上でのみ有効の臨時処理（ノートの暗号化・復号をテストするため）
        // ステップ5のTODOを実装する必要がある。また、そのTODOが実装出来次第、削除する
        const encryptedSymmetricKey: GetSecretResult = await this.loginUser.actor.getEncryptedSecrets(encodedPublicKey);
        if ('Err' in encryptedSymmetricKey) {
          if ('Unknown' in encryptedSymmetricKey.Err) {
            alert('Unknown user');
            return;
          }
          if ('NotSynced' in encryptedSymmetricKey.Err) {
            alert('Not Synced');
            return;
          }
        }
        if ('Ok' in encryptedSymmetricKey) {
          const decodedEncryptedSymmetricKey: ArrayBuffer = this.base64ToArrayBuffer(encryptedSymmetricKey.Ok);

          // 暗号化されたSymmetricKeyを復号する
          this.symmetricKey = await this.decryptSymmetricKey(decodedEncryptedSymmetricKey, this.privateKey);
        }
        // TODO: 鍵の同期処理を行う
        // バックエンドキャニスターに保存されている時
        // 取得->自身の所有するprivateKeyで復号する->メンバ変数にセットする

        // バックエンドキャニスターに保存されていない時
        // // 親デバイスによる鍵の同期処理を待つ必要がある
      }
    } catch (error) {
      console.error(error)
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

  /** ステップ3: ノートの暗号化・復号 */
  // 対称鍵でノートを暗号化する
  async encryptNote(note: string): Promise<string> {
    console.log(`=== in encryptNote ===`); // TODO: delete
    if (!this.symmetricKey) {
      throw new Error("Not found Symmetric Key.");
    }

    // 12バイトの初期化ベクター（IV）を生成する。
    // 同じ鍵で複数回の暗号化操作を行う際に、それぞれの暗号文が異なるようにするために使用される。
    const iv = window.crypto.getRandomValues(new Uint8Array(CryptoService.INIT_VECTOR_VALUE));

    // 引数で受け取った文字列を、ArrayBufferに変換する。
    // TextEncoderを使ってUTF-8でエンコードする。
    const encoder = new TextEncoder();
    const encodedNote = encoder.encode(note);


    // 対称鍵を使って、テキストデータを暗号化する
    const encryptedNote = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      this.symmetricKey,
      encodedNote,
    );

    console.log(`iv.byteLength: ${iv.byteLength}`);
    console.log(`encryptedNote.byteLength: ${encryptedNote.byteLength}`);
    // テキストデータとIVを連結して（IVは、復号時に再度利用されるため）ArrayBufferに保存されたものを変換して返す。
    // ArrayBufferをstringに変換する
    const decodedIv = this.arrayBufferToBase64(iv);
    const decodedEncryptedNote = this.arrayBufferToBase64(encryptedNote);

    console.log(`decodedIv: ${decodedIv}`); // TODO: delete
    console.log(`decodedEncryptedNote: ${decodedEncryptedNote}`); // TODO: delete
    return decodedIv + decodedEncryptedNote;
  }

  // 対称鍵で暗号化されたノートを復号する
  async decryptNote(data: string): Promise<string> {
    console.log(`=== in decryptNote ===`); // TODO: delete

    if (!this.symmetricKey) {
      throw new Error("Not found Symmetric Key.");
    }

    // 取得したデータをIVとノートデータに分ける
    const base64IvLength = (CryptoService.INIT_VECTOR_VALUE / 3) * 4;
    const decodedIv = data.slice(0, base64IvLength);
    const decodedEncryptedNote = data.slice(base64IvLength);
    console.log(`decodedIv: ${decodedIv}`); // TODO: delete
    console.log(`decodedEncryptedNote: ${decodedEncryptedNote}`); // TODO: delete

    // 一文字ずつcharCodeAtでUnicode値に変換し、その値をUint8Arrayに格納する
    const encodedIv = this.base64ToArrayBuffer(decodedIv);
    console.log(`encodedIv.toString(): ${encodedIv.toString()}`); // TODO: delete
    console.log(`encodedIv.byteLength: ${encodedIv.byteLength}`); // TODO: delete

    const encodedNote = this.base64ToArrayBuffer(decodedEncryptedNote);
    console.log(`encodedNote.toString(): ${encodedNote.toString()}`); // TODO: delete
    console.log(`encodedNote.byteLength: ${encodedNote.byteLength}`); // TODO: delete
    /** */

    const decryptedNote = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encodedIv,
      },
      this.symmetricKey,
      encodedNote
    );
    console.log(`decryptedNote.byteLength: ${decryptedNote.byteLength}`); // TODO: delete

    const decoder = new TextDecoder();
    const decodedDecryptedNote = decoder.decode(decryptedNote);
    console.log(`decodedDecryptedNote: ${decodedDecryptedNote}`); // TODO: delete

    return decodedDecryptedNote;
  }

  /**
   * 参考：
   * Convert an ArrayBuffer into a string
   * from https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
   */
  private arrayBufferToBase64(arrayBufferData: ArrayBuffer): string {
    // ステップ１：new Uint8Array()でArrayBufferの中身を一要素１バイトの配列にする。
    // ステップ２：文字コード（Uint8Arrayには文字が数値として格納されている）を文字（string）として扱うために、String.fromCharCodeで変換をする。
    const stringData = String.fromCharCode(...new Uint8Array(arrayBufferData));
    // Base64エンコードを行う。
    return window.btoa(stringData);
  }

  private base64ToArrayBuffer(base64Data: string): ArrayBuffer {
    // Base64エンコードされたデータを、バイトにデコード→デコードしたバイトを文字列にエンコードする。
    const stringData = window.atob(base64Data);
    // 一文字ずつcharCodeAt()でUnicode値に変換し、その値をUint8Arrayに格納する。
    return Uint8Array.from(stringData, dataChar => dataChar.charCodeAt(0));
  }
}
