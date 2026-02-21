import { Instance, types } from "mobx-state-tree";

export const UserModel = types.model("User", {
  id_user: types.identifierNumber,
  username: types.string,
});

export type UserInstance = Instance<typeof UserModel>;

export const LoginModel = types.model("Login", {
  user: UserModel,
  access_token: types.string,
});

export type LoginInstance = Instance<typeof LoginModel>;
