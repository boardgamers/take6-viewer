import { Vector, Geometry, Entity, Polygon } from "@hex-engine/2d";

export function overlaps(entity1?: Entity, entity2?: Entity): boolean {
  if (!entity1 || !entity2) {
    return false;
  }

  const geo1 = entity1.getComponent(Geometry);
  const geo2 = entity2.getComponent(Geometry);

  if (!geo1 || !geo2) {
    return false;
  }

  // An optimisation could be to first check whether or not the bounding rectangles / circles overlap or not

  // Now we convert polygons
  const points1 = (geo1.shape as Polygon).points.map(point => point.rotate(geo1.rotation).addMutate(geo1.position));
  const points2 = (geo2.shape as Polygon).points.map(point => point.rotate(geo2.rotation).addMutate(geo2.position));

  const edges1 = points1.map((point, i) => i === 0 ? [points1.slice(-1)[0], point] : [points1[i-1], point]);
  const edges2 = points2.map((point, i) => i === 0 ? [points2.slice(-1)[0], point] : [points2[i-1], point]);

  for (const edge of [...edges1, ...edges2]) {
    const axis = edge[1].subtract(edge[0]).normalizeMutate().rotateMutate(Math.PI/2);

    const [min1, max1] = projectPolygon(points1, axis);
    const [min2, max2] = projectPolygon(points2, axis);

    if (min1 <= min2 && max1 >= min2 || min2 <= min1 && max2 >= min1) {
      // Overlap, colliding?
    } else {
      return false;
    }
  }

  return true;
}

function projectPolygon(points: Vector[], axis: Vector) {
  const products = points.map(point => point.x * axis.x + point.y * axis.y);

  return [Math.min(...products), Math.max(...products)];
}
