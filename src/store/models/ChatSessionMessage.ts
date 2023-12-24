import { getParent, types } from 'mobx-state-tree';
import { ChatSession } from './ChatSession';

const Content = types.model({
  text: types.string,
  type: types.string,
});

const ChatSessionMessage = types
  .model('ChatSessionMessage', {
    id: types.identifier,
    sessionId: types.reference(ChatSession),
    content: types.array(Content),
    role: types.string,
    createdAt: types.Date,
    // ... other message properties
  })
  .views((self) => ({
    // get session() {
    //   return getParent(self, 2).sessions.get(self.sessionId);
    // },
  }))
  .actions((self) => ({
    // ... actions to manipulate the message
  }));

export { ChatSessionMessage };
