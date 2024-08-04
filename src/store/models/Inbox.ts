/// file_path: src/store/models/Inbox.ts
import { types, Instance, SnapshotIn, SnapshotOut } from 'mobx-state-tree';

const MessageType = types.enumeration('MessageType', [
  'human_agent_request',
  'human_agent_response',
  'notification'
]);

const Message = types.model('Message', {
  _id: types.identifier,
  message: types.string,
  createdAt: types.maybeNull(types.string),
  sessionActive: types.boolean,
  assistantName: types.maybeNull(types.string),
  senderId: types.maybeNull(types.string),
  type: MessageType,
});

const InboxSession = types.model('InboxSession', {
  sessionId: types.identifier,
  messages: types.array(Message),
  userName: types.optional(types.string, ''),
  lastMessageAt: types.maybeNull(types.string),
});

type IMessage = Instance<typeof Message>;
type IInboxSession = Instance<typeof InboxSession>;
type MessageSnapshotIn = SnapshotIn<typeof Message>;
type InboxSessionSnapshotIn = SnapshotIn<typeof InboxSession>;
type MessageSnapshotOut = SnapshotOut<typeof Message>;
type InboxSessionSnapshotOut = SnapshotOut<typeof InboxSession>;

export { Message, InboxSession };
export type { IMessage, IInboxSession, MessageSnapshotIn, InboxSessionSnapshotIn, MessageSnapshotOut, InboxSessionSnapshotOut };