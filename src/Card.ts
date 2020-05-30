import {
  useDraw,
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  SystemFont,
  Label,
  useEntity,
  Mouse,
  useCurrentComponent,
  useDestroy,
} from "@hex-engine/2d";
import Draggable from "./Draggable";
import { Card as ICard } from "take6-engine";
import {store} from "./Root";
import Runner from "./Runner";
import { resolution } from './constants';
import CustomPhysics from "./CustomPhysics";

export default function Card(position: Vector, card: ICard) {
  useType(Card);
  const self = useCurrentComponent();

  if (!useEntity().getComponent(Runner)) {
    useNewComponent(Runner);
  }

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(40, 60).multiplyMutate(resolution)),
      position: position.clone()
    })
  );

  const font = useNewComponent(() => SystemFont({name: "sans-serif", size: 12 * resolution}))
  const label = useNewComponent(() => Label({font}));

  useNewComponent(() => CustomPhysics());
  const draggable = useNewComponent(() => Draggable(geometry));

  draggable.on("dragStop", () => {
    store.logic!.handleCardDrop(self.entity);
  });

  useDraw((context) => {
    if (card.number === 0) {
      context.fillStyle = "#ccc";
    } else {
      context.fillStyle = "#6666ff";
    }
    if (useEntity().getComponent(Mouse)!.isInsideBounds) {
      context.fillStyle = "green";
    }
    geometry.shape.draw(context, "fill");
    context.strokeStyle = "red";
    context.lineWidth = 1 * resolution;
    geometry.shape.draw(context, "stroke");

    if (card.number) {
      label.text = card.number.toString();
      label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 2 * resolution});
    }

    if (card.points) {
      for (let i = 0; i < card.points; i++) {
        context.fillStyle = "red";
        const j = (i % 2 === 0) ? 3 - Math.ceil(i/2) : 3 + Math.ceil(i/2);
        context.fillRect(5 * resolution, (5 + j*7.5) * resolution, 5 * resolution, 5 * resolution);
        context.fillRect(30 * resolution, (5 + j*7.5) * resolution, 5 * resolution, 5 * resolution);
      }
    }
  });

  if (card.number) {
    const entity = useEntity();
    store.ui!.cards[card.number] = entity;
    useDestroy().onDestroy(() => {
      if (store.ui!.cards[card.number] === entity) {
        delete store.ui!.cards[card.number];
      }
    });
  }

  return {
    card
  };
}
