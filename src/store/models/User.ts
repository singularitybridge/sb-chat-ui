/// file_path= src/store/models/User.ts
import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';
import { Identifier } from './Assistant';

const User = types.model('User', {
  _id: types.identifier,
  name: types.string,
  nickname: types.maybe(types.string),
  email: types.string,
  googleId: types.optional(types.string, ''),
  role: types.string,
  companyId: types.string,
  identifiers: types.optional(types.array(Identifier), []),

});

type IUser = Instance<typeof User>;
type UserSnapshotIn = SnapshotIn<typeof User>;
type UserSnapshotOut = SnapshotOut<typeof User>;
export type UserKeys = keyof IUser;

export { User };
export type { IUser, UserSnapshotIn, UserSnapshotOut };
