import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const Inbox = types.model('Inbox', {
  _id: types.identifier,
  message: types.string,
  createdAt: types.string,
  userName: types.optional(types.string, ''),
});

type IInbox = Instance<typeof Inbox>;
type InboxSnapshotIn = SnapshotIn<typeof Inbox>;
type InboxSnapshotOut = SnapshotOut<typeof Inbox>;
export type InboxKeys = keyof IInbox;

export { Inbox };
export type { IInbox, InboxSnapshotIn, InboxSnapshotOut };
