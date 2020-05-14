import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  useUpdate,
  Entity,
  Physics,
  Component,
} from "@hex-engine/2d";

export default class Attractor {
  constructor(position: Vector, rotation = 0) {
    useType(Attractor as any);

    this.geometry = useNewComponent(() =>
      Geometry({
        shape: new Polygon([]),
        position: position.clone(),
        rotation
      })
    );

    let x = 0;

    useUpdate((ms) => {
      // console.log("useupdate", ms);

      for (const attractee of this.attractees) {
        const geometry = attractee.getComponent(Geometry)!;
        const position = geometry.position!;
        const physics = attractee.getComponent(Physics.Body)!;
        const positionDiff = this.geometry.position.subtract(position);
        const force = positionDiff.multiply(0.1 * ms / 1000000);
        const rotationDiff = this.geometry.rotation - geometry.rotation;
        const magnitude = positionDiff.magnitude;

        if (magnitude < 1 || (positionDiff.x*physics.body.velocity.x + positionDiff.y * physics.body.velocity.y) < 0) {
          physics.setVelocity(new Vector(0, 0));
        } else {
          physics.applyForce(position.clone(), force);
        }
        if (Math.abs(rotationDiff) < 0.01) {
          physics.setAngularVelocity(0);
        } else {
          physics.setAngularVelocity(rotationDiff > 0 ? 0.01 : -0.01);
        }
      }
      x++;
    });
  }

  attractees = new Set<Entity>();
  geometry: Component & {rotation: number, position: Vector};
}
