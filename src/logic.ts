import { cloneDeep, sumBy, isEqual } from "lodash";
import { GameState, setup, move, MoveName, moveAI, stripSecret, GameEventName, Card as ICard, AvailableMoves, availableMoves, LogItem } from "take6-engine";
import { Entity } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";
import { overlaps } from "./positioning";
import Placeholder from "./Placeholder";
import { repositionHandAttractor, createHand, createBoard, placeFacedownCards, placeFacedownCard, enableDisablePlaceholders } from "./ui";
import { EventEmitter } from "events";

export default class Logic extends EventEmitter {
  constructor(data?: GameState, player = 0, local = true) {
    super();

    this.#state = data ?? setup(10, {}, "");
    this.player = player;
    this.isLocal = local;
    this.state = cloneDeep(stripSecret(this.#state, this.player));
  }

  overwrite(data: GameState) {
    console.log("overwriting with", data);
    this.#state = data;
    this.state = cloneDeep(data);

    for (const card of Object.values(store.ui!.cards)) {
      card.destroy();
    }

    createHand();
    createBoard();
    placeFacedownCards();
  }

  handleCardDrop(card: Entity) {
    const commands = this.state.players[this.player].availableMoves;

    if (!commands) {
      return;
    }

    if (this.state.log.length !== this.#state.log.length) {
      return;
    }

    const cardData = card.getComponent(Card)!.card;

    if (commands.chooseCard) {
      if (!commands.chooseCard.some(card => card.number === cardData.number)) {
        return;
      }
      if (!overlaps(card, store.ui!.placeholders.players[this.player])) {
        return;
      }

      if (this.isLocal) {
        this.#state = move(this.#state, {name: MoveName.ChooseCard, data: cardData}, this.player);
      } else {
        this.#state.log.push({type: "move", move: {name: MoveName.ChooseCard, data: cardData}, player: this.player});
        this.#state.players[this.player].availableMoves = null;
        this.emit("move", {name: MoveName.ChooseCard, data: cardData});
      }
      this.updateAvailableMoves();
    } else if (commands.placeCard) {
      for (const data of commands.placeCard) {
        if (store.ui!.placeholders.rows[data.row].some(placeholder => placeholder.getComponent(Placeholder)!.data.enabled && overlaps(card, placeholder))) {
          if (this.isLocal) {
            this.#state = move(this.#state, {name: MoveName.PlaceCard, data}, this.player);
          } else {
            this.#state.log.push({type: "move", move: {name: MoveName.PlaceCard, data}, player: this.player});
            this.#state.players[this.player].availableMoves = null;
            this.emit("move", {name: MoveName.PlaceCard, data});
          }
          this.updateAvailableMoves();
          break;
        }
      }
    }

    this.updateUI();
  }

  updateAvailableMoves() {
    if (this.player !== undefined) {
      this.state.players[this.player].availableMoves = cloneDeep(this.#state.players[this.player].availableMoves);
    }
  }

  canPlayerMove(playerIndex: number) {
    return !!this.#state.players[playerIndex].availableMoves;
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
            placeFacedownCard(player, move.data);

            this.delay(200);

            if (player === this.player) {
              this.state.players[this.player].hand = this.state.players[this.player].hand.filter(card => card.number !== move.data.number);
              const hand = this.state.players[this.player].hand;
              for (let i = 0; i < hand.length; i++) {
                repositionHandAttractor(i, hand.length);
                store.ui!.handAttractors[i].getComponent(Attractor)?.attract(store.ui!.cards[hand[i].number]);
              }
            } else {
              this.state.players[player].hand.shift();
            }
            return;
          }
          case MoveName.PlaceCard: {
            const card = this.state.players[player].faceDownCard!;
            if (move.data.replace) {
              // put new card on 6th spot
              const placeholder = store.ui!.placeholders.rows[move.data.row].slice(-1)[0];
              placeholder.getComponent(Attractor).attract(store.ui!.cards[card.number]);

              this.queueAnimation(() => {
                console.log("delaying before taking row");
                this.delay(200);
              });
              this.queueAnimation(() => {
                console.log("Taking row");
                // Then remove all existing cards from row
                for (const card of this.state.rows[move.data.row]) {
                  store.ui!.cards[card.number].destroy();
                }
                this.state.players[player].points += sumBy(this.state.rows[move.data.row], "points");
                this.state.rows[move.data.row] = [];

                console.log("delaying after taking row");
                this.delay(300);
              });
            }

            // Then move card to correct spot
            this.queueAnimation(() => {
              console.log("attracting card to place on board", card);
              this.state.rows[move.data.row].push(card);

              const placeholder = store.ui!.placeholders.rows[move.data.row][this.state.rows[move.data.row].length - 1];
              placeholder.getComponent(Attractor).attract(store.ui!.cards[card.number]);
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
              const newCard = cards[player];

              this.state.players[player].faceDownCard = newCard;
              placeFacedownCard(player, newCard);
            }

            return;
          }
          case GameEventName.RoundStart: {
            for (const card of Object.values(store.ui!.cards)) {
              card.destroy();
            }

            this.state.rows = event.cards.board.map(card => [card]) as [ICard[], ICard[], ICard[], ICard[]];
            this.state.players.forEach((pl, i) => pl.hand = event.cards.players[i]);

            createHand();
            createBoard();

            return;
          }
          default: return;
        }
      }
    }
  }

  updateLog(data: {start: number, log: LogItem[], availableMoves: AvailableMoves[]}) {
    for (let i = 0; i < availableMoves.length; i++) {
      this.#state.players[i].availableMoves = availableMoves[i];
    }

    if (data.start > this.#state.log.length) {
      this.emit("fetchState");
      return;
    }

    // edge case when we do a move and another player just did a move
    if (data.start === this.#state.log.length && data.start > 0 && isEqual(data.log[0], this.#state.log.slice(-1)[0])) {
      this.emit("fetchState");
      return;
    }

    // Check if can be merged
    for (const localLogItem of this.#state.log.slice(data.start)) {
      if (!data.log.some(item => isEqual(item, localLogItem))) {
        this.emit("fetchState");
        return;
      }
    }

    this.#state.log = [...this.#state.log.slice(0, data.start), ...data.log];
    this.updateUI();
  }

  updateUI() {
    if (store.ui!.waitingAnimations) {
      // console.log("waiting animations", store.ui!.waitingAnimations);
      return;
    }

    if (this.#animationQueue.length > 0) {
      console.log("shifting queue");
      this.#animationQueue.shift()!();
      this.delay(0);
      return;
    }

    if (this.state.log.length < this.#state.log.length) {
      this.advanceLog();
      this.delay(0);
      return;
    }

    console.log("updated UI", this.canAIMove, this.AIThatCanMove);
    if (this.canAIMove && this.isLocal) {
      console.log("moving AI");
      this.#state = moveAI(this.#state, this.AIThatCanMove);
      this.updateAvailableMoves();
      this.delay(0);
    }

    enableDisablePlaceholders();
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
    store.ui!.waitingAnimations += 1;
  }

  onAnimationFinished() {
    store.ui!.waitingAnimations = Math.max(store.ui!.waitingAnimations - 1, 0);
    // console.log("on animation finished", store.ui!.waitingAnimations);

    if (store.ui!.waitingAnimations === 0) {
      this.updateUI();
    }
  }

  state: GameState;
  #state: GameState;
  player: number;
  isLocal: boolean;

  #animationQueue: Array<() => any> = [];
}