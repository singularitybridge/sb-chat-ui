import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const UserSession = types.model('UserSession', {
  userId: types.maybe(types.string),
  companyId: types.maybe(types.string),
  assistantId: types.maybe(types.string),  
})
.actions(self => ({
  setSessionData(userId: string, companyId: string, assistantId: string) {
    self.userId = userId;
    self.companyId = companyId;
    self.assistantId = assistantId;
    // Optionally, store a session token or other non-sensitive data in LocalStorage
    localStorage.setItem('sessionToken', 'yourToken');
  },
  clearSessionData() {
    self.userId = undefined;
    self.companyId = undefined;
    self.assistantId = undefined;
    localStorage.removeItem('sessionToken');
  }
  // Add any additional actions here
}));

// Types for TypeScript support
type IUserSession = Instance<typeof UserSession>;
type UserSessionSnapshotIn = SnapshotIn<typeof UserSession>;
type UserSessionSnapshotOut = SnapshotOut<typeof UserSession>;

export { UserSession };
export type { IUserSession, UserSessionSnapshotIn, UserSessionSnapshotOut };
