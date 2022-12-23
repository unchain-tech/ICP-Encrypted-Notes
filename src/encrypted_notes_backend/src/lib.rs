use crate::devices_store::*;
use crate::notes_store::*;
use crate::stores::{DEVICES_STORE, NOTES_STORE};
use ic_cdk::api::caller as caller_api;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;

mod devices_store;
mod notes_store;
mod stores;

// 匿名Principalでの関数コールをエラーにするためのユーザーチェック関数
//
// [panic!]
//  II認証を行なっていないユーザー
fn caller() -> Principal {
    let caller = caller_api();
    // The anonymous principal is not allowed to interact with canister.
    if caller == Principal::anonymous() {
        panic!("Anonymous principal not allowed to make calls.")
    }
    caller
}

// ユーザー（Principal）が登録されているかを確認する関数
//
// [return false]
//  register_device関数をコールしていないユーザー
fn is_user_registered(user: Principal) -> bool {
    DEVICES_STORE.with(|devices_store| devices_store.borrow().is_user_registered(user))
}

// 関数をコールしたユーザーを取得し、認証済みかどうかをチェックする関数
fn get_authed_user() -> Principal {
    let caller = caller();
    assert!(is_user_registered(caller));
    caller
}

#[query(name = "getDevices")]
fn get_devices() -> Vec<(DeviceAlias, PublicKey)> {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| devices_store.borrow().get_devices(caller))
}

#[update(name = "registerDevice")]
fn register_device(device_alias: DeviceAlias, public_key: PublicKey) -> bool {
    let caller = caller();
    // TODO: 登録されている`alias`と`public_key`の数をチェック

    DEVICES_STORE.with(|devices_store| {
        devices_store
            .borrow_mut()
            .register_device(caller, device_alias, public_key)
    })
}

#[update(name = "deleteDevice")]
fn delete_device(device_alias: DeviceAlias) {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| {
        devices_store
            .borrow_mut()
            .delete_device(caller, device_alias)
    })
}

#[query(name = "isSeed")]
fn is_seed() -> bool {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| devices_store.borrow().is_seed(caller))
}

#[update(name = "uploadSeedSecret")]
fn upload_seed_secret(
    public_key: PublicKey,
    encrypted_secret: EncryptedSecret,
) -> UploadSecretResult {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| {
        devices_store
            .borrow_mut()
            .upload_seed_secret(caller, public_key, encrypted_secret)
    })
}

#[update(name = "uploadEncryptedSecrets")]
fn upload_encrypted_secrets(keys: Vec<(PublicKey, EncryptedSecret)>) {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| {
        devices_store
            .borrow_mut()
            .upload_encrypted_secrets(caller, keys)
    })
}

#[query(name = "getUnsyncedPublicKeys")]
fn get_unsynced_public_keys() -> Vec<PublicKey> {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| devices_store.borrow().get_unsynced_public_keys(caller))
}

#[query(name = "getEncryptedSecrets")]
fn get_encrypted_secrets(public_key: PublicKey) -> GetSecretResult {
    let caller = get_authed_user();

    DEVICES_STORE.with(|devices_store| {
        devices_store
            .borrow()
            .get_encrypted_secrets(caller, public_key)
    })
}

#[query(name = "getNotes")]
fn get_notes() -> Vec<EncryptedNote> {
    let caller = get_authed_user();

    NOTES_STORE.with(|notes_store| notes_store.borrow().get_notes(caller))
}

#[update(name = "addNote")]
fn add_note(encrypted_text: String) -> u128 {
    let caller = get_authed_user();

    // TODO: Stringの文字数をチェック

    NOTES_STORE.with(|notes_store| notes_store.borrow_mut().add_note(caller, encrypted_text))
}

#[update(name = "updateNote")]
fn update_note(update_id: u128, update_text: String) {
    let caller = get_authed_user();
    // TODO: Stringの文字数をチェック

    NOTES_STORE.with(|notes_store| {
        notes_store
            .borrow_mut()
            .update_note(caller, update_id, update_text)
    });
}

#[update(name = "deleteNote")]
fn delete_note(delete_id: u128) {
    let caller = get_authed_user();

    NOTES_STORE.with(|notes_store| notes_store.borrow_mut().delete_note(caller, delete_id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unregistered_user() {
        let res = is_user_registered(Principal::anonymous());
        assert!(!res);
    }
}
