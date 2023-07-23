use crate::notes::*;
use ic_cdk::api::caller as caller_api;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;

mod notes;

thread_local! {
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

#[query(name = "getNotes")]
fn get_notes() -> Vec<EncryptedNote> {
    let caller = caller();
    NOTES.with(|notes| notes.borrow().get_notes(caller))
}

#[update(name = "addNote")]
fn add_note(encrypted_text: String) {
    let caller = caller();
    NOTES.with(|notes| {
        notes.borrow_mut().add_note(caller, encrypted_text);
    })
}

#[update(name = "deleteNote")]
fn delete_note(id: u128) {
    let caller = caller();
    NOTES.with(|notes| {
        notes.borrow_mut().delete_note(caller, id);
    })
}

#[update(name = "updateNote")]
fn update_note(new_note: EncryptedNote) {
    let caller = caller();
    NOTES.with(|notes| {
        notes.borrow_mut().update_note(caller, new_note);
    })
}
