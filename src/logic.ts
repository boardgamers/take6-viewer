import { range } from "lodash";
import { GameState, setup, move, MoveName, moveAI } from "take6-engine";
import { Entity, Geometry, useChild } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";
import { repositionHandAttractor, overlaps } from "./positioning";
import { stripSecret } from "take6-engine/src/engine";
import Runner from "./Runner";

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

    this.updateUI(false);
  }

  get canAIMove() {
    return this.#state.players.filter(pl => pl !== this.#state.players[this.player]).some(pl => pl.availableMoves);
  }

  get AIThatCanMove() {
    return this.#state.players.indexOf(this.#state.players.filter(pl => pl !== this.#state.players[this.player]).find(pl => !!pl.availableMoves)!);
  }

  updateUI(auto = true) {
    console.log("updated UI", auto, store.waitingAnimations, this.canAIMove);
    if (auto && store.waitingAnimations === 0 && this.canAIMove) {
      this.#state = moveAI(this.#state, this.AIThatCanMove);
    }

    // console.log(this.#state);
    for (const player of range(0, this.state.players.length)) {
      const placeholder = store.placeholders.players[player];
      const cardNumber = this.state.players[player].faceDownCard?.number;
      const attractees: Entity[] = [...placeholder?.getComponent(Attractor)!.attractees];
      const existingCardEntity = attractees?.find(entity => entity.getComponent(Card));
      const existingCard = existingCardEntity?.getComponent(Card)?.card;

      // console.log(player, existingCard?.number, cardNumber);
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
          store.canvasCenter.getComponent(Runner)?.run(() => {
            const entity = useChild(() => Card(placeholder.getComponent(Geometry)?.position!, {number: 0, points: 0}));
            store.placeholders.players[player]?.getComponent(Attractor)?.attract(entity);
          });
          this.stackAnimation(200);
        } else {
          if (!store.cards[cardNumber]) {
            store.canvasCenter.getComponent(Runner)?.run(() => {
              const entity = useChild(() => Card(placeholder.getComponent(Geometry)?.position!, this.state.players[player].faceDownCard));
              placeholder?.getComponent(Attractor)?.attract(entity);
            });
            this.stackAnimation(200);
          } else {
            placeholder?.getComponent(Attractor)?.attract(store.cards[cardNumber]);
            // TODO: animation on attract
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

    for (let i = 0; i < store.placeholders.rows.length; i++) {
      for (let j = 0; j < store.placeholders.rows[i].length; j++) {
        const placeholder = store.placeholders.rows[i][j];
        const card = this.state.rows[i][j];
        const cardNumber = card?.number;
        const attractees: Entity[] = [...placeholder?.getComponent(Attractor)!.attractees];
        const existingCardEntity = attractees?.find(entity => entity.getComponent(Card));
        const existingCard = existingCardEntity?.getComponent(Card)?.card;

        // console.log(player, existingCard?.number, cardNumber);
        if (existingCard?.number === cardNumber) {
          continue;
        }

        if (cardNumber !== undefined) {
          if (!store.cards[cardNumber]) {
            store.canvasCenter.getComponent(Runner)?.run(() => {
              const entity = useChild(() => Card(placeholder.getComponent(Geometry)?.position!, card));
              placeholder?.getComponent(Attractor)?.attract(entity);
            });
            // this.stackAnimation(200);
          } else {
            placeholder?.getComponent(Attractor)?.attract(store.cards[cardNumber]);
            // TODO: animation on attract
          }
        } else {
          // Remove existing card
          existingCardEntity!.destroy();
        }
      }
    }

    const hand = this.state.players[this.player].hand;
    for (let i = 0; i < hand.length; i++) {
      repositionHandAttractor(i, hand.length);
      store.handAttractors[i].getComponent(Attractor)?.attract(store.cards[hand[i].number]);
    }

    // todo: enable / disable placeholders

    if (store.waitingAnimations === 0 && this.canAIMove) {
      setTimeout(() => this.updateUI());
    }

    console.log(this.state);
  }

  get state() {
    return stripSecret(this.#state, this.player);
  }

  stackAnimation(delay: number = 0) {
    store.waitingAnimations += 1;

    if (delay) {
      setTimeout(() => this.onAnimationFinished(), delay);
    }
  }

  onAnimationFinished() {
    store.waitingAnimations = Math.max(store.waitingAnimations - 1, 0);

    if (store.waitingAnimations === 0) {
      this.updateUI();
    }
  }

  #state: GameState;
  player: number;
}