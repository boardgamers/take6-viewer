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
import PlayerLabel from "./PlayerLabel";
import Placeholder from "./Placeholder";
import { RootData } from "./rootdata";
import Logic from "./logic";
import { repositionHandAttractor } from "./positioning";

let store: RootData;
let logic: Logic;

export { store, logic };

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

  logic = new Logic();

  const rootData: RootData = {
    playerShown: 0,
    placeholders: {
      rows: [],
    },
    cards: {

    },
    attractedBy: new WeakMap(),
    handAttractors: [],
    canvas
  };

  store = rootData;

  rootData.placeholders.player = useChild(() => Placeholder(canvasCenter.addY(170).addXMutate(-220), "facedown"));
  useChild(() => PlayerLabel(canvasCenter.addY(210), logic.state.players[0], rootData.playerShown));

  for (let i = 0; i < logic.state.rows.length; i++) {
    const row: typeof rootData.placeholders.rows[0] = [];

    rootData.placeholders.rows.push(row);
    for (let j = 0; j < 6; j++) {
      const pos = canvasCenter.addX(-240 + j * 55).addYMutate((i - 1.5) * 80 - 75);

      const placeholder = useChild(() => Placeholder(pos, j === 5 ? "danger" : "default"));
      row.push(placeholder);

      if (logic.state.rows[i][j]) {
        const card = useChild(() => Card(pos, logic.state.rows[i][0]));

        placeholder.getComponent(Attractor)?.attract(card);
      }
    }
  }

  const hand = logic.state.players[0].hand;

  for (let i = hand.length - 1; i >= 0; i--) {
    const child = useChild(() => Card(canvasCenter.addX((i-(hand.length-1)/2)*45), hand[i]));

    const attractor = useChild(() => {
      useNewComponent(() => Attractor());
      useNewComponent(() => Geometry({
        shape: new Polygon([])
      }));
    });
    attractor.getComponent(Attractor)!.attract(child);
    rootData.handAttractors.unshift(attractor);
  }

  for (let i = 0; i < hand.length; i++) {
    repositionHandAttractor(i, hand.length);
  }
}
