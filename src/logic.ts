import { cloneDeep } from "lodash";
import { GameState, setup, move, MoveName, moveAI, stripSecret, GameEventName } from "take6-engine";
import { Entity, Geometry, useChild } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";
import { repositionHandAttractor, overlaps } from "./positioning";
import Runner from "./Runner";

export default class Logic {
  constructor() {
    this.#state = setup(10, {}, "");
    this.player = 0;
    this.state = cloneDeep(stripSecret(this.#state, this.player));
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

  advanceLog() {
    const logItem = stripSecret(this.#state, this.player).log[this.state.log.length];
    this.state.log.push(logItem);

    switch (logItem.type) {
      case "phase": return;
      case "move": {
        const {player, move} = logItem;

        switch (move.name) {
          case MoveName.ChooseCard: {
            const placeholder = store.placeholders.players[player];

            const  entity = store.cards[move.data.number] ?? store.canvasCenter.getComponent(Runner)?.run(() => {
              return useChild(() => Card(placeholder.getComponent(Geometry)?.position!, move.data));
            });

            placeholder.getComponent(Attractor)?.attract(entity);

            this.delay(200);

            if (player === this.player) {
              this.state.players[this.player].hand = this.state.players[this.player].hand.filter(card => card.number !== move.data.number);
              const hand = this.state.players[this.player].hand;
              for (let i = 0; i < hand.length; i++) {
                repositionHandAttractor(i, hand.length);
                store.handAttractors[i].getComponent(Attractor)?.attract(store.cards[hand[i].number]);
              }
            } else {
              this.state.players[player].hand.shift();
            }
            return;
          }
          case MoveName.PlaceCard: {
            const card = this.state.players[player].faceDownCard;
            if (move.data.replace) {
              // put new card on 6th spot
              const placeholder = store.placeholders.rows[move.data.row][5];
              placeholder.getComponent(Attractor).attract(store.cards[card.number]);

              this.queueAnimation(() => this.delay(200));
              this.queueAnimation(() => {
                // Then remove all existing cards from row
                for (const card of this.state.rows[move.data.row]) {
                  store.cards[card.number].destroy();
                }
                this.state.rows[move.data.row] = [];
              });
              this.queueAnimation(() => this.delay(300));
            }

            // Then move card to correct spot
            this.queueAnimation(() => {
              this.state.rows[move.data.row].push(card);

              const placeholder = store.placeholders.rows[move.data.row][this.state.rows[move.data.row].length - 1];
              placeholder.getComponent(Attractor).attract(store.cards[card.number]);
            });
            return;
          }
          default: return;
        }
      }
      case "event": {
        const {event} = logItem;
        switch (event.name) {
          case GameEventName.RevealCards: {
            const cards = event.cards;

            for (let player = 0; player < cards.length; player++) {
              const placeholder = store.placeholders.players[player];
              const attractees: Entity[] = [...placeholder?.getComponent(Attractor)!.attractees];
              const existingCardEntity = attractees?.find(entity => entity.getComponent(Card));
              const existingCard = existingCardEntity?.getComponent(Card)?.card;

              const newCard = cards[player];

              this.state.players[player].faceDownCard = newCard;

              if (existingCard?.number === newCard?.number) {
                continue;
              }

              existingCardEntity?.destroy();

              const entity = store.cards[newCard.number] ?? store.canvasCenter.getComponent(Runner)?.run(() => {
                return useChild(() => Card(placeholder.getComponent(Geometry)?.position!, newCard));
              });

              placeholder.getComponent(Attractor)?.attract(entity);
            }

            return;
          }
          default: return;
        }
      }
    }
  }

  updateUI(auto = true) {
    if (store.waitingAnimations) {
      console.log("waiting animations", store.waitingAnimations);
      return;
    }

    if (this.#animationQueue.length > 0) {
      this.#animationQueue.shift()!();
      this.delay(0);
      return;
    }

    if (this.state.log.length < this.#state.log.length) {
      this.advanceLog();
      this.delay(0);
      return;
    }

    console.log("updated UI", auto, this.canAIMove, this.AIThatCanMove);
    if (auto && this.canAIMove) {
      this.#state = moveAI(this.#state, this.AIThatCanMove);
      this.delay(0);
    }

    // todo: enable / disable placeholders
  }

  queueAnimation(fn: () => any) {
    this.delay(0);
    this.#animationQueue.push(fn);
  }

  delay(ms: number) {
    this.stackAnimation();

    setTimeout(() => this.onAnimationFinished(), ms);
  }

  stackAnimation() {
    store.waitingAnimations += 1;
  }

  onAnimationFinished() {
    store.waitingAnimations = Math.max(store.waitingAnimations - 1, 0);

    if (store.waitingAnimations === 0) {
      this.updateUI();
    }
  }

  state: GameState;
  #state: GameState;
  player: number;

  #animationQueue: Array<() => any> = [];
}