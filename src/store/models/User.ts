import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';
import { Identifier } from './Assistant';

const User = types.model('User', {
  _id: types.identifier,
  name: types.string,
  nickname: types.string,
  identifiers: types.optional(types.array(Identifier), []),
});

type IUser = Instance<typeof User>;
type UserSnapshotIn = SnapshotIn<typeof User>;
type UserSnapshotOut = SnapshotOut<typeof User>;
export type UserKeys = keyof IUser;

export { User };
export type { IUser, UserSnapshotIn, UserSnapshotOut };
