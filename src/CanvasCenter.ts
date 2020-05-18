import { useType, useUpdate, useNewComponent, Geometry, Polygon } from "@hex-engine/2d";
import { store } from "./Root";

export default function CanvasCenter() {
  useType(CanvasCenter);

  const geo = useNewComponent(() => Geometry({shape: new Polygon([])}));

  useUpdate(() => {
    const canvas = store.canvas;

    geo.position.mutateInto({x: canvas.element.width/2, y: canvas.element.height/2});
  });
}