import { GameState, setup, move, MoveName } from "take6-engine";
import { Entity } from "@hex-engine/2d";
import Card from "./Card";
import { store } from "./Root";
import Attractor from "./Attractor";
import { repositionHandAttractor, overlaps } from "./positioning";

export default class Logic {
  constructor() {
    this.state = setup(2, {}, "");
    this.player = 0;
  }

  handleCardDrop(card: Entity) {
    try {
      const commands = this.state.players[this.player].availableMoves;

      if (!commands) {
        return;
      }

      const cardData = card.getComponent(Card)!.card;

      if (commands.chooseCard) {
        if (!commands.chooseCard.some(card => card.number === cardData.number)) {
          return;
        }
        if (!overlaps(card, store.placeholders.player)) {
          return;
        }

        this.state = move(this.state, {name: MoveName.ChooseCard, data: cardData}, this.player);
      } else if (commands.placeCard) {
        // Todo : proper move
        this.state = move(this.state, {name: MoveName.ChooseCard, data: cardData}, this.player);
      }


      console.log(this.state);
      const cardToFaceDown = store.cards[this.state.players[this.player].faceDownCard?.number];
      if (cardToFaceDown) {
        store.placeholders.player?.getComponent(Attractor)?.attract(cardToFaceDown);
      }

      const hand = this.state.players[this.player].hand;
      for (let i = 0; i < hand.length; i++) {
        repositionHandAttractor(i, hand.length);
        store.handAttractors[i].getComponent(Attractor)?.attract(store.cards[hand[i].number]);
      }

      // todo: enable / disable placeholders
    } catch (err) {

    }
  }

  state: GameState;
  player: number;
}