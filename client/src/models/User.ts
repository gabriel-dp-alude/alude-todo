import { Instance, types } from "mobx-state-tree";

export const User = types.model("User", {
  id_user: types.identifierNumber,
  username: types.string,
});

export type UserInstance = Instance<typeof User>;
