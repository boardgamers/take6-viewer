import Placeholder from "./Placeholder";
import { ComponentType } from "./utils";

export interface RootData {
  playerShown: number,
  placeholders: {
    player?: ComponentType<typeof Placeholder>
    rows: ComponentType<typeof Placeholder>[][]
  }
}
