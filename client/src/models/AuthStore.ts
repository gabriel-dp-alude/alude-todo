import { types, flow, Instance } from "mobx-state-tree";

import { apiRequest } from "../utils/api";
import { UserModel, LoginInstance, UserInstance } from "./User";

export const AuthStore = types
  .model("AuthStore", {
    user: types.maybe(UserModel),
    access_token: types.maybe(types.string),
    error: types.maybe(types.string),
    isInitializing: true,
    isLoading: false,
  })
  .views((self) => ({
    get isAuthenticated() {
      return !!self.access_token;
    },
  }))
  .actions((self) => ({
    setUser(user: UserInstance) {
      self.user = user;
    },
    setAccessToken(access_token: string | undefined) {
      self.access_token = access_token;
    },
    setError(error: any) {
      self.error = error;
    },
  }))
  .actions((self) => ({
    login: flow(function* (username: string, password: string) {
      self.error = undefined;
      self.isLoading = true;
      yield apiRequest<LoginInstance>(
        "/auth/login",
        { method: "POST", body: { username, password } },
        {
          onSuccess: (data) => {
            self.setUser(data.user);
            self.setAccessToken(data.access_token);
          },
        },
      );
      self.isLoading = false;
      return !self.error;
    }),

    logout: flow(function* () {
      yield apiRequest("/auth/logout", { method: "POST" });
      self.user = undefined;
      self.access_token = undefined;
    }),

    refresh: flow(function* () {
      yield apiRequest<{ access_token: string }>(
        "/auth/refresh",
        { method: "POST" },
        {
          onSuccess: (data) => {
            self.setAccessToken(data.access_token);
          },
        },
      );
    }),

    getUserData: flow(function* getUserData() {
      yield apiRequest<UserInstance>(
        "/auth/me",
        {},
        {
          onSuccess: (data) => {
            self.setUser(data);
          },
        },
      );
    }),
  }))
  .actions((self) => ({
    initialize: flow(function* () {
      yield self.refresh();
      yield self.getUserData();
      self.isInitializing = false;
    }),
  }));

type AuthStoreInstance = Instance<typeof AuthStore>;

let store: AuthStoreInstance;
export function authStore(): AuthStoreInstance {
  if (!store) {
    store = AuthStore.create({
      user: undefined,
    });
  }
  return store;
}
export const useAuthStore = authStore; // hook is just an alias
