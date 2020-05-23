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

  const font = useNewComponent(() => SystemFont({name: "sans-serif", size: 12 * resolution}))
  const label = useNewComponent(() => Label({font}));

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

    font.size = (12 - (playerIndex !== logic.player ? 1 : 0)) * resolution;
    label.text = player.name ?? `Player ${playerIndex + 1}`;
    label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 2* resolution});

    font.size = (10 - (playerIndex !== logic.player ? 1 : 0)) * resolution;
    label.text = '' + logic.state.players[playerIndex].points + " pts";
    context.shadowColor = "transparent";
    label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 14* resolution});

    font.size = (12 - (playerIndex !== logic.player ? 1 : 0)) * resolution;
  });
}
