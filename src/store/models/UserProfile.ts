import { types, Instance, SnapshotIn, SnapshotOut } from "mobx-state-tree";

const UserProfile = types.model("UserProfile", {
  _id: types.identifier,
  name: types.string,
  avatar: types.string,
  activeChatBot: types.string,
  isAudioPlaying: types.boolean,
}).actions((self) => ({
  // Add any actions here
}));

type IUserProfile = Instance<typeof UserProfile>;
type UserProfileSnapshotIn = SnapshotIn<typeof UserProfile>;
type UserProfileSnapshotOut = SnapshotOut<typeof UserProfile>;

export { UserProfile }
export type { IUserProfile, UserProfileSnapshotIn, UserProfileSnapshotOut }
