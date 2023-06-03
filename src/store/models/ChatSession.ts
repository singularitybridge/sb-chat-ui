import { Instance, SnapshotIn, SnapshotOut, flow, getParent, types } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";

const DateModel = types.custom({
  name: "DateModel",
  fromSnapshot(value: string) {
    return new Date(value);
  },
  toSnapshot(value: Date) {
    return value.toISOString();
  },
  isTargetType(value: Date | string): boolean {
    return value instanceof Date;
  },
  getValidationMessage(value: string): string {
    if (isNaN(Date.parse(value))) {
      return "Invalid date";
    }
    return "";
  },
});

const ChatSession = types
  .model("ChatSession", {
    _id: types.identifier,
    chatbot_key: types.string,
    user_id: types.string,
    created_at: DateModel,
    updated_at: DateModel,
    active: types.boolean,
    current_state: types.string,
  })
  .views((self) => ({
  }))
  .actions((self) => ({
    setState: (state: string) => {
      self.current_state = state;
    },
  }
  
  
  ));

type IChatSession = Instance<typeof ChatSession>;
type ChatSessionSnapshotIn = SnapshotIn<typeof ChatSession>;
type ChatSessionSnapshotOut = SnapshotOut<typeof ChatSession>;

export { ChatSession };
export type { IChatSession, ChatSessionSnapshotIn, ChatSessionSnapshotOut };
