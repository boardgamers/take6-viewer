import { useType, useNewComponent, Geometry, Polygon, Vector, useCanvasSize } from "@hex-engine/2d";

export default function CanvasCenter() {
  useType(CanvasCenter);

  const {canvasSize, onCanvasResize} = useCanvasSize();

  const geo = useNewComponent(() => Geometry({shape: new Polygon([]), position: new Vector(canvasSize.x/2, canvasSize.y/2)}));

  onCanvasResize(() => {
    geo.position.mutateInto({x: canvasSize.x/2, y: canvasSize.y/2});
  });
}