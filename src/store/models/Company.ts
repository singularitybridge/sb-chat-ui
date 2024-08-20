import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';
import { Identifier } from './Assistant';

export const ApiKey = types.model('ApiKey', {
  key: types.string,
  value: types.string,
});

export const Token = types.model('Token', {
  value: types.string,
  iv: types.string,
  tag: types.string,
});

const Company = types
  .model('Company', {
    _id: types.identifier,
    name: types.string,
    description: types.string,
    token: Token,
    api_keys: types.array(ApiKey),
    identifiers: types.optional(types.array(Identifier), []),
    __v: types.number,
  })
  .actions((self) => ({
    updateToken(token: typeof Token.Type) {
      self.token = token;
    },
    updateApiKeys(apiKeys: typeof ApiKey.Type[]) {
      self.api_keys.replace(apiKeys);
    },
    updateIdentifiers(identifiers: typeof Identifier.Type[]) {
      self.identifiers.replace(identifiers);
    },
  }));

type ICompany = Instance<typeof Company>;
type CompanySnapshotIn = SnapshotIn<typeof Company>;
type CompanySnapshotOut = SnapshotOut<typeof Company>;
export type CompanyKeys = keyof ICompany;

export { Company };
export type { ICompany, CompanySnapshotIn, CompanySnapshotOut };
