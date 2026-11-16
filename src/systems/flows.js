import * as THREE from 'three';
import { spriteTexture, v } from '../equipment/materials.js';

/** 沿路径流动的粒子流（煤流 / 蒸汽 / 给水 / 烟气 / 冷却水 / 风） */
export class Flow {
  /**
   * @param {THREE.Vector3[]} points 路径控制点
   * @param {object} opts { color, size, count, speed, category, closed }
   */
  constructor(points, opts = {}) {
    const { color = 0xffffff, size = 0.8, count = 120, speed = 0.05, category = 'steam', closed = false } = opts;
    this.curve = new THREE.CatmullRomCurve3(points, closed);
    this.count = count;
    this.speed = speed;
    this.category = category;

    this.offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) this.offsets[i] = i / count;
    this.positions = new Float32Array(count * 3);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size, map: spriteTexture(),
      transparent: true, opacity: 0.9, depthWrite: false,
    }));
    this.points.frustumCulled = false;
    this.points.raycast = () => {}; // 粒子不参与拾取
  }

  update(time, load) {
    const s = this.speed * (0.25 + 0.75 * load);
    for (let i = 0; i < this.count; i++) {
      const t = (this.offsets[i] + time * s) % 1;
      const p = this.curve.getPointAt(t);
      this.positions[i * 3] = p.x;
      this.positions[i * 3 + 1] = p.y;
      this.positions[i * 3 + 2] = p.z;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/** 炉膛火焰（加色混合粒子 + 闪烁点光源） */
export class Flame {
  constructor(center, { radius = 4.5, height = 14, count = 350 } = {}) {
    this.center = center;
    this.radius = radius;
    this.height = height;
    this.count = count;
    this.seeds = new Float32Array(count * 2);
    for (let i = 0; i < count * 2; i++) this.seeds[i] = Math.random();

    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 2.4, map: spriteTexture(), vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.points.frustumCulled = false;
    this.points.raycast = () => {};

    this.light = new THREE.PointLight(0xff7733, 0, 60, 1.8);
    this.light.position.copy(center);
  }

  addTo(scene) {
    scene.add(this.points, this.light);
  }

  update(time, load) {
    const n = Math.max(10, Math.floor(this.count * load));
    for (let i = 0; i < n; i++) {
      const s1 = this.seeds[i * 2];
      const s2 = this.seeds[i * 2 + 1];
      const life = (s1 + time * (0.6 + s2 * 0.5)) % 1;
      const ang = s2 * Math.PI * 2 + time * (1 + s1);
      const r = this.radius * (1 - life) * (0.35 + 0.65 * s2);
      this.positions[i * 3] = this.center.x + Math.cos(ang) * r;
      this.positions[i * 3 + 1] = this.center.y + life * this.height;
      this.positions[i * 3 + 2] = this.center.z + Math.sin(ang) * r;
      // 颜色：底部亮黄 → 中部橙 → 顶部暗红
      const c = life < 0.4
        ? [1, 0.85 - life * 0.8, 0.3 - life * 0.5]
        : [1 - (life - 0.4) * 1.2, 0.53 - (life - 0.4) * 0.8, 0.1 - (life - 0.4) * 0.15];
      this.colors[i * 3] = Math.max(0.15, c[0]);
      this.colors[i * 3 + 1] = Math.max(0.02, c[1]);
      this.colors[i * 3 + 2] = Math.max(0, c[2]);
    }
    this.points.geometry.setDrawRange(0, n);
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
    // 火光闪烁
    this.light.intensity = 1200 * load * (0.85 + 0.15 * Math.sin(time * 13) * Math.sin(time * 7.3));
  }
}

/** 烟囱 / 冷却塔顶部羽流 */
export class Plume {
  constructor(center, { count = 90, height = 28, spread = 7, color = 0xf0f0f0, drift = [2, 0, 1], opacity = 0.4 } = {}) {
    this.center = center;
    this.height = height;
    this.spread = spread;
    this.drift = drift;
    this.count = count;
    this.seeds = new Float32Array(count * 2);
    for (let i = 0; i < count * 2; i++) this.seeds[i] = Math.random();

    this.positions = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size: 5, map: spriteTexture(),
      transparent: true, opacity, depthWrite: false,
    }));
    this.points.frustumCulled = false;
    this.points.raycast = () => {};
  }

  update(time, load) {
    const n = Math.max(5, Math.floor(this.count * load));
    for (let i = 0; i < n; i++) {
      const s1 = this.seeds[i * 2];
      const s2 = this.seeds[i * 2 + 1];
      const life = (s1 + time * 0.1) % 1;
      const r = this.spread * (0.2 + life) * (0.4 + 0.6 * s2);
      const ang = s2 * Math.PI * 2 + time * 0.3;
      this.positions[i * 3] = this.center.x + Math.cos(ang) * r + this.drift[0] * life * 6;
      this.positions[i * 3 + 1] = this.center.y + life * this.height;
      this.positions[i * 3 + 2] = this.center.z + Math.sin(ang) * r + this.drift[2] * life * 6;
    }
    this.points.geometry.setDrawRange(0, n);
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/** 创建全厂工艺流程粒子系统 */
export function createProcessFlows(scene) {
  const flows = [
    // 煤流：煤场 → 栈桥 → 煤仓
    new Flow([v(-80, 6.5, 24), v(-66, 17, 13), v(-52, 29.5, 3), v(-50, 31.5, 0)],
      { color: 0x55555e, size: 1.0, count: 100, speed: 0.04, category: 'coal' }),
    // 煤流：煤仓 → 磨煤机 → 燃烧器
    new Flow([v(-50, 17, 0), v(-50, 6, 0), v(-46, 7, -2), v(-41, 9.5, -4)],
      { color: 0x55555e, size: 0.8, count: 60, speed: 0.08, category: 'coal' }),
    // 送风：送风机 → 炉膛
    new Flow([v(-24, 3, -14), v(-28, 6, -11), v(-34, 9, -9)],
      { color: 0x7fb8e8, size: 0.7, count: 50, speed: 0.12, category: 'air' }),
    // 主蒸汽：锅炉汽包 → 高压缸
    new Flow([v(-35, 38, 0), v(-35, 41, 0), v(-8, 41, 0), v(2, 14, 0), v(5, 9.5, 0)],
      { color: 0xff8a5c, size: 0.9, count: 120, speed: 0.1, category: 'steam' }),
    // 再热蒸汽：汽机 → 锅炉 → 中压缸
    new Flow([v(13, 10, 2.5), v(-10, 16, 6), v(-28, 32, 6), v(-28, 33, 8), v(-5, 18, 9), v(13, 9.5, 3.5)],
      { color: 0xffb37f, size: 0.7, count: 100, speed: 0.08, category: 'steam' }),
    // 给水：凝汽器 → 锅炉汽包
    new Flow([v(22, 1.2, 0), v(14, 1, -5), v(0, 2, -8), v(-24, 4, -9), v(-33, 12, -4), v(-35, 34, -2)],
      { color: 0x5ca8ff, size: 0.8, count: 120, speed: 0.08, category: 'water' }),
    // 烟气：炉膛 → SCR → 空预器 → 电除尘 → 引风机 → 脱硫塔 → 烟囱
    new Flow([
      v(-35, 30, 6), v(-35, 26, 16), v(-35, 15, 20), v(-35, 8, 22), v(-35, 6, 29),
      v(-24, 8, 29), v(-8, 10, 28), v(2, 8, 28), v(7, 4, 28), v(14, 6, 28),
      v(22, 9, 28), v(22, 18, 28), v(32, 14, 28), v(42, 10, 28), v(44, 60, 28),
    ], { color: 0xb0b0b0, size: 1.1, count: 220, speed: 0.05, category: 'flue' }),
    // 循环冷却水：冷却塔 ↔ 凝汽器（闭环）
    new Flow([v(58, 2, -26), v(40, 1.5, -14), v(26, 2, -4), v(24, 2, 0), v(26, 2, 4), v(42, 1.5, -10), v(58, 3, -28)],
      { color: 0x4fe0d8, size: 0.9, count: 140, speed: 0.06, category: 'cool', closed: true }),
  ];
  flows.forEach((f) => scene.add(f.points));

  // 炉膛火焰
  const flames = [new Flame(v(-35, 8, 0), { radius: 4.5, height: 14, count: 350 })];
  flames.forEach((f) => f.addTo(scene));

  // 羽流：烟囱 + 冷却塔
  const plumes = [
    new Plume(v(44, 72, 28), { count: 90, height: 30, spread: 8, color: 0xe8e8e8, drift: [3, 0, 1], opacity: 0.4 }),
    new Plume(v(58, 32, -32), { count: 80, height: 20, spread: 7, color: 0xffffff, drift: [2, 0, -1], opacity: 0.35 }),
  ];
  plumes.forEach((p) => scene.add(p.points));

  return { flows, flames, plumes };
}
