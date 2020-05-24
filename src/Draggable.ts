import {
  useType,
  useNewComponent,
  useEntity,
  Geometry,
  Mouse,
  Vector,
  useCurrentComponent,
} from "@hex-engine/2d";
import { store } from "./Root";
import { EventEmitter } from "events";
import CustomPhysics from "./CustomPhysics";

export default function Draggable(geometry: ReturnType<typeof Geometry>) {
  useType(Draggable);

  const physics = useEntity().getComponent(CustomPhysics);

  const mouse = useNewComponent(Mouse);

  let isDragging = false;
  const startedDraggingAt = new Vector(0, 0);

  const emitter = new EventEmitter();

  const component = useCurrentComponent();

  mouse.onDown((event) => {
    if (physics) {
      physics.body.static = true;
      store.dragged = component.entity;
    }
    isDragging = true;
    startedDraggingAt.mutateInto(event.pos);
  });

  mouse.onMove((event) => {
    if (isDragging) {
      geometry.position.addMutate(event.pos.subtract(startedDraggingAt));
    }
  });

  mouse.onUp(() => {
    if (physics) {
      physics.body.static = false;
    }
    if (store.dragged === component.entity) {
      delete store.dragged;
      emitter.emit("dragStop");
    }
    isDragging = false;
  });

  return emitter;
}
