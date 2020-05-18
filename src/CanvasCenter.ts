import { useType, useUpdate, useNewComponent, Geometry, Polygon, useRootEntity, Canvas, useCallbackAsCurrent, useCurrentComponent } from "@hex-engine/2d";

export default function CanvasCenter() {
  useType(CanvasCenter);

  const geo = useNewComponent(() => Geometry({shape: new Polygon([])}));
  const canvas = useRootEntity().getComponent(Canvas)!;

  useUpdate(() => {
    geo.position.mutateInto({x: canvas.element.width/2, y: canvas.element.height/2});
  });

  return {
    run: useCallbackAsCurrent(f => f())
  };
}