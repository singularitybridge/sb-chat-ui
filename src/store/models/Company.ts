import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';
import { Identifier } from './Assistant';

const ApiKey = types.model('ApiKey', {
  key: types.string,
  value: types.string,
});

const Company = types.model('Company', {
  _id: types.identifier,
  name: types.string,
  api_keys: types.array(ApiKey),
  identifiers: types.optional(types.array(Identifier), []),
  __v: types.number,
});

type ICompany = Instance<typeof Company>;
type CompanySnapshotIn = SnapshotIn<typeof Company>;
type CompanySnapshotOut = SnapshotOut<typeof Company>;
export type CompanyKeys = keyof ICompany;

export { Company };
export type { ICompany, CompanySnapshotIn, CompanySnapshotOut };
