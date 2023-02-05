import type { ActorSubclass } from "@dfinity/agent";
import type { Principal } from '@dfinity/principal';

type Status = "initialized" | "synchronizing"

export type BackendActor = ActorSubclass<_SERVICE>;

export type User = {
  identity: Principal;
  actor: BackendActor;
  status: Status;
}

export type Device = [
  alias: string, publicKey: string
];
