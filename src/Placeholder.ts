import { Vector, useNewComponent, Geometry, Polygon, useDraw, Physics, useRootEntity } from "@hex-engine/2d";
import Matter, { Bounds } from "matter-js";
import Attractor from "./Attractor";
import Root from "./Root";

interface PlaceholderData {
  kind: "facedown" | "board";
  player?: number;
  row?: number;
  position?: number;
}

export default function Placeholder(position: Vector, kind: PlaceholderKind) {
  const geometry = useNewComponent(() => Geometry({
    position: position.clone(),
    shape: Polygon.rectangle(50, 70)
  }));

  const data: PlaceholderData = {
    kind: "facedown"
  };

  const physics = useNewComponent(() => Physics.Body(geometry, {isSensor: true}));

  useDraw(context => {
    switch (kind) {
      case "facedown":
      case "default": context.fillStyle = "#00000022"; break;
      case "danger": context.fillStyle = "#ff000044"; break;
    }

    const dragged = useRootEntity().getComponent(Root)!.data.dragged;

    if (kind === "facedown" && dragged && Bounds.overlaps(physics.body.bounds, dragged!.getComponent(Physics.Body)!.body.bounds)) {
      context.fillStyle = "#ffffff22";
    }
    geometry.shape.draw(context, "fill");
  });

  useNewComponent(() => Attractor());

  return {
    data
  };
}

export type PlaceholderKind = "default" | "danger" | "facedown";