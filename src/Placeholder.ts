import { Vector, useNewComponent, Geometry, Polygon, useDraw } from "@hex-engine/2d";

export default function Placeholder(position: Vector, i: number) {
  const geometry = useNewComponent(() => Geometry({
    position,
    shape: Polygon.rectangle(50, 70)
  }));

  useDraw(context => {
    context.fillStyle = i === 5 ? "#ff000044" : "#00000022";
    geometry.shape.draw(context, "fill");
  });
}