import { v4 as uuidv4 } from 'uuid';

import { loadKey, storeKey, clearKeys } from './keyStorage';
import { User } from "../types/data";

export class CryptoService {
  constructor(loginUser: User) {
    this.loginUser = loginUser

    // ステップ1. デバイスエイリアスを設定する
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

  private loginUser: User // 現在ログインしているユーザーに関する情報を持つ変数。コンストラクタの引数として渡される。
  private secretKey: CryptoKey | undefined = undefined
  private secretKeyBase64: string | undefined = undefined // CryptoKey型のsecretKeyをstring型に変換したもの。
  private privateKey: CryptoKey | undefined = undefined
  private publicKey: CryptoKey | undefined = undefined
  private publicKeyBase64: string | undefined = undefined // CryptoKey型のpublickeyをstring型に変換したもの。バックエンドに実際に保存される変数。
  private intervalHandler: number | undefined = undefined // キーを同期するための処理を呼び出すインターバルを設定するための変数
  public readonly deviceAlias: string; // constructor実行時に設定されるため、readonly

  public async init(): Promise<boolean> {
    // ステップ2. キーペアを設定する
    this.publicKey = await loadKey('public');
    this.privateKey = await loadKey('private')

    // データベースに鍵がない場合、生成する
    if (this.publicKey == undefined || this.privateKey == undefined) {
      await this.initializeKeys();
    }

    this.publicKeyBase64 = await this.exportCryptoKey("spki", this.publicKey!)

    // ステップ3. デバイス情報として、デバイスエイリアスとPublic Keyをバックエンドに保存する
    try {
      // デバイスの登録
      await this.loginUser.actor.registerDevice(this.deviceAlias, this.publicKeyBase64)
    } catch (err) {
      alert(`Error registerDevice(): ${err}`)
    }

    // このユーザーデバイスが最初のデバイスであるかどうかを確認する
    const isSeed = await this.loginUser.actor.isSeed()
    if (isSeed) {
      // ステップ4. 最初に登録されたデバイスはseedとなるSecret Keyを生成する
      console.log('generate seed')

      await this.generateSecretKey(this.publicKey)

      this.secretKeyBase64 = await this.exportCryptoKey("raw", this.secretKey)
      // console.log(`this.secretKeyBase64: ${this.secretKeyBase64}`) // TODO delete

      // secretKeyBase64をラップ（暗号化）する
      const wrappedKey = await this.wrapCryptoKey(this.secretKey, this.publicKey)

      // string型に変換する
      const wrappedKeyAsString = CryptoService.ab2str(wrappedKey)
      // console.log(`wrappedKeyAsString: ${wrappedKeyAsString}`)//TODO delete

      const wrappedKeyAsBase64 = window.btoa(wrappedKeyAsString)
      console.log(`wrappedKeyAsBase64: ${wrappedKeyAsBase64}`)//TODO delete

      // キーを保存
      try {
        await this.loginUser.actor.uploadSeedSecret(this.publicKeyBase64, wrappedKeyAsBase64)
        console.log("seed uploaded")
      } catch (error) {
        alert(error)
      }

      // ステップ5. バックエンドに保存されたpublicKeyの同期処理を実行する
      if (this.intervalHandler === undefined) {
        this.intervalHandler = window.setInterval(
          () => {
            console.log("Call setInterval Handler")
            this.synchronize()
          },
          5000
        )
      }
      return true
    } else {
      // ステップ6. 同期された鍵を受け取る
      return await this.existsSynchronizedKey()
    }
  }

  public async pollForSynchronize() {
    return await this.existsSynchronizedKey()
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

    // クラスのプロパティへ保存する
    this.publicKey = keyPair.publicKey
    this.privateKey = keyPair.privateKey
  }

  private async generateSecretKey(publicKey: CryptoKey | undefined) {
    if (publicKey === undefined) {
      throw new Error("Undefined publicKey")
    }

    const secretKey: CryptoKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    )

    this.secretKey = secretKey
  }

  // キーをエクスポートします。
  // （CryptoKeyオブジェクトを入力として受け取り、そのキーを外部のポータブルなフォーマットで提供します。）
  // 参照: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey
  private async exportCryptoKey(format: "raw" | "spki", key: CryptoKey | undefined) {
    if (key === undefined) {
      throw new Error("Undefined key")
    }
    const exported = await window.crypto.subtle.exportKey(
      format,
      key
    );

    // string型に変換する
    const exportedAsString = CryptoService.ab2str(exported)
    console.log(`exportedAsString: ${exportedAsString}`)//TODO delete

    const exportedAsBase64 = window.btoa(exportedAsString)
    console.log(`exportedAsBase64: ${exportedAsBase64}`)//TODO delete

    return exportedAsBase64
  }

  // 鍵を外部のポータブルなフォーマットでエクスポートし、エクスポートした鍵を暗号化する。
  // 鍵をラップすることにより、保護されていないデータストア内や保護されていないネットワーク上での送信など、信頼できない環境で鍵を保護することができます。
  // 参照: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/wrapKey
  private async wrapCryptoKey(keyToWrap: CryptoKey | undefined, wrappingKey: CryptoKey | undefined) {
    if (keyToWrap === undefined) {
      throw new Error("Undefined keyToWrap")
    }
    if (wrappingKey === undefined) {
      throw new Error("Undefined wrappingKey")
    }

    return window.crypto.subtle.wrapKey("raw", keyToWrap, wrappingKey, { name: 'RSA-OAEP' })
  }

  private async synchronize() {
    console.log("Synchronizing keys...")

    const secretKey = this.secretKey
    if (secretKey === undefined) {
      throw new Error("Undefined secretKey")
    }

    // バックエンドから、まだ同期されていないPublicKeyを取得する
    const unsyncedPublicKeys = this.loginUser.actor.getUnsyncedPublicKeys()
    const secrets: Array<[string, string]> = []

    for (const key of unsyncedPublicKeys) {
      // 外部のポータブルな形式の鍵を入力として受け取り、Web Crypto APIで使用できるCryptoKeyオブジェクトを返す
      // 第一引数：format
      // 第二引数：keyData. ArrayBuffer, TypedArray, DataView, またはJSONWebKeyオブジェクトである必要がある
      // 第三引数：algorithm. インポートする鍵の種類を定義し、アルゴリズム固有の追加パラメータを提供するオブジェクト
      // 第四引数：extractable. SubtleCrypto.exportKey()またはSubtleCrypto.wrapKey() を使用して鍵をエクスポートできるかどうかを示すboolean
      // 第五引数：keyUsages. そのキーで何ができるかを示すArray
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        CryptoService.str2ab(window.atob(key)),
        {
          name: 'RSA-OAEP',
          hash: { name: 'SHA-256' },
        },
        true,
        ['wrapKey']
      )

      // secretKeyBase64をラップ（暗号化）する
      const wrappedKey = await this.wrapCryptoKey(publicKey, secretKey)

      // string型に変換する
      const wrappedKeyAsString = CryptoService.ab2str(wrappedKey)
      // console.log(`wrappedKeyAsString: ${wrappedKeyAsString}`)//TODO delete

      const wrappedKeyAsBase64 = window.btoa(wrappedKeyAsString)
      // console.log(`wrappedKeyAsBase64: ${wrappedKeyAsBase64}`)//TODO delete

      const publicKeyBase64 = await this.exportCryptoKey("spki", publicKey!)

      // キーを保存
      secrets.push([publicKeyBase64, wrappedKeyAsBase64])
      // ---- 書き換え

      // "uploadEncryptedSecrets": (vec record {PublicKey; EncryptedSecret;}) -> ();
      // バックエンドキャニスターにアップロード
      await this.loginUser.actor.uploadEncryptedSecrets(secrets)
    }
  }

  private async existsSynchronizedKey(): Promise<boolean> {
    const wrappedSecret = await this.loginUser.actor.getEncryptedSecrets(this.publicKeyBase64)

    if ('Ok' in wrappedSecret) {
      console.log(`in existsSynchronizedKey OK: ${wrappedSecret.Ok}`)// TODO: delete
      console.log('existing device && already seeded -> loading seed')
      await this.unwrapSecret(wrappedSecret.ok) // TODO: ここでatobのエラーが発生してコケるので修正する

      if (this.intervalHandler === null) {
        this.intervalHandler = window.setInterval(
          () => this.synchronize(),
          5000
        )
      }
      return true
    }
    console.log(`in existsSynchronizedKey Err: ${wrappedSecret.Err}`)// TODO: delete
    return false
  }

  private async unwrapSecret(wrappedSecret: string) {
    console.log(`===== Call unwrapSecret =====`) //TODO: delete
    if (this.privateKey === undefined) {
      throw new Error("Undefined privateKey")
    }

    const unwrappedSecret = await window.crypto.subtle.unwrapKey(
      'raw',
      CryptoService.str2ab(window.atob(wrappedSecret)),
      this.privateKey,
      {
        name: 'RSA-OAEP',
      },
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )

    this.secretKey = unwrappedSecret;
    const buffer = await window.crypto.subtle.exportKey('raw', unwrappedSecret);
    this.secretKeyBase64 = window.btoa(CryptoService.ab2str(buffer));
    console.log('Shared secret unwrapped');
  }

  // ArrayBufferをstringに変換する
  private static ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))
  }

  // stringをArrayBufferに変換する
  private static str2ab(str: string) {
    const buf = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buf)

    for (let i = 0, strLen = str.length; i < strLen; i++) {
      // 文字のUnicode値を返す
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }
}