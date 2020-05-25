import { useType, useNewComponent, Geometry, Polygon, Vector, useCanvasSize, useRootEntity, Canvas, useWindowSize } from "@hex-engine/2d";
import { resolution, coverSize } from "./constants";

export default function CanvasCenter() {
  useType(CanvasCenter);

  const {canvasSize, onCanvasResize} = useCanvasSize();

  const geo = useNewComponent(() => Geometry({shape: new Polygon([]), position: new Vector(canvasSize.x/2, canvasSize.y/2)}));

  const updateZoom = () => {
    const canvas = useRootEntity().getComponent(Canvas)!;

    const minZoom = Math.min(windowSize.x / (coverSize.width * resolution), windowSize.y / (coverSize.height * resolution));
    canvas.fullscreen({ pixelZoom: minZoom });
    updatePos();
  }

  const updatePos = () => {
    const canvas = useRootEntity().getComponent(Canvas)!;
    geo.position.mutateInto({x: canvas.element.width/2, y: canvas.element.height/2});
  };

  const {windowSize, onWindowResize} =  useWindowSize();

  onWindowResize(updateZoom);
  updateZoom();


  onCanvasResize(updatePos);
}