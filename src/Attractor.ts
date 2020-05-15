import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  useUpdate,
  Entity,
  Physics,
} from "@hex-engine/2d";

export default function Attractor(position: Vector, rotation = 0) {
  useType(Attractor as any);

  const mainGeo = useNewComponent(() =>
    Geometry({
      shape: new Polygon([]),
      position: position.clone(),
      rotation
    })
  );

  let x = 0;

  useUpdate((ms) => {
    // console.log("useupdate", ms);

    for (const attractee of attractees) {
      const geometry = attractee.getComponent(Geometry)!;
      const position = geometry.position!;
      const physics = attractee.getComponent(Physics.Body)!;
      const positionDiff = mainGeo.position.subtract(position);
      const force = positionDiff.multiply(0.4 * ms / 1000000);
      const rotationDiff = mainGeo.rotation - geometry.rotation;
      const magnitude = positionDiff.magnitude;

      if (magnitude < 1 || (positionDiff.x*physics.body.velocity.x + positionDiff.y * physics.body.velocity.y) < 0) {
        physics.setVelocity(new Vector(0, 0));
        physics.setPosition(mainGeo.position.clone());
      } else {
        physics.applyForce(position, force);
      }
      if (Math.abs(rotationDiff) < 0.02) {
        physics.setAngularVelocity(0);
      } else {
        physics.setAngularVelocity(rotationDiff > 0 ? 0.01 : -0.01);
      }
    }
    x++;
  });

  const attractees = new Set<Entity>();

  return {
    attractees
  }
}
