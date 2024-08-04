/// file_path= src/store/models/Session.ts
import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const Session = types.model('Session', {
  _id: types.identifier,
  assistantId: types.string
});

type ISession = Instance<typeof Session>;
type SessionSnapshotIn = SnapshotIn<typeof Session>;
type SessionSnapshotOut = SnapshotOut<typeof Session>;
export type SessionKeys = keyof ISession;

export { Session };
export type { ISession, SessionSnapshotIn, SessionSnapshotOut };
