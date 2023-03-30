use candid::CandidType;
use ic_cdk::export::Principal;
use std::collections::HashMap;

#[derive(CandidType, Clone, Debug)]
pub struct EncryptedNote {
    pub id: u128,
    pub encrypted_text: String,
}

#[derive(Default)]
pub struct NotesStore {
    // TODO: Vec<EncryptedNote>をHashMap<id, string>にした方が良い
    pub notes_store: HashMap<Principal, Vec<EncryptedNote>>,
    pub id: u128,
}

impl NotesStore {
    pub fn get_notes(&self, caller: Principal) -> Vec<EncryptedNote> {
        self.notes_store.get(&caller).cloned().unwrap_or_default()
    }

    pub fn get_note(&self, caller: Principal, id: u128) -> EncryptedNote {
        self.notes_store
            .get(&caller)
            .cloned()
            .unwrap_or_default()
            .get(id as usize)
            .cloned()
            .expect("Not Found")
    }

    pub fn add_note(&mut self, caller: Principal, encrypted_text: String) -> u128 {
        let id = self.id;
        self.id += 1;

        let user_notes = self
            .notes_store
            .get_mut(&caller)
            .expect("No user is registered.");

        // TODO: Userが所有するノート数をチェック

        // IDとテキストを追加する
        user_notes.push(EncryptedNote { id, encrypted_text });

        // 追加したノートのIDを返す
        id
    }

    pub fn update_note(&mut self, caller: Principal, update_id: u128, update_text: String) {
        let user_notes = self
            .notes_store
            .get_mut(&caller)
            .expect("No user is registered.");

        // 更新したいノートをIDで探す
        if let Some(current_note) = user_notes
            .iter_mut()
            .find(|current_note| current_note.id == update_id)
        {
            // テキストを更新する
            current_note.encrypted_text = update_text;
        }
    }

    pub fn delete_note(&mut self, caller: Principal, delete_id: u128) {
        self.notes_store
            .get_mut(&caller)
            .expect("No user is registered.")
            .retain(|item| item.id != delete_id);
    }

    pub fn assign_note(&mut self, caller: Principal) {
        self.notes_store.insert(caller, vec![]);
    }

    pub fn has_note(&self, caller: Principal) -> bool {
        self.notes_store.contains_key(&caller)
    }
}
