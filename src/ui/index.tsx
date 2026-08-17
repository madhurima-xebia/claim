import React from "react";
import ReactDOM from "react-dom/client";
import AppDashboard from "./AppDashboard";
import "./styles/global.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppDashboard />
  </React.StrictMode>
);
