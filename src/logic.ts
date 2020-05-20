import { range } from "lodash";
import { GameState, setup, move, MoveName, moveAI } from "take6-engine";
import { Entity, Geometry, useChild } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";
import { repositionHandAttractor, overlaps } from "./positioning";
import { stripSecret } from "take6-engine/src/engine";
import CanvasCenter from "./CanvasCenter";

export default class Logic {
  constructor() {
    this.#state = setup(10, {}, "");
    this.player = 0;
  }

  handleCardDrop(card: Entity) {
    const commands = this.state.players[this.player].availableMoves;

    if (!commands) {
      return;
    }

    const cardData = card.getComponent(Card)!.card;

    if (commands.chooseCard) {
      if (!commands.chooseCard.some(card => card.number === cardData.number)) {
        return;
      }
      if (!overlaps(card, store.placeholders.players[this.player])) {
        return;
      }

      this.#state = move(this.#state, {name: MoveName.ChooseCard, data: cardData}, this.player);
    } else if (commands.placeCard) {
      // Todo : proper move
      this.#state = move(this.#state, {name: MoveName.ChooseCard, data: cardData}, this.player);
    }

    this.updateUI();
  }

  updateUI() {
    while (this.#state.players.filter(pl => pl !== this.#state.players[this.player]).some(pl => pl.availableMoves)) {
      this.#state = moveAI(this.#state, this.#state.players.indexOf(this.#state.players.filter(pl => pl !== this.#state.players[this.player]).find(pl => !!pl.availableMoves)!));
    }

    // console.log(this.#state);
    for (const player of range(0, this.state.players.length)) {
      const cardNumber = this.state.players[player].faceDownCard?.number;
      const attractees: Entity[] = [...store.placeholders.players[player]?.getComponent(Attractor)!.attractees];
      const existingCardEntity = attractees?.find(entity => entity.getComponent(Card));
      const existingCard = existingCardEntity?.getComponent(Card)?.card;

      console.log(player, existingCard?.number, cardNumber);
      if (existingCard?.number === cardNumber) {
        continue;
      }

      if (cardNumber !== undefined) {
        if (existingCard) {
          if (existingCard?.number === 0) {
            existingCardEntity!.destroy();
          } else {
            // The attraction of the card should be automatically handled
          }
        }
        if (cardNumber === 0) {
          store.canvasCenter.getComponent(CanvasCenter)?.run(() => {
            const entity = useChild(() => Card(store.placeholders.players[player].getComponent(Geometry)?.position!, {number: 0, points: 0}));
            store.placeholders.players[player]?.getComponent(Attractor)?.attract(entity);
          });
        } else {
          if (!store.cards[cardNumber]) {
            store.canvasCenter.getComponent(CanvasCenter)?.run(() => {
              const entity = useChild(() => Card(store.placeholders.players[player].getComponent(Geometry)?.position!, this.state.players[player].faceDownCard));
              store.placeholders.players[player]?.getComponent(Attractor)?.attract(entity);
            });
          } else {
            store.placeholders.players[player]?.getComponent(Attractor)?.attract(store.cards[cardNumber]);
          }
        }
      } else {
        // Remove existing card
        if (existingCard?.number === 0) {
          existingCardEntity!.destroy();
        } else {
          // The attraction of the card should be automatically handled
        }
      }
    }

    const hand = this.state.players[this.player].hand;
    for (let i = 0; i < hand.length; i++) {
      repositionHandAttractor(i, hand.length);
      store.handAttractors[i].getComponent(Attractor)?.attract(store.cards[hand[i].number]);
    }

    // todo: enable / disable placeholders
  }

  get state() {
    return stripSecret(this.#state, this.player);
  }

  #state: GameState;
  player: number;
}