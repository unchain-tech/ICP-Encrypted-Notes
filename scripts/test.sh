#!/bin/bash

compare_result() {
    local label=$1
    local expect=$2
    local result=$3

    if [ "$expect" = "$result" ]; then
        echo "$label: OK"
        return 0
    else
        echo "$label: ERR"
        diff <(echo $expect) <(echo $result)
        return 1
    fi
}

TEST_STATUS=0
TEST_DEVICE_ALIAS_01='TEST_DEVICE_ALIAS_01'
TEST_DEVICE_ALIAS_02='TEST_DEVICE_ALIAS_02'
TEST_PUBLIC_KEY_01='TEST_PUBLIC_KEY_01'
TEST_PUBLIC_KEY_02='TEST_PUBLIC_KEY_02'
TEST_ENCRYPTED_SYMMETRIC_KEY_01='TEST_ENCRYPTED_SYMMETRIC_KEY_01'
TEST_ENCRYPTED_SYMMETRIC_KEY_02='TEST_ENCRYPTED_SYMMETRIC_KEY_02'

# ===== 準備 =====
dfx stop
rm -rf .dfx
dfx start --clean --background

# テストで使用するユーザーを作成する
dfx identity new test-user --storage-mode=plaintext || true
dfx identity use test-user

# キャニスターのデプロイ
dfx deploy encrypted_notes_backend

# ===== テスト =====
FUNCTION='registerDevice'
echo -e "\n===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_DEVICE_ALIAS_01\"', '\"$TEST_PUBLIC_KEY_01\"')'`
compare_result "Return none" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='getDeviceAliases'
echo -e "\n===== $FUNCTION ====="
EXPECT='(vec { '\"$TEST_DEVICE_ALIAS_01\"' })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Return device list" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='isEncryptedSymmetricKeyRegistered'
echo -e "\n===== $FUNCTION ====="
EXPECT='(false)'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Return false" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='registerEncryptedSymmetricKey'
echo -e "\n===== $FUNCTION ====="
EXPECT='(variant { Ok })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_PUBLIC_KEY_01\"', '\"$TEST_ENCRYPTED_SYMMETRIC_KEY_01\"')'`
compare_result "Return Ok" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='registerEncryptedSymmetricKey'
EXPECT='(variant { Err = variant { AlreadyRegistered } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_PUBLIC_KEY_01\"', '\"$TEST_ENCRYPTED_SYMMETRIC_KEY_01\"')'`
compare_result "Return Err(AlreadyRegistered)" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='isEncryptedSymmetricKeyRegistered'
EXPECT='(true)'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Check with $FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

# 鍵の同期処理
## 別のデバイスを登録する
echo -e "\n===== Register other device & check unsynced ====="
UNUSED_RESULR=`dfx canister call encrypted_notes_backend registerDevice '('\"$TEST_DEVICE_ALIAS_02\"', '\"$TEST_PUBLIC_KEY_02\"')'`
FUNCTION='getEncryptedSymmetricKey'
EXPECT='(variant { Err = variant { KeyNotSynchronized } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_PUBLIC_KEY_02\"')'`
compare_result "Return Err(KeyNotSynchronized)" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='getUnsyncedPublicKeys'
echo -e "\n===== $FUNCTION ====="
EXPECT='(vec { '\"$TEST_PUBLIC_KEY_02\"' })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Return unsynced public key list" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='uploadEncryptedSymmetricKeys'
echo -e "\n===== $FUNCTION ====="
EXPECT='(variant { Ok })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '(vec { record { '\"$TEST_PUBLIC_KEY_02\"'; '\"$TEST_ENCRYPTED_SYMMETRIC_KEY_02\"' } })'`
compare_result "Return Ok" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='getEncryptedSymmetricKey'
echo -e "\n===== $FUNCTION ====="
EXPECT='(variant { Ok = '\"$TEST_ENCRYPTED_SYMMETRIC_KEY_02\"' })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_PUBLIC_KEY_02\"')'`
compare_result "Return Ok" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='deleteDevice'
echo -e "\n===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '('\"$TEST_DEVICE_ALIAS_01\"')'`
compare_result "Return none" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='getDeviceAliases'
EXPECT='(vec { '\"$TEST_DEVICE_ALIAS_02\"' })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Check with $FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='addNote'
echo -e "\n===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '("First text!")'`
compare_result "Return none" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='getNotes'
echo -e "\n===== $FUNCTION ====="
EXPECT='(vec { record { id = 0 : nat; data = "First text!" } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Return note list" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='updateNote'
echo -e "\n===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '(
  record {
    id = 0;
    data = "Updated first text!"
  }
)'`
compare_result "Return none" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='getNotes'
EXPECT='(vec { record { id = 0 : nat; data = "Updated first text!" } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Check with $FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='deleteNote'
echo -e "\n===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '(0)'`
compare_result "Return none" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='getNotes'
EXPECT='(vec {})'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "Check with $FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

# ===== 後始末 =====
dfx identity use default
dfx identity remove test-user
dfx stop

# ===== テスト結果の確認 =====
echo '===== Result ====='
if [ $TEST_STATUS -eq 0 ]; then
  echo '"PASS"'
  exit 0
else
  echo '"FAIL"'
  exit 1
fi