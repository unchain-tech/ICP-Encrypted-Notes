import { DBSchema, openDB } from 'idb'

// データベースの型を定義
// objectStoreの名前をキーとするinterfaceでDBSchemaを拡張する
// https://github.com/jakearchibald/idb#typescript
interface KeyStorage extends DBSchema {
  'keys': {
    key: string;
    value: CryptoKey;
  };
}

// データベースを開く
const db = openDB<KeyStorage>('crypto-store', 1, {
  upgrade(db) {
    db.createObjectStore('keys');
  },
});

// keysストアに値を保存
export async function storeKey(key: string, value: CryptoKey) {
  return (await db).put('keys', value, key)
}

// 値をkeysストアから取得
export async function loadKey(key: string) {
  return (await db).get('keys', key)
}

// keysストアから値を削除
export async function clearKeys() {
  return (await db).clear('keys')
}