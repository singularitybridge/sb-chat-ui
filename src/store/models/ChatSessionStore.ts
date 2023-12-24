import { types } from 'mobx-state-tree';
import { ChatSession } from './ChatSession';

const ChatSessionStore = types
  .model('ChatSessionStore', {
    id: types.identifier,
    sessionId: types.reference(ChatSession),
    data: types.frozen(), // a flexible data structure for the value
  })
  .views((self) => ({
    // get session() {
    //   return getParent(self, 2).sessions.get(self.sessionId);
    // }
  }))
  .actions((self) => ({
    // ... actions to manipulate the store
  }));

export { ChatSessionStore };
