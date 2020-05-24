import {
  useDraw,
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  SystemFont,
  Label,
} from "@hex-engine/2d";
import { Player } from "take6-engine";
import { resolution } from "./constants";
import { logic } from "./Root";

export default function PlayerLabel(position: Vector, player: Player, playerIndex: number) {
  useType(PlayerLabel);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(85, 20)),
      position: position.clone(),
    })
  );

  const font = useNewComponent(() => SystemFont({
    name: "sans-serif",
    size: ( 12  - (playerIndex !== logic.player ? 1 : 0)) * resolution,
    color: playerIndex === logic.player ? "orange" : "#000"
  }));
  const label = useNewComponent(() => Label({font}));

  const pointsFont = useNewComponent(() => SystemFont({
    name: "sans-serif",
    size: ( 10  - (playerIndex !== logic.player ? 1 : 0)) * resolution,
    color: playerIndex === logic.player ? "orange" : "#000"
  }));
  const pointsLabel = useNewComponent(() => Label({font: pointsFont}));

  useDraw((context) => {
    // context.fillStyle = "#ffaa22";
    // if (useEntity().getComponent(Mouse)?.isInsideBounds) {
    //   context.fillStyle = "green";
    // }
    // geometry.shape.draw(context, "fill");
    // context.strokeStyle = "grey";
    // geometry.shape.draw(context, "stroke");

    font.color = playerIndex === logic.player ? "orange" : "#000";

    context.shadowBlur = 1 * resolution;
    context.shadowOffsetX = 1 * resolution;
    context.shadowOffsetY = 1 * resolution;
    context.shadowColor = `rgba(255, 255, 255, ${playerIndex === logic.player ? 0.4 : 0.2})`;

    const text = player.name ?? `Player ${playerIndex + 1}`;
    if (label.text !== text) {
      label.text = text;
    }
    label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 2 * resolution});

    const pointsText = logic.state.players[playerIndex].points + " pts";
    if (pointsLabel.text !== pointsText) {
      pointsLabel.text = pointsText;
    }
    context.shadowColor = "transparent";
    pointsLabel.draw(context, {x: (geometry.shape.width - pointsLabel.size.x) / 2, y: (geometry.shape.height - pointsLabel.size.y) / 2 + 14 * resolution});
  });
}
