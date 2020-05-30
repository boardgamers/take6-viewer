import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Vector,
  Geometry,
  Polygon,
  useEntity,
} from "@hex-engine/2d";
import Attractor from "./Attractor";
import PlayerLabel from "./PlayerLabel";
import Placeholder from "./Placeholder";
import { RootData } from "./rootdata";
import Logic from "./logic";
import { createHand, createBoard } from "./ui";
import { range } from "lodash";
import CanvasCenter from "./CanvasCenter";
import Runner from "./Runner";
import { resolution } from "./constants";
import { GameState } from "take6-engine";

const store: {ui?:RootData; logic?: Logic} = {};

export { store };

export default function Root(data?: GameState, isLocal = true) {
  useType(Root);
  console.log("creating root!!");

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "#444"}));
  canvas.setPixelated(false);

  store.logic = new Logic(data, isLocal);

  const logic = store.logic;

  const center = useChild(() => {
    useNewComponent(CanvasCenter);
    useNewComponent(Runner);
  });

  store.ui = {
    placeholders: {
      players: {},
      rows: [],
    },
    cards: {

    },
    attractedBy: new WeakMap(),
    handAttractors: [],
    canvas,
    canvasCenter: center,
    waitingAnimations: 0
  };

  const ui = store.ui;

  store.ui.placeholders.players[store.logic.player] = useChild(() => Placeholder(new Vector(-220, 170).multiplyMutate(resolution), "facedown", logic.player));
  useChild(() => PlayerLabel(new Vector(0, 210).multiplyMutate(resolution), logic.state.players[logic.player], logic.player));

  store.ui.placeholders.players[logic.player].getComponent(Placeholder)!.data.enabled = true;

  for (const entry of Object.entries(range(0, logic.state.players.length).filter(pl => pl !== logic.player))) {
    const index = + entry[0];
    const player = entry[1];

    if (index <= 5) {
      store.ui.placeholders.players[player] = useChild(() => Placeholder(new Vector(173 + 145 * (index % 2), -163 + 110 * Math.floor(index /2)).multiplyMutate(resolution), "facedown", player));
      useChild(() => PlayerLabel(new Vector(173 + 145 * (index % 2), -218 + 110 * Math.floor(index /2)).multiplyMutate(resolution), logic.state.players[player], player));
    } else {
      store.ui.placeholders.players[player] = useChild(() => Placeholder(new Vector(-317, -163 + 110 * (index - 6)).multiplyMutate(resolution), "facedown", player));
      useChild(() => PlayerLabel(new Vector(-317, -218 + 110 * (index - 6)).multiplyMutate(resolution), logic.state.players[player], player));
    }
  }

  for (let i = 0; i < logic.state.rows.length; i++) {
    const row: typeof ui.placeholders.rows[0] = [];

    store.ui.placeholders.rows.push(row);
    for (let j = 0; j < 6; j++) {
      const pos = new Vector(-203 + j * 55, (i - 1.5) * 80 - 75).multiplyMutate(resolution);

      const placeholder = useChild(() => Placeholder(pos, j === 5 ? "danger" : "default"));
      row.push(placeholder);
    }
  }

  for (let i = 0; i <= 10; i++) {
    const attractor = useChild(() => {
      useNewComponent(() => Attractor());
      useNewComponent(() => Geometry({
        shape: new Polygon([])
      }));
    });
    store.ui.handAttractors.push(attractor);
  }

  createBoard();
  createHand();

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
