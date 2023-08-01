use candid::CandidType;
use ic_cdk::export::Principal;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::Entry;
use std::collections::HashMap;

pub type DeviceAlias = String;
pub type PublicKey = String;
pub type EncryptedSymmetricKey = String;
pub type RegisterKeyResult = Result<(), String>;

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct DeviceData {
    pub aliases: HashMap<DeviceAlias, PublicKey>,
    pub keys: HashMap<PublicKey, EncryptedSymmetricKey>,
}

#[derive(Default)]
pub struct Devices {
    pub devices: HashMap<Principal, DeviceData>,
}

impl Devices {
    pub fn register_device(
        &mut self,
        caller: Principal,
        alias: DeviceAlias,
        public_key: PublicKey,
    ) {
        match self.devices.entry(caller) {
            // 既にPrincipalが登録されている場合は、デバイスデータを追加します。
            Entry::Occupied(mut device_data_entry) => {
                let device_data = device_data_entry.get_mut();
                match device_data.aliases.entry(alias) {
                    Entry::Occupied(_) => {}
                    Entry::Vacant(alias_entry) => {
                        alias_entry.insert(public_key);
                    }
                }
            }
            // 初めて登録する場合は、Principalとデバイスデータを紐づけて保存します。
            Entry::Vacant(empty_device_data_entry) => {
                let mut device_data = DeviceData {
                    aliases: HashMap::new(),
                    keys: HashMap::new(),
                };
                // デバイスエイリアスと公開鍵を紐づけて保存します。
                device_data.aliases.insert(alias, public_key);
                empty_device_data_entry.insert(device_data);
            }
        }
    }

    pub fn get_device_aliases(&self, caller: Principal) -> Vec<DeviceAlias> {
        self.devices
            .get(&caller)
            .map(|device_data| device_data.aliases.keys().cloned().collect())
            .unwrap_or_default()
    }

    pub fn delete_device(&mut self, caller: Principal, alias: DeviceAlias) {
        if let Some(device_data) = self.devices.get_mut(&caller) {
            // Principalは、必ず1つ以上のデバイスエイリアスが紐づいているものとします。
            assert!(device_data.aliases.len() > 1);

            let public_key = device_data.aliases.remove(&alias);
            if let Some(public_key) = public_key {
                device_data.keys.remove(&public_key);
            }
        }
    }

    pub fn is_encrypted_symmetric_key_registered(&self, caller: Principal) -> bool {
        self.devices
            .get(&caller)
            .map_or(false, |device_data| !device_data.keys.is_empty())
    }

    pub fn register_encrypted_symmetric_key(
        &mut self,
        caller: Principal,
        public_key: PublicKey,
        encrypted_symmetric_key: EncryptedSymmetricKey,
    ) -> RegisterKeyResult {
        match self.devices.get_mut(&caller) {
            Some(device_data) => {
                if !Self::is_registered_public_key(device_data, &public_key) {
                    return Err("Unknown public key".to_string());
                }
                if !device_data.keys.is_empty() {
                    return Err("Already registered".to_string());
                }
                device_data.keys.insert(public_key, encrypted_symmetric_key);
                Ok(())
            }
            None => Err("Device not registered".to_string()),
        }
    }

    fn is_registered_public_key(device_data: &DeviceData, public_key: &PublicKey) -> bool {
        device_data.aliases.values().any(|key| key == public_key)
    }
}
