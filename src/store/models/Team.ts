import {
  types,
  Instance,
  SnapshotIn,
  SnapshotOut,
} from 'mobx-state-tree';

const Team = types.model('Team', {
  _id: types.identifier,
  name: types.string,
  description: types.string,
  icon: types.optional(types.string, ''),
  companyId: types.string,
});

type ITeam = Instance<typeof Team>;
type TeamSnapshotIn = SnapshotIn<typeof Team>;
type TeamSnapshotOut = SnapshotOut<typeof Team>;
export type TeamKeys = keyof ITeam;

export { Team };
export type { ITeam, TeamSnapshotIn, TeamSnapshotOut };
