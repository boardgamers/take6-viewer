import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
  Geometry,
  Polygon,
  useEntity,
} from "@hex-engine/2d";
import Card from "./Card";
import Attractor from "./Attractor";
import PlayerLabel from "./PlayerLabel";
import Placeholder from "./Placeholder";
import { RootData } from "./rootdata";
import Logic from "./logic";
import { repositionHandAttractor } from "./positioning";
import { range } from "lodash";
import CanvasCenter from "./CanvasCenter";

let store: RootData;
let logic: Logic;

export { store, logic };

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "#444" }));
  canvas.fullscreen({ pixelZoom: 2 });

  const engine = useNewComponent(Physics.Engine);
  engine.engine.world.gravity.y = 0;

  logic = new Logic();

  const center = useChild(CanvasCenter);

  const rootData: RootData = {
    placeholders: {
      players: {},
      rows: [],
    },
    cards: {

    },
    attractedBy: new WeakMap(),
    handAttractors: [],
    canvas,
    canvasCenter: center
  };

  store = rootData;

  rootData.placeholders.players[logic.player] = useChild(() => Placeholder(new Vector(-220, 170), "facedown"));
  useChild(() => PlayerLabel(new Vector(0, 210), logic.state.players[logic.player], logic.player));

  rootData.placeholders.players[logic.player].getComponent(Placeholder)!.data.enabled = true;

  for (const entry of Object.entries(range(0, logic.state.players.length).filter(pl => pl !== logic.player))) {
    const index = + entry[0];
    const player = entry[1];

    if (index <= 5) {
      rootData.placeholders.players[player] = useChild(() => Placeholder(new Vector(173 + 145 * (index % 2), -163 + 110 * Math.floor(index /2)), "facedown"));
      useChild(() => PlayerLabel(new Vector(173 + 145 * (index % 2), -218 + 110 * Math.floor(index /2)), logic.state.players[player], player));
    } else {
      rootData.placeholders.players[player] = useChild(() => Placeholder(new Vector(-317, -163 + 110 * (index - 6)), "facedown"));
      useChild(() => PlayerLabel(new Vector(-317, -218 + 110 * (index - 6)), logic.state.players[player], player));
    }
  }

  for (let i = 0; i < logic.state.rows.length; i++) {
    const row: typeof rootData.placeholders.rows[0] = [];

    rootData.placeholders.rows.push(row);
    for (let j = 0; j < 6; j++) {
      const pos = new Vector(-203 + j * 55, (i - 1.5) * 80 - 75);

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
    const child = useChild(() => Card(new Vector((i-(hand.length-1)/2)*45, 0), hand[i]));

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

  // Transfer everything to the canvas center
  const root = useEntity();
  for (const entity of root.children) {
    if (entity !== center) {
      entity.parent = center;
      center.children.add(entity);
      root.children.delete(entity);
    }
  }

  logic.updateUI();
}
