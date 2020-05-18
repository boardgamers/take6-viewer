import { Entity, Component, Canvas } from "@hex-engine/2d";
import Attractor from "./Attractor";

export interface RootData {
  placeholders: {
    players: {[key: number]: Entity}
    rows: Entity[][]
  },
  dragged?: Entity;
  cards: {
    [key: number]: Entity
  },
  handAttractors: Entity[],
  canvas: ReturnType<typeof Canvas>,
  attractedBy: WeakMap<Entity, Component & ReturnType<typeof Attractor>>;
}
