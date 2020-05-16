import { Vector, useNewComponent, Geometry, Polygon, useDraw } from "@hex-engine/2d";
import Attractor from "./Attractor";

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

  useDraw(context => {
    switch (kind) {
      case "facedown": context.fillStyle = "#ffffff22"; break;
      case "default": context.fillStyle = "#00000022"; break;
      case "danger": context.fillStyle = "#ff000044"; break;
    }
    geometry.shape.draw(context, "fill");
  });

  useNewComponent(() => Attractor());

  return {
    data
  };
}

export type PlaceholderKind = "default" | "danger" | "facedown";