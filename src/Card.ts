import {
  useDraw,
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  SystemFont,
  Label,
  Physics,
  useEntity,
  Mouse,
  useCurrentComponent,
} from "@hex-engine/2d";
import Draggable from "./Draggable";
import { Card as ICard } from "take6-engine";
import {logic, store} from "./Root";

export default function Card(position: Vector, card: ICard) {
  useType(Card);
  const self = useCurrentComponent();

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(40, 60)),
      position: position.clone()
    })
  );

  const font = useNewComponent(() => SystemFont({name: "sans-serif", size: 12}))
  const label = useNewComponent(() => Label({font}));

  useNewComponent(() => Physics.Body(geometry, {isSensor: true}));
  const draggable = useNewComponent(() => Draggable(geometry));

  draggable.on("dragStop", () => {
    logic.handleCardDrop(self.entity);
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
    geometry.shape.draw(context, "stroke");

    if (card.number) {
      label.text = card.number.toString();
      label.draw(context, {x: (geometry.shape.width - label.size.x) / 2, y: (geometry.shape.height - label.size.y) / 2 + 2});
    }
  });

  if (card.number) {
    store.cards[card.number] = useEntity();
  }

  return {
    card
  };
}
