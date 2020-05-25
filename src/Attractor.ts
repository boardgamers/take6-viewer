import {
  useType,
  Geometry,
  useUpdate,
  Entity,
  useEntity,
  useCurrentComponent,
  Component,
  useDestroy,
} from "@hex-engine/2d";
import { store, logic } from "./Root";
import Runner from "./Runner";
import { resolution } from "./constants";
import CustomPhysics from "./CustomPhysics";
import Card from "./Card";

export default function Attractor() {
  useType(Attractor as any);

  useUpdate((ms) => {
    // console.log("useupdate", ms);
    const mainGeo = useEntity().getComponent(Geometry);

    if (!mainGeo) {
      return;
    }

    for (const attractee of attractees) {
      const physics = attractee.getComponent(CustomPhysics)!;

      if (physics.body.static) {
        continue;
      }

      const geometry = attractee.getComponent(Geometry)!;
      const position = geometry.position!;
      const positionDiff = mainGeo.position.subtract(position);
      const rotationDiff = mainGeo.rotation - geometry.rotation;
      const magnitude = positionDiff.magnitude;

      let reachedPosition = magnitude < 1 * resolution;
      let reachedRotation = Math.abs(rotationDiff) < 0.02;

      if (reachedPosition) {
        physics.body.velocity = 0;
        geometry.position.mutateInto(mainGeo.position);
      } else {
        physics.body.velocity += 1;
        if (physics.body.velocity > 10) {
          physics.body.velocity = 10;
        }
        const newPosition = position.add(positionDiff.normalize().multiplyMutate(physics.body.velocity * resolution));

        const vec1 = geometry.position.subtract(mainGeo.position);
        const vec2 = newPosition.subtract(mainGeo.position);

        if (vec1.x * vec2.x + vec1.y * vec2.y < 0) {
          reachedPosition = true;
          physics.body.velocity = 0;
          geometry.position.mutateInto(mainGeo.position);
        } else {
          geometry.position.mutateInto(newPosition);
        }
      }
      if (reachedRotation) {
        geometry.rotation = mainGeo.rotation;
      } else {
        geometry.rotation += (rotationDiff > 0 ? 0.01 : -0.01);
      }
      if (!geometry.scale.equals(mainGeo.scale)) {
        geometry.scale.mutateInto(mainGeo.scale);
      }

      if (reachedRotation && reachedPosition && !reachedDestination.has(attractee)) {
        reachedDestination.add(attractee);
        console.log("reached destination", attractee.getComponent(Card)?.card);
        logic.onAnimationFinished();
      }
    }
  });

  const attractees = new Set<Entity>();
  const reachedDestination = new Set<Entity>();
  const self: Component & ReturnType<typeof Attractor> = useCurrentComponent();

  useDestroy().onDestroy(() => {
    for (const entity of [...attractees]) {
      self.unlink(entity);
    }
  });

  return {
    attract(this: Component & ReturnType<typeof Attractor>, entity: Entity) {
      store.attractedBy.get(entity)?.unlink(entity);
      attractees.add(entity);
      store.attractedBy.set(entity, this);

      if (!reachedDestination.has(entity)) {
        logic.stackAnimation();
      }

      entity.getComponent(Runner)?.run(() => useDestroy().onDestroy(() => self.unlink(entity)));
    },
    unlink(entity: Entity) {
      if (!attractees.delete(entity)) {
        return;
      }

      if (reachedDestination.has(entity)) {
        reachedDestination.delete(entity);
      } else {
        // We stopped the animation midway, so we need to indicate
        setTimeout(() => {if (!reachedDestination.has(entity)) {
          console.log("premature destroying of", entity?.getComponent(Card)?.card);
          logic.onAnimationFinished();
        }});
      }

      if (store.attractedBy.get(entity) === self) {
        store.attractedBy.delete(entity);
      }
    },
    attractees
  }
}
