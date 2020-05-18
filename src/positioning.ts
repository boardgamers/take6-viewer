import { store } from "./Root";
import { Vector, Geometry, Entity, Physics } from "@hex-engine/2d";
import { Bounds } from "matter-js";

export function canvasCenter() {
  return new Vector(store.canvas.element.width/2, store.canvas.element.height/2);
}

export function repositionHandAttractor(index: number, handLength: number) {
  const center = canvasCenter();

  const geo = store.handAttractors[index].getComponent(Geometry)!;

  geo.position.mutateInto(new Vector(0, -800).rotateMutate(-(index-(handLength-1)/2) * 0.04).addMutate(center).addYMutate(950));
  geo.rotation = (index - (handLength - 1)/2) * 0.03;
}

export function getBounds(entity: Entity) {
  return entity.getComponent(Physics.Body)?.body.bounds;
}

export function overlaps(entity1?: Entity, entity2?: Entity): boolean {
  if (!entity1 || !entity2) {
    return false;
  }

  const bounds1 = getBounds(entity1);
  const bounds2 = getBounds(entity2);

  return !!(bounds1 && bounds2 && Bounds.overlaps(bounds1, bounds2));
}