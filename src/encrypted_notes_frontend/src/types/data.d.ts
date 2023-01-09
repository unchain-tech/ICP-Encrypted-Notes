import type { ActorSubclass } from "@dfinity/agent";
import type { Principal } from '@dfinity/principal';

export type BackendActor = ActorSubclass<_SERVICE>;

export type User = {
  identity: Principal;
  actor: BackendActor;
}

export type Note = {
  id: number;
  text: string;
};

export type Device = [
  alias: string, publicKey: string
];
