import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const Session = types.model('Session', {
  _id: types.identifier,
  companyId: types.string,
  userId: types.string,
  assistantId: types.string,
  threadId: types.string,
  active: types.boolean,
  assistantName: types.string,
  userName: types.string  
});

type ISession = Instance<typeof Session>;
type SessionSnapshotIn = SnapshotIn<typeof Session>;
type SessionSnapshotOut = SnapshotOut<typeof Session>;
export type SessionKeys = keyof ISession;

export { Session };
export type { ISession, SessionSnapshotIn, SessionSnapshotOut };
