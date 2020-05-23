import {
  useType,
  Geometry,
  Vector,
  useUpdate,
  Entity,
  Physics,
  useEntity,
  useCurrentComponent,
  Component,
} from "@hex-engine/2d";
import { store, logic } from "./Root";

export default function Attractor() {
  useType(Attractor as any);

  useUpdate((ms) => {
    // console.log("useupdate", ms);
    const mainGeo = useEntity().getComponent(Geometry);

    if (!mainGeo) {
      return;
    }

    for (const attractee of attractees) {
      const geometry = attractee.getComponent(Geometry)!;
      const position = geometry.position!;
      const physics = attractee.getComponent(Physics.Body)!;
      const positionDiff = mainGeo.position.subtract(position);
      const force = positionDiff.multiply(0.5 / 100000);
      const rotationDiff = mainGeo.rotation - geometry.rotation;
      const magnitude = positionDiff.magnitude;

      let reachedPosition = magnitude < 1 || (positionDiff.x*physics.body.velocity.x + positionDiff.y * physics.body.velocity.y) < 0;
      let reachedRotation = Math.abs(rotationDiff) < 0.02;

      if (reachedPosition) {
        physics.setVelocity(new Vector(0, 0));
        physics.setPosition(mainGeo.position.clone());
      } else {
        if (magnitude < 500) {
          force.multiplyMutate(500 / magnitude);
        }
        physics.applyForce(position, force);
      }
      if (reachedRotation) {
        physics.setAngle(mainGeo.rotation);
        physics.setAngularVelocity(0);
      } else {
        physics.setAngularVelocity(rotationDiff > 0 ? 0.01 : -0.01);
      }
      if (!geometry.scale.equals(mainGeo.scale)) {
        geometry.scale.mutateInto(mainGeo.scale);
      }

      if (reachedRotation && reachedPosition && !reachedDestination.has(attractee)) {
        reachedDestination.add(attractee);
        logic.onAnimationFinished();
      }
    }
  });

  const attractees = new Set<Entity>();
  const reachedDestination = new Set<Entity>();
  const self = useCurrentComponent();

  return {
    attract(this: Component & ReturnType<typeof Attractor>, entity: Entity) {
      store.attractedBy.get(entity)?.unlink(entity);
      attractees.add(entity);
      store.attractedBy.set(entity, this);

      if (!reachedDestination.has(entity)) {
        logic.stackAnimation();
      }
    },
    unlink(entity: Entity) {
      attractees.delete(entity);

      if (reachedDestination.has(entity)) {
        reachedDestination.delete(entity);
      } else {
        // We stopped the animation midway, so we need to indicate
        setTimeout(() => logic.onAnimationFinished());
      }

      if (store.attractedBy.get(entity) === self) {
        store.attractedBy.delete(entity);
      }
    },
    attractees
  }
}
