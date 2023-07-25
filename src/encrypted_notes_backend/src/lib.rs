use crate::devices::*;
use crate::notes::*;
use ic_cdk::api::caller as caller_api;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;

mod devices;
mod notes;

thread_local! {
    static DEVICES: RefCell<Devices> = RefCell::default();
    static NOTES: RefCell<Notes> = RefCell::default();
}

// 関数をコールしたユーザーPrincipalを取得します。
fn caller() -> Principal {
    let caller = caller_api();

    // 匿名のPrincipalを禁止します(ICキャニスターの推奨されるデフォルトの動作)。
    if caller == Principal::anonymous() {
        panic!("Anonymous principal is not allowed");
    }
    caller
}

fn is_caller_registered(caller: Principal) -> bool {
    DEVICES.with(|devices| devices.borrow().devices.contains_key(&caller))
}

#[update(name = "registerDevice")]
fn register_device(alias: DeviceAlias, public_key: PublicKey) -> RegisterDeviceResult {
    let caller = caller();

    DEVICES.with(|devices| {
        devices
            .borrow_mut()
            .register_device(caller, alias, public_key)
    })
}

#[query(name = "getDeviceAliases")]
fn get_device_aliases() -> Vec<DeviceAlias> {
    let caller = caller();
    assert!(is_caller_registered(caller));

    DEVICES.with(|devices| devices.borrow().get_device_aliases(caller))
}

#[update(name = "unregisterDevice")]
fn unregister_device(alias: DeviceAlias) {
    let caller = caller();
    assert!(is_caller_registered(caller));

    DEVICES.with(|devices| {
        devices.borrow_mut().unregister_device(caller, alias);
    })
}

#[query(name = "getNotes")]
fn get_notes() -> Vec<EncryptedNote> {
    let caller = caller();
    assert!(is_caller_registered(caller));

    NOTES.with(|notes| notes.borrow().get_notes(caller))
}

#[update(name = "addNote")]
fn add_note(encrypted_text: String) {
    let caller = caller();
    assert!(is_caller_registered(caller));

    NOTES.with(|notes| {
        notes.borrow_mut().add_note(caller, encrypted_text);
    })
}

#[update(name = "deleteNote")]
fn delete_note(id: u128) {
    let caller = caller();
    assert!(is_caller_registered(caller));

    NOTES.with(|notes| {
        notes.borrow_mut().delete_note(caller, id);
    })
}

#[update(name = "updateNote")]
fn update_note(new_note: EncryptedNote) {
    let caller = caller();
    assert!(is_caller_registered(caller));

    NOTES.with(|notes| {
        notes.borrow_mut().update_note(caller, new_note);
    })
}
