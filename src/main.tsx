import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/domains/aec/styles/aec-theme.css";

createRoot(document.getElementById("root")!).render(<App />);
