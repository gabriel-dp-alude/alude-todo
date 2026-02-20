import { Instance, types } from "mobx-state-tree";

export const UserModel = types.model("User", {
  id_user: types.identifierNumber,
  username: types.string,
});

export type UserInstance = Instance<typeof UserModel>;
