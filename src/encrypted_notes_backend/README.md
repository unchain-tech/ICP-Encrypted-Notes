# About The Project

## Running the project locally

---

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd encrypted_notes/
dfx help
dfx canister --help
```

## Test

---

Two terminals are used.

**[Terminal A]**

```bash
dfx start --clean
```

**[Terminal B]**

```bash
bash ./scripts/test.sh
```

# Description

## Chain deployed to `ICP`

---

## Canister

---

### Stack description

- Rust

### Directory structure

There is one type of canister.

```bash
encrypted_notes/
└── src/
    └── encrypted_notes_backend/
```

`encrypted_notes_backend`

Manage notes and devices.

```bash
.
├── Cargo.toml
├── encrypted_notes_backend.did
└── src
    ├── devices_store.rs
    ├── lib.rs
    ├── notes_store.rs
    └── stores.rs
```

- `encrypted_notes_backend.did` is the **interface** to the encrypted_notes canister.
- `lib.rs` actually defines the functions to be called from the outside and uses the following modules.

[modules]

- `devices_store.rs` is a module that manages data on devices that share notes.
- `notes_store.rs` is a module that manages encrypted notes.
- `stores.rs` defines the global variables handled by each module (this is to consolidate the global variable definitions in one place).
