import { Geometry, Vector, useChild } from "@hex-engine/2d";
import { store, logic } from "./Root";
import { resolution } from "./constants";
import Card from "./Card";
import Attractor from "./Attractor";
import Runner from "./Runner";

export function repositionHandAttractor(index: number, handLength: number) {
  const geo = store.handAttractors[index].getComponent(Geometry)!;

  geo.position.mutateInto(new Vector(0, -800).multiplyMutate(resolution).rotateMutate(-(index-(handLength-1)/2) * 0.04).addYMutate(950 * resolution));
  geo.rotation = (index - (handLength - 1)/2) * 0.03;
}

export function createHand() {
  const hand = logic.state.players[0].hand;
  const run = store.canvasCenter.getComponent(Runner)!.run;

  for (let i = hand.length - 1; i >= 0; i--) {
    const child = run(() => useChild(() => Card(new Vector((i-(hand.length-1)/2)*45, 0).multiplyMutate(resolution), hand[i])));

    store.handAttractors[i].getComponent(Attractor)!.attract(child);
  }

  for (let i = 0; i < hand.length; i++) {
    repositionHandAttractor(i, hand.length);
  }
}

export function createBoard() {
  const run = store.canvasCenter.getComponent(Runner)!.run;
  for (let i = 0; i < logic.state.rows.length; i++) {
    for (let j = 0; j < 6; j++) {
      if (logic.state.rows[i][j]) {
        const placeholder = store.placeholders.rows[i][j];
        const card =  run(() => useChild(() => Card(placeholder.getComponent(Geometry)!.position, logic.state.rows[i][j])));

        placeholder.getComponent(Attractor)?.attract(card);
      }
    }
  }
}