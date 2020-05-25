import { Vector, useNewComponent, Geometry, Polygon, useDraw, useType, useEntity } from "@hex-engine/2d";
import Attractor from "./Attractor";
import { store, logic } from "./Root";
import { resolution } from "./constants";
import { overlaps } from "./positioning";

interface PlaceholderData {
  kind: "facedown" | "board";
  player?: number;
  row?: number;
  position?: number;
  enabled: boolean;
}

export default function Placeholder(position: Vector, kind: PlaceholderKind, playerNumber?: number) {
  useType(Placeholder);

  const geometry = useNewComponent(() => Geometry({
    position: position.clone(),
    shape: Polygon.rectangle(50 * resolution, 70 * resolution)
  }));

  const data: PlaceholderData = {
    kind: "facedown",
    enabled: false
  };

  useDraw(context => {
    switch (kind) {
      case "facedown":
      case "default": context.fillStyle = "#00000022"; break;
      case "danger": context.fillStyle = "#ff000044"; break;
    }

    const dragged = store.dragged;

    if (data.enabled && dragged && overlaps(useEntity(), dragged)) {
      context.fillStyle = "#ffffff22";
    }
    geometry.shape.draw(context, "fill");

    if (playerNumber !== undefined && logic.canPlayerMove(playerNumber)) {
      context.lineWidth = 2 * resolution;
      context.strokeStyle = "#77ff7755";
      geometry.shape.draw(context, "stroke");
    } else if (data.enabled) {
      context.lineWidth = 2 * resolution;
      context.strokeStyle = "#ffffff33";
      geometry.shape.draw(context, "stroke");
    }
  });

  useNewComponent(Attractor);

  return {
    data,
    player: playerNumber
  };
}

export type PlaceholderKind = "default" | "danger" | "facedown";