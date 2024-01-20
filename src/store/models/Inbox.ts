import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const Message = types.model('Message', {
  _id: types.identifier,
  message: types.string,
  createdAt: types.maybeNull(types.string), // Use 'maybe' for optional fields
  userName: types.optional(types.string, ''),
  sessionActive: types.boolean,
  assistantName: types.maybeNull(types.string),
  assistantId: types.maybeNull(types.string),
});

const InboxSession = types.model('InboxSession', {
  sessionId: types.identifier,
  messages: types.array(Message),
});

type IMessage = Instance<typeof Message>;
type IInboxSession = Instance<typeof InboxSession>;
type MessageSnapshotIn = SnapshotIn<typeof Message>;
type InboxSessionSnapshotIn = SnapshotIn<typeof InboxSession>;
type MessageSnapshotOut = SnapshotOut<typeof Message>;
type InboxSessionSnapshotOut = SnapshotOut<typeof InboxSession>;


export { Message, InboxSession };
export type { IMessage, IInboxSession, MessageSnapshotIn, InboxSessionSnapshotIn, MessageSnapshotOut, InboxSessionSnapshotOut };
