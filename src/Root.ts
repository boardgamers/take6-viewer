import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
} from "@hex-engine/2d";
import Card from "./Card";
import Attractor from "./Attractor";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "#444" }));
  canvas.fullscreen({ pixelZoom: 2 });

  const engine = useNewComponent(Physics.Engine);
  engine.engine.world.gravity.y = 0;

  const canvasCenter = new Vector(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  for (let i = 9; i >= 0; i--) {
    const child = useChild(() => new Card(canvasCenter.addX((i-4.5)*45), {number: i, points: 1}))

    const attractor = useChild(() => new Attractor(canvasCenter.addX((i-4.5)*30).addYMutate(160 + Math.abs((i - 4.5)*3)), (i - 4.5) * 0.05));
    attractor.rootComponent.attractees.add(child);
  }
}
