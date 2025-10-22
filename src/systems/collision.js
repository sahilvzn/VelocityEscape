export function aabbIntersect(a, b) {
  return !(
    a.maxX < b.minX || a.minX > b.maxX ||
    a.maxY < b.minY || a.minY > b.maxY ||
    a.maxZ < b.minZ || a.minZ > b.maxZ
  );
}

export function getBoxFromObject(obj, half = { x: 0.6, y: 0.5, z: 1.1 }) {
  const pos = obj.position || obj.mesh?.position || obj.group?.position || { x: 0, y: 0, z: 0 };
  return {
    minX: pos.x - half.x, maxX: pos.x + half.x,
    minY: pos.y - half.y, maxY: pos.y + half.y,
    minZ: pos.z - half.z, maxZ: pos.z + half.z,
  };
}
