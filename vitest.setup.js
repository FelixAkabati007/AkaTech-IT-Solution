import "@testing-library/jest-dom/vitest";
import * as React from "react";
globalThis.React = React;
import { vi } from "vitest";

const store = new Map();
const mockLocalStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

vi.mock("@components/ui/SyncStatusProvider", () => {
  return {
    useSyncStatus: () => ({ socket: null, status: "offline" }),
    SyncStatusProvider: ({ children }) => children,
  };
});
vi.mock("@react-oauth/google", () => {
  const React = globalThis.React;
  return {
    GoogleLogin: (props) =>
      React.createElement("span", { "data-testid": "google-login" }),
    GoogleOAuthProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    useGoogleLogin: () => () => {},
  };
});
