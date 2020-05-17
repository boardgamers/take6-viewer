import { GameState, setup, move, MoveName } from "take6-engine";
import { Entity } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";

export default class Logic {
  constructor() {
    this.state = setup(2, {}, "");
    this.player = 0;
  }

  handleCardDrop(card: Entity) {
    try {
      this.state = move(this.state, {name: MoveName.ChooseCard, data: card.getComponent(Card)!.card}, this.player);

      console.log(this.state);
      const cardToFaceDown = store.cards[this.state.players[this.player].faceDownCard?.number];
      if (cardToFaceDown) {
        store.placeholders.player?.getComponent(Attractor)?.attract(cardToFaceDown);
      }

      // todo: update hand attractors
    } catch (err) {

    }
  }

  state: GameState;
  player: number;
}