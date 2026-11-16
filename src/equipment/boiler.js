import * as THREE from 'three';
import { MAT, box, cyl, pipe, v } from './materials.js';

const BX = -35; // 锅炉中心 X

/** 锅炉岛：锅炉本体 / 水冷壁 / 过热器 / 燃烧系统 / 煤仓 */
export function buildBoiler() {
  const items = [];

  // ============ 锅炉本体（外壳 + 钢架 + 汽包） ============
  const boiler = new THREE.Group();
  const shell = box(18, 30, 16, MAT.boilerShell, BX, 19, 0); // 炉膛外壳 y: 4~34
  shell.userData.shell = true;
  boiler.add(shell);
  const topBox = box(10, 4.5, 10, MAT.boilerShell, BX, 36, 0); // 顶部汽包小室
  topBox.userData.shell = true;
  boiler.add(topBox);
  // 钢架立柱
  [[-44.5, -8.5], [-44.5, 8.5], [-25.5, -8.5], [-25.5, 8.5]].forEach(([x, z]) => {
    boiler.add(box(1, 38, 1, MAT.darkSteel, x, 19, z));
  });
  // 汽包（隐藏外壳后可见）
  const drum = cyl(1.6, 1.6, 12, MAT.hot, BX, 36, 0);
  drum.rotation.z = Math.PI / 2;
  boiler.add(drum);
  items.push({ id: 'boiler', group: boiler, focus: v(BX, 20, 0), dist: 60 });

  // ============ 水冷壁（炉膛内壁管屏） ============
  const ww = new THREE.Group();
  const tubeGeo = new THREE.CylinderGeometry(0.16, 0.16, 26, 8);
  const pts = [];
  for (let i = 0; i < 20; i++) {           // 前后墙（沿 X 排列）
    const x = -43.5 + (i * 17) / 19;
    pts.push([x, -7.3], [x, 7.3]);
  }
  for (let i = 0; i < 16; i++) {           // 两侧墙（沿 Z 排列）
    const z = -7.3 + (i * 14.6) / 15;
    pts.push([-43.7, z], [-26.3, z]);
  }
  const inst = new THREE.InstancedMesh(tubeGeo, MAT.tube, pts.length);
  const m4 = new THREE.Matrix4();
  pts.forEach(([x, z], i) => {
    m4.makeTranslation(x, 17, z);
    inst.setMatrixAt(i, m4);
  });
  inst.instanceMatrix.needsUpdate = true;
  ww.add(inst);
  items.push({ id: 'waterwall', group: ww, focus: v(BX, 17, 0), dist: 40 });

  // ============ 过热器（炉顶蛇形管 + 屏式） ============
  const sh = new THREE.Group();
  const shPts = [];
  for (let i = 0; i <= 8; i++) {
    shPts.push(v(-42 + i * 1.75, 31, i % 2 ? 6.2 : -6.2));
  }
  sh.add(pipe(shPts, 0.28, MAT.hot)); // 蛇形管
  for (let i = 0; i < 4; i++) {       // 屏式过热器
    sh.add(box(0.4, 6, 12, MAT.tube, -40 + i * 3.4, 28, 0));
  }
  items.push({ id: 'superheater', group: sh, focus: v(BX, 30, 0), dist: 35 });

  // ============ 燃烧系统（燃烧器 + 磨煤机 + 煤粉管） ============
  const burner = new THREE.Group();
  const corners = [[-41, -5], [-41, 5], [-29, -5], [-29, 5]];
  const flameCenter = v(BX, 13, 0);
  corners.forEach(([x, z]) => {
    burner.add(box(2.4, 2.4, 2.4, MAT.darkSteel, x, 10, z));
    // 喷口指向炉膛中心
    const dir = flameCenter.clone().sub(v(x, 10, z)).normalize();
    const noz = cyl(0.5, 0.75, 2, MAT.copper, x + dir.x * 1.6, 10 + dir.y * 1.6, z + dir.z * 1.6);
    noz.quaternion.setFromUnitVectors(v(0, 1, 0), dir);
    burner.add(noz);
  });
  // 磨煤机（中速磨）+ 煤粉管道
  [-6, 0, 6].forEach((z, i) => {
    burner.add(cyl(1.8, 1.8, 3, MAT.darkSteel, -50, 3.2, z));
    burner.add(box(1.2, 1.2, 1.2, MAT.steel, -50, 5.6, z));
    const t = corners[i % 4];
    burner.add(pipe([v(-50, 5.6, z), v(-46, 7, z * 0.7), v(t[0] - 1, 9, t[1])], 0.25, MAT.duct));
  });
  items.push({ id: 'burner', group: burner, focus: v(-44, 8, 0), dist: 35 });

  // ============ 煤仓（3 座原煤仓） ============
  const silo = new THREE.Group();
  [-6, 0, 6].forEach((z) => {
    const body = cyl(2.6, 2.6, 9, MAT.steel, -50, 25, z);      // 仓体
    body.userData.shell = true;
    const coneB = cyl(0.6, 2.6, 3, MAT.steel, -50, 19, z);     // 下锥斗
    coneB.userData.shell = true;
    const roof = cyl(0.2, 2.6, 1.6, MAT.darkSteel, -50, 30.3, z); // 仓顶
    roof.userData.shell = true;
    silo.add(body, coneB, roof);
    silo.add(cyl(2.2, 2.2, 6, MAT.coal, -50, 24, z));          // 仓内煤位
    // 支腿
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([dx, dz]) => {
      silo.add(box(0.5, 15, 0.5, MAT.darkSteel, -50 + dx, 7.5, z + dz));
    });
    silo.add(cyl(0.3, 0.3, 12, MAT.duct, -50, 11.5, z));       // 下煤管
  });
  items.push({ id: 'silo', group: silo, focus: v(-50, 18, 0), dist: 40 });

  return items;
}
