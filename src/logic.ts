import { GameState, setup, move, MoveName } from "take6-engine";
import { Entity } from "@hex-engine/2d";
import Card from "./Card";

export default class Logic {
  constructor() {
    this.state = setup(2, {}, "");
    this.player = 0;
  }

  handleCardDrop(card: Entity) {
    this.state = move(this.state, {name: MoveName.ChooseCard, data: card.getComponent(Card)!.card}, this.player);
  }

  state: GameState;
  player: number;
}