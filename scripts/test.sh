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
FUNCTION='addNote'
echo "===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '("First text!")'`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='getNotes'
echo "===== $FUNCTION ====="
EXPECT='(vec { record { id = 0 : nat; encrypted_text = "First text!" } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='updateNote'
echo "===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '(
  record {
    id = 0;
    encrypted_text = "Updated first text!"
  }
)'`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='getNotes'
EXPECT='(vec { record { id = 0 : nat; encrypted_text = "Updated first text!" } })'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

FUNCTION='deleteNote'
echo "===== $FUNCTION ====="
EXPECT='()'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION '(0)'`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1
# 確認
FUNCTION='getNotes'
EXPECT='(vec {})'
RESULT=`dfx canister call encrypted_notes_backend $FUNCTION`
compare_result "$FUNCTION" "$EXPECT" "$RESULT" || TEST_STATUS=1

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