import type { ActorSubclass } from "@dfinity/agent";
import type { Principal } from '@dfinity/principal';

import { CryptoService } from "../lib/cryptoService";

// type Status = "initialized" | "synchronizing"

export type BackendActor = ActorSubclass<_SERVICE>;

export type User = {
  identity: Principal; // 各ユーザーの識別子
  actor: BackendActor; // バックエンドキャニスターとやり取りをするためのactor
  cryptoService: CryptoService | undefined;
  // status: Status;
}

export type Device = [
  alias: string, publicKey: string
];
