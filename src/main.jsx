// Application entry point: load the shared stylesheet and mount the routed React app.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Restore the saved theme before React renders, including on public and authentication pages.
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
