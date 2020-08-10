import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./index.css";
import "./layout.css";
import "./dappnode_styles.css";
import "./dappnode_colors.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
