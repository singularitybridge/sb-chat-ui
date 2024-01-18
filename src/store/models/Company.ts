import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';
import { Identifier } from './Assistant';

const Company = types.model('Company', {
  _id: types.identifier,
  name: types.string,
  openai_api_key: types.string,
  identifiers: types.optional(types.array(Identifier), []),
  __v: types.number,
});

type ICompany = Instance<typeof Company>;
type CompanySnapshotIn = SnapshotIn<typeof Company>;
type CompanySnapshotOut = SnapshotOut<typeof Company>;
export type CompanyKeys = keyof ICompany;

export { Company };
export type { ICompany, CompanySnapshotIn, CompanySnapshotOut };
