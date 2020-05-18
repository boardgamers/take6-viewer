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
import { range } from "lodash";

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
    placeholders: {
      players: {},
      rows: [],
    },
    cards: {

    },
    attractedBy: new WeakMap(),
    handAttractors: [],
    canvas
  };

  store = rootData;

  rootData.placeholders.players[logic.player] = useChild(() => Placeholder(canvasCenter.addY(170).addXMutate(-220), "facedown"));
  useChild(() => PlayerLabel(canvasCenter.addY(210), logic.state.players[logic.player], logic.player));

  rootData.placeholders.players[logic.player].getComponent(Placeholder)!.data.enabled = true;

  for (const entry of Object.entries(range(0, logic.state.players.length).filter(pl => pl !== logic.player))) {
    const index = + entry[0];
    const player = entry[1];

    if (index <= 5) {
      rootData.placeholders.players[player] = useChild(() => Placeholder(canvasCenter.addY(-163 + 110 * Math.floor(index /2)).addXMutate(173 + 145 * (index % 2)), "facedown"));
      useChild(() => PlayerLabel(canvasCenter.addY(-218 + 110 * Math.floor(index /2)).addXMutate(173 + 145 * (index % 2)), logic.state.players[player], player));
    } else {
      rootData.placeholders.players[player] = useChild(() => Placeholder(canvasCenter.addY(-163 + 110 * (index - 6)).addXMutate(- 317), "facedown"));
      useChild(() => PlayerLabel(canvasCenter.addY(-218 + 110 * (index - 6)).addXMutate(- 317), logic.state.players[player], player));
    }
  }

  for (let i = 0; i < logic.state.rows.length; i++) {
    const row: typeof rootData.placeholders.rows[0] = [];

    rootData.placeholders.rows.push(row);
    for (let j = 0; j < 6; j++) {
      const pos = canvasCenter.addX(-203 + j * 55).addYMutate((i - 1.5) * 80 - 75);

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
