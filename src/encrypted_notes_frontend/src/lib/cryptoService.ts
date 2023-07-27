import { ActorSubclass } from '@dfinity/agent';
import { v4 as uuidV4 } from 'uuid';

import { _SERVICE } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';

export class CryptoService {
  private actor: ActorSubclass<_SERVICE>;
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
  // TODO: 鍵の生成・同期処理を実装する際に、戻り値を`bool`にする
  public async init(): Promise<void> {
    /** STEP2: デバイスデータの登録*/
    // バックエンドキャニスターにデバイスエイリアスを登録します。
    await this.actor.registerDevice(this.deviceAlias, 'dummyPublicKey');
  }

  /** STEP3: デバイスデータの削除 */
  public async clearDeviceData(): Promise<void> {
    window.localStorage.removeItem('deviceAlias');
    // TODO: データベース内の鍵の削除を実装する
  }
}
