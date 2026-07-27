import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { installStoragePolyfill } from "./services/storage.js";

// window.storage polyfill'i App bileşeni render edilmeden ÖNCE kurulmalı,
// çünkü App.jsx içindeki storageGet/storageSet fonksiyonları doğrudan
// window.storage'ı çağırıyor.
installStoragePolyfill();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
