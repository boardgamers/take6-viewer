import {
  useType,
  useNewComponent,
  useEntity,
  Geometry,
  Physics,
  Mouse,
  Vector,
  useRootEntity,
  useCurrentComponent,
} from "@hex-engine/2d";
import Root from "./Root";

export default function Draggable(geometry: ReturnType<typeof Geometry>) {
  useType(Draggable);

  const physics = useEntity().getComponent(Physics.Body);

  const mouse = useNewComponent(Mouse);

  let isDragging = false;
  const startedDraggingAt = new Vector(0, 0);

  const component = useCurrentComponent();

  mouse.onDown((event) => {
    if (physics) {
      physics.setStatic(true);
      useRootEntity().getComponent(Root)!.data.dragged = component.entity;
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
      physics.setStatic(false);
    }
    if (useRootEntity().getComponent(Root)!.data.dragged === component.entity) {
      delete useRootEntity().getComponent(Root)!.data.dragged;
    }
    isDragging = false;
  });
}
