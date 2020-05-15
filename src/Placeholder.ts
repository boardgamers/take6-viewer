import { Vector, useNewComponent, Geometry, Polygon, useDraw } from "@hex-engine/2d";

export default function Placeholder(position: Vector, kind: PlaceholderKind) {
  const geometry = useNewComponent(() => Geometry({
    position,
    shape: Polygon.rectangle(50, 70)
  }));

  useDraw(context => {
    switch (kind) {
      case "facedown": context.fillStyle = "#ffffff22"; break;
      case "default": context.fillStyle = "#00000022"; break;
      case "danger": context.fillStyle = "#ff000044"; break;
    }
    geometry.shape.draw(context, "fill");
  });
}

export type PlaceholderKind = "default" | "danger" | "facedown";