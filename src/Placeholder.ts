import { Vector, useNewComponent, Geometry, Polygon, useDraw, Physics, useRootEntity, useType } from "@hex-engine/2d";
import { Bounds } from "matter-js";
import Attractor from "./Attractor";
import { store } from "./Root";

interface PlaceholderData {
  kind: "facedown" | "board";
  player?: number;
  row?: number;
  position?: number;
  enabled: boolean;
}

export default function Placeholder(position: Vector, kind: PlaceholderKind) {
  useType(Placeholder);

  const geometry = useNewComponent(() => Geometry({
    position: position.clone(),
    shape: Polygon.rectangle(50, 70)
  }));

  const data: PlaceholderData = {
    kind: "facedown",
    enabled: false
  };

  const physics = useNewComponent(() => Physics.Body(geometry, {isSensor: true}));

  useDraw(context => {
    switch (kind) {
      case "facedown":
      case "default": context.fillStyle = "#00000022"; break;
      case "danger": context.fillStyle = "#ff000044"; break;
    }

    const dragged = store.dragged;

    if (data.enabled && dragged && Bounds.overlaps(physics.body.bounds, dragged!.getComponent(Physics.Body)!.body.bounds)) {
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