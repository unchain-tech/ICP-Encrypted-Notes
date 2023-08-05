import { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

import { _SERVICE } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { CryptoService } from '../lib/cryptoService';

export type BackendActor = ActorSubclass<_SERVICE>;

type Anonymous = {
  status: 'ANONYMOUS';
};

type Synced = {
  status: 'SYNCED';
  actor: BackendActor;
  authClient: AuthClient;
  cryptoService: CryptoService;
};

type Synchronizing = {
  status: 'SYNCHRONIZING';
};

export type Auth = Anonymous | Synced | Synchronizing;
