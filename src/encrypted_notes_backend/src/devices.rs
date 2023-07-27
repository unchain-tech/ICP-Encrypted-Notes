use candid::CandidType;
use ic_cdk::export::Principal;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::Entry;
use std::collections::HashMap;

pub type DeviceAlias = String;
pub type PublicKey = String;
pub type EncryptedSymmetricKey = String;

pub type RegisterDeviceResult = Result<(), String>;

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
    ) -> RegisterDeviceResult {
        match self.devices.entry(caller) {
            // 既にPrincipalが登録されている場合は、デバイスデータを追加します。
            Entry::Occupied(mut device_data_entry) => {
                let device_data = device_data_entry.get_mut();
                match device_data.aliases.entry(alias) {
                    Entry::Occupied(_) => Err("Device alias is already registered".to_string()),
                    Entry::Vacant(alias_entry) => {
                        alias_entry.insert(public_key);
                        Ok(())
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
                Ok(())
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
}
