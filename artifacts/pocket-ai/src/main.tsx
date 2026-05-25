import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
setBaseUrl(apiBaseUrl);

document.documentElement.classList.add('dark');
createRoot(document.getElementById("root")!).render(<App />);