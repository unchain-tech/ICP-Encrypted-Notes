import { v4 as uuidv4 } from 'uuid';

import { loadKey, storeKey, clearKeys } from './keyStorage';
import { User } from "../types/data";

export class CryptoService {
  constructor(private loginUser: User) {
    const deviceAlias = window.localStorage.getItem('deviceAlias')

    if (deviceAlias) {
      this.deviceAlias = deviceAlias
    } else {
      // ローカルストレージに`deviceAlias`が保存されていなかった場合、新たに生成する
      this.deviceAlias = uuidv4()
      window.localStorage.setItem('deviceAlias', this.deviceAlias)
    }
    console.log(`deviceAlias: ${this.deviceAlias}`)
  }

  private secretKey: CryptoKey | undefined = undefined;
  private secret: string | undefined = undefined;
  private privateKey: CryptoKey | undefined = undefined;
  private publicKey: CryptoKey | undefined = undefined;
  private publicKeyBase64: string | undefined = undefined;
  // constructor実行時に設定されるため、readonly
  public readonly deviceAlias: string;

  public async init(): Promise<boolean> {
    this.publicKey = await loadKey('public');
    this.privateKey = await loadKey('private')

    // データベースに鍵がない場合、生成する
    if (this.publicKey == undefined || this.privateKey == undefined) {
      await this.initializeKeys();
    }

    this.publicKeyBase64 = await this.exportCryptoKey(this.publicKey!)

    try {
      // デバイスの登録
      await this.loginUser.actor.registerDevice(this.deviceAlias, this.publicKeyBase64)
    } catch (err) {
      alert(`Error registerDevice(): ${err}`)
    }

    // TODO: is_seedを実行する

    return true
  }

  // crypto.subtle.generateKey:
  // https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/generateKey
  private async initializeKeys() {
    console.log("Local store does not exists, generating keys");

    // console.log(`isSecure: ${window.isSecureContext}`) // TODO delete

    // RSA-OAEP の暗号化用鍵ペアを生成する
    // 第一引数(algorithm: object) 生成する鍵の種類を指定し、アルゴリズム固有の追加パラメータを与える
    // 第二引数(extractable: boolean) SubtleCrypto.exportKey() (en-US) や SubtleCrypto.wrapKey() (en-US) を用いて鍵を取り出すことができるかを表す
    // 第三引数(keyUsages: array) 新しく生成する鍵で何ができるかを表す
    //
    // NOTE: generateKeyは安全とみなされるcontext以外では実行できない（undefined）ので、
    // 必ず`http://localhost`で確認すること。
    // 参考：https://developer.mozilla.org/ja/docs/Web/Security/Secure_Contexts
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        // Consider using a 4096-bit key for systems that require long-term security
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    )

    // 生成した鍵を保存する
    await storeKey('public', keyPair.publicKey)
    await storeKey('private', keyPair.privateKey)

    // クラスのメンバへ保存する
    this.publicKey = keyPair.publicKey
    this.privateKey = keyPair.privateKey
  }

  // 参照: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey
  private async exportCryptoKey(key: CryptoKey) {
    const exported = await window.crypto.subtle.exportKey(
      "spki",
      key
    );

    // string型に変換する
    const exportedAsString = this.ab2str(exported)
    console.log(`exportedAsString: ${exportedAsString}`)//TODO delete

    const exportedAsBase64 = window.btoa(exportedAsString)
    console.log(`exportedAsBase64: ${exportedAsBase64}`)//TODO delete

    return exportedAsBase64
  }

  // ArrayBufferをstringに変換する
  private ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))
  }
}