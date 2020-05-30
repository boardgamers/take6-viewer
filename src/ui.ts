import { Geometry, Vector, useChild, Entity } from "@hex-engine/2d";
import { store, logic } from "./Root";
import { resolution } from "./constants";
import Card from "./Card";
import Attractor from "./Attractor";
import Runner from "./Runner";
import { Card as ICard, MoveName } from "take6-engine";
import Placeholder from "./Placeholder";

export function repositionHandAttractor(index: number, handLength: number) {
  const geo = store.handAttractors[index].getComponent(Geometry)!;

  geo.position.mutateInto(new Vector(0, -800).multiplyMutate(resolution).rotateMutate(-(index-(handLength-1)/2) * 0.04).addYMutate(950 * resolution));
  geo.rotation = (index - (handLength - 1)/2) * 0.03;
}

export function createHand() {
  if (!logic.state) {
    return;
  }
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
  if (!logic.state) {
    return;
  }
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

export function placeFacedownCards() {
  if (!logic.state) {
    return;
  }
  for (const player of logic.state.players) {
    if (player.faceDownCard) {
      const playerIndex = logic.state.players.indexOf(player);
      placeFacedownCard(playerIndex, player.faceDownCard);
    }
  }
}

export function placeFacedownCard(player: number, card: ICard) {
  const placeholder = store.placeholders.players[player];
  const attractees: Entity[] = [...placeholder?.getComponent(Attractor)!.attractees];
  const existingCardEntity = attractees?.find(entity => entity.getComponent(Card));
  const existingCard = existingCardEntity?.getComponent(Card)?.card;

  if (existingCard?.number === card.number) {
    return;
  }

  if (existingCardEntity) {
    existingCardEntity.destroy();
  }

  const entity = store.cards[card.number] ?? store.canvasCenter.getComponent(Runner)?.run(() => {
    return useChild(() => Card(placeholder.getComponent(Geometry)?.position!, card));
  });

  placeholder.getComponent(Attractor)?.attract(entity);
}


export function enableDisablePlaceholders() {
  const allPlaceholders: Entity[] = [...Object.values(store.placeholders.players), ...store.placeholders.rows.flat(1)];
  for (const placeholder of allPlaceholders) {
    placeholder.getComponent(Placeholder)!.data.enabled = false;
  }

  if (logic.state.players[logic.player]?.availableMoves) {
    if(logic.state.players[logic.player].availableMoves![MoveName.ChooseCard]) {
      store.placeholders.players[logic.player].getComponent(Placeholder)!.data.enabled = true;
    } else if (logic.state.players[logic.player].availableMoves![MoveName.PlaceCard]) {
      for (const data of logic.state.players[logic.player].availableMoves![MoveName.PlaceCard]!) {
        if (data.replace) {
          store.placeholders.rows[data.row].slice(-1)[0].getComponent(Placeholder)!.data.enabled = true;
        } else {
          store.placeholders.rows[data.row][logic.state.rows[data.row].length].getComponent(Placeholder)!.data.enabled = true;
        }
      }
    }
  }
}
