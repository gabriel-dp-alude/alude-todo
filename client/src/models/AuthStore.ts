import { types, flow, Instance } from "mobx-state-tree";

import { apiRequest } from "../utils/api";
import { UserModel, UserInstance } from "./User";

export const AuthStore = types
  .model("AuthStore", {
    user: types.maybe(UserModel),
    isLoading: false,
    error: types.maybe(types.string),
  })
  .views((self) => ({
    get isAuthenticated() {
      return !!self.user;
    },
  }))
  .actions((self) => ({
    setError(error: any) {
      self.error = error;
    },
  }))
  .actions((self) => ({
    login: flow(function* login(username: string, password: string) {
      self.isLoading = true;
      self.error = undefined;
      const user: UserInstance = yield apiRequest<UserInstance>(
        "/auth/login",
        { method: "POST", body: { username, password } },
        {
          onFail: (e) => {
            self.setError(e.message);
          },
        },
      );
      if (!self.error) self.user = user;
      self.isLoading = false;
      return !!user;
    }),
    logout: flow(function* logout() {
      self.user = undefined;
      yield apiRequest("auth/logout", { method: "POST" });
    }),
  }));

type AuthStoreInstance = Instance<typeof AuthStore>;

let store: AuthStoreInstance;
export function useAuthStore(): AuthStoreInstance {
  if (!store) {
    store = AuthStore.create({
      user: undefined,
    });
  }
  return store;
}
