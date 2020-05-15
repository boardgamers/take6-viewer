import {
  useDraw,
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  SystemFont,
  Label,
  useEntity,
  Mouse,
} from "@hex-engine/2d";
import { Player } from "take6-engine";

export default function PlayerLabel(position: Vector, player: Player, playerIndex: number) {
  useType(PlayerLabel);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(120, 30)),
      position: position.clone(),
    })
  );

  const font = useNewComponent(() => SystemFont({name: "sans-serif", size: 12}))
  const label = useNewComponent(() => Label({font}));

  useDraw((context) => {
    context.fillStyle = "#ffaa22";
    if (useEntity().getComponent(Mouse)?.isInsideBounds) {
      context.fillStyle = "green";
    }
    geometry.shape.draw(context, "fill");
    context.strokeStyle = "grey";
    geometry.shape.draw(context, "stroke");

    label.text = player.name ?? `Player ${playerIndex + 1}`;
    label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 2});
  });
}
