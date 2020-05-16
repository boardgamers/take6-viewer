import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
  Geometry,
  Polygon,
} from "@hex-engine/2d";
import Card from "./Card";
import Attractor from "./Attractor";
import { setup } from "take6-engine";
import PlayerLabel from "./PlayerLabel";
import Placeholder from "./Placeholder";
import { RootData } from "./rootdata";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "#444" }));
  canvas.fullscreen({ pixelZoom: 2 });

  const engine = useNewComponent(Physics.Engine);
  engine.engine.world.gravity.y = 0;

  const canvasCenter = new Vector(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  const gameData = setup(2, {pro: false}, "");

  const rootData: RootData = {
    playerShown: 0,
    placeholders: {
      rows: [],
    }
  };

  rootData.placeholders.player = useChild(() => Placeholder(canvasCenter.addY(170).addXMutate(-220), "default"));
  useChild(() => PlayerLabel(canvasCenter.addY(210), gameData.players[0], rootData.playerShown));

  for (let i = 0; i < gameData.rows.length; i++) {
    const row: typeof rootData.placeholders.rows[0] = [];

    rootData.placeholders.rows.push(row);
    for (let j = 0; j < 6; j++) {
      const pos = canvasCenter.addX(-240 + j * 55).addYMutate((i - 1.5) * 80 - 75);

      const placeholder = useChild(() => Placeholder(pos, j === 5 ? "danger" : "default"));
      row.push(placeholder);

      if (gameData.rows[i][j]) {
        const card = useChild(() => Card(pos, gameData.rows[i][0]));

        placeholder.getComponent(Attractor)?.attractees.add(card);
      }
    }
  }

  const hand = gameData.players[0].hand;

  for (let i = hand.length - 1; i >= 0; i--) {
    const child = useChild(() => Card(canvasCenter.addX((i-(hand.length-1)/2)*45), hand[i]));

    const attractor = useChild(() => {
      useNewComponent(() => Attractor());
      useNewComponent(() => Geometry({
        position: new Vector(0, -800).rotateMutate(-(i-(hand.length-1)/2) * 0.04).addMutate(canvasCenter).addYMutate(950),
        shape: new Polygon([]),
        rotation: (i - 4.5) * 0.03
      }));
    });
    attractor.getComponent(Attractor)!.attractees.add(child);
  }

  return {
    data: rootData
  };
}
