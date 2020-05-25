import { useType } from "@hex-engine/2d"

export default function CustomPhysics() {
  useType(CustomPhysics);

  const body = {
    velocity: 0,
    rotationVelocity: 0,
    static: false
  };

  return {body};
}