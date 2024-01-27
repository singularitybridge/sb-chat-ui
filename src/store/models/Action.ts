import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const Action = types.model('Action', {
  _id: types.identifier,
  name: types.string,
  description: types.string,
  type: types.string,
  parameters: types.string,
});

type IAction = Instance<typeof Action>;
type ActionSnapshotIn = SnapshotIn<typeof Action>;
type ActionSnapshotOut = SnapshotOut<typeof Action>;

export type ActionKeys = keyof IAction;
export { Action };
export type { IAction, ActionSnapshotIn, ActionSnapshotOut };
