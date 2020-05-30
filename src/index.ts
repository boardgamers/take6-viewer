import { createRoot } from "@hex-engine/2d";
import Root from "./Root";
import launch from "./launch";

if (process.env.NODE_ENV !== "production") {
  createRoot(Root);
}

let globalItem: any;
if (typeof window !== 'undefined') {
	globalItem = window;
} else if (typeof global !== 'undefined') {
  globalItem = global;
}

if (globalItem) {
  globalItem.take6 = {launch};
}

export default launch;