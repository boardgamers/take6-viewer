import Placeholder from "./Placeholder";
import { ComponentType } from "./utils";
import { Entity } from "@hex-engine/2d";

export interface RootData {
  playerShown: number,
  placeholders: {
    player?: ComponentType<typeof Placeholder>
    rows: ComponentType<typeof Placeholder>[][]
  },
  dragged?: Entity;
}
