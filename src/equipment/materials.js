import * as THREE from 'three';

/** 共享材质库 */
export const MAT = {
  steel: new THREE.MeshStandardMaterial({ color: 0x9aa5b1, roughness: 0.5, metalness: 0.6 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x4a5560, roughness: 0.6, metalness: 0.5 }),
  boilerShell: new THREE.MeshStandardMaterial({ color: 0x8fa3b8, roughness: 0.55, metalness: 0.35 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xb8b4ac, roughness: 0.9, metalness: 0.05 }),
  hall: new THREE.MeshStandardMaterial({
    color: 0x7f96b0, roughness: 0.4, metalness: 0.2,
    transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false,
  }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb0703a, roughness: 0.35, metalness: 0.8 }),
  pipeSteam: new THREE.MeshStandardMaterial({ color: 0xc0503c, roughness: 0.45, metalness: 0.4 }),
  pipeWater: new THREE.MeshStandardMaterial({ color: 0x3c78c0, roughness: 0.45, metalness: 0.4 }),
  pipeCool: new THREE.MeshStandardMaterial({ color: 0x37b8b2, roughness: 0.45, metalness: 0.3 }),
  duct: new THREE.MeshStandardMaterial({ color: 0x707a84, roughness: 0.7, metalness: 0.4 }),
  coal: new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.95, metalness: 0 }),
  tube: new THREE.MeshStandardMaterial({ color: 0x5f7f96, roughness: 0.4, metalness: 0.7 }),
  hot: new THREE.MeshStandardMaterial({ color: 0xd08030, roughness: 0.4, metalness: 0.6 }),
  gen: new THREE.MeshStandardMaterial({ color: 0x2e5f8a, roughness: 0.5, metalness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.8, metalness: 0.1 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.8, metalness: 0.1 }),
  green: new THREE.MeshStandardMaterial({ color: 0x4a7a4f, roughness: 0.8, metalness: 0.2 }),
};

export const v = (x, y, z) => new THREE.Vector3(x, y, z);

export function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** 矩形截面烟道/廊道：连接两点 */
export function ductBetween(a, b, w, h, mat = MAT.duct) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.lookAt(b);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** 圆截面管道：沿折线/曲线的 TubeGeometry */
export function pipe(points, radius, mat, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 10, closed), mat);
  m.castShadow = true;
  return m;
}

/** 粒子用柔和圆点贴图（程序化生成，无外部资源） */
let _spriteTex = null;
export function spriteTexture() {
  if (_spriteTex) return _spriteTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _spriteTex = new THREE.CanvasTexture(c);
  return _spriteTex;
}
