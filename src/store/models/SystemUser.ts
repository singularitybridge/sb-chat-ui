import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const SystemUser = types.model('SystemUser', {
    _id: types.identifier,
    googleId: types.string,
    name: types.string,
    email: types.string,
    companyId: types.string, 
    isAuthenticated: types.optional(types.boolean, false),
});

type ISystemUser = Instance<typeof SystemUser>;
type SystemUserSnapshotIn = SnapshotIn<typeof SystemUser>;
type SystemUserSnapshotOut = SnapshotOut<typeof SystemUser>;

export { SystemUser };
export type { ISystemUser, SystemUserSnapshotIn, SystemUserSnapshotOut };