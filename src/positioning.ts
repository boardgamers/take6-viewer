import { store } from "./Root";
import { Vector, Geometry } from "@hex-engine/2d";

export function canvasCenter() {
  return new Vector(store.canvas.element.width/2, store.canvas.element.height/2);
}

export function repositionHandAttractor(index: number, handLength: number) {
  const center = canvasCenter();

  const geo = store.handAttractors[index].getComponent(Geometry)!;

  geo.position.mutateInto(new Vector(0, -800).rotateMutate(-(index-(handLength-1)/2) * 0.04).addMutate(center).addYMutate(950));
  geo.rotation = (index - (handLength - 1)/2) * 0.03;
}