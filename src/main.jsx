import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Polyfill window.storage using localStorage so the app works
// as a standalone deployed site.
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    return { key, value };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
    return { keys };
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
