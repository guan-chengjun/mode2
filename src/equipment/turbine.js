import * as THREE from 'three';
import { MAT, box, cyl, pipe, v } from './materials.js';

/** 汽机岛：汽机房 / 汽轮机 / 发电机 / 凝汽器 + 汽水管道 */
export function buildTurbine() {
  const items = [];

  // ============ 汽轮机（含汽机房外壳） ============
  const tur = new THREE.Group();
  const hall = box(50, 15, 24, MAT.hall, 16, 7.5, 0); // 汽机房（半透明外壳）
  hall.userData.shell = true;
  hall.castShadow = false;
  const roof = box(50, 0.8, 24, MAT.darkSteel, 16, 15.4, 0);
  roof.userData.shell = true;
  tur.add(hall, roof);

  tur.add(box(34, 2, 10, MAT.concrete, 16, 1, 0)); // 基座

  // 高 / 中 / 低压缸（外壳，可隐藏查看转子）
  const hp = cyl(1.7, 1.7, 5, MAT.steel, 6, 8, 0);
  const ip = cyl(2.1, 2.1, 6, MAT.steel, 13, 8, 0);
  const lp = cyl(3.0, 3.0, 8, MAT.steel, 22, 8, 0);
  [hp, ip, lp].forEach((c) => {
    c.rotation.z = Math.PI / 2;
    c.userData.shell = true;
    tur.add(c);
  });

  // 转子（轴 + 叶轮，运转时旋转）
  const rotor = new THREE.Group();
  const shaft = cyl(0.45, 0.45, 28, MAT.copper, 16, 0, 0);
  shaft.rotation.z = Math.PI / 2;
  rotor.add(shaft);
  const stages = [[6, 1.3, 4], [13, 1.7, 5], [22, 2.5, 6]]; // [中心x, 半径, 级数]
  stages.forEach(([cx, r, n]) => {
    for (let i = 0; i < n; i++) {
      const d = cyl(r, r, 0.25, MAT.tube, cx - 1.5 + (i * 3) / n, 0, 0);
      d.rotation.z = Math.PI / 2;
      rotor.add(d);
    }
  });
  rotor.position.set(0, 8, 0);
  tur.add(rotor);

  // 主蒸汽管道（锅炉 → 高压缸）
  tur.add(pipe([v(-35, 38, 0), v(-35, 41, 0), v(-8, 41, 0), v(2, 14, 0), v(5, 9.5, 0)], 0.5, MAT.pipeSteam));
  // 再热冷段（汽机 → 锅炉）/ 热段（锅炉 → 中压缸）
  tur.add(pipe([v(13, 10, 2.5), v(-10, 16, 6), v(-28, 32, 6)], 0.35, MAT.hot));
  tur.add(pipe([v(-28, 33, 8), v(-5, 18, 9), v(13, 9.5, 3.5)], 0.35, MAT.pipeSteam));

  items.push({ id: 'turbine', group: tur, focus: v(14, 8, 0), dist: 50, rotor });

  // ============ 发电机 ============
  const gen = new THREE.Group();
  const gbody = cyl(2.3, 2.3, 8, MAT.gen, 33, 8, 0);
  gbody.rotation.z = Math.PI / 2;
  gbody.userData.shell = true;
  gen.add(gbody);
  // 转子（隐藏外壳可见）
  const grotor = new THREE.Group();
  const gshaft = cyl(0.4, 0.4, 10, MAT.copper, 0, 0, 0);
  gshaft.rotation.z = Math.PI / 2;
  const gcore = cyl(1.6, 1.6, 6, MAT.darkSteel, 0, 0, 0);
  gcore.rotation.z = Math.PI / 2;
  grotor.add(gshaft, gcore);
  grotor.position.set(33, 8, 0);
  gen.add(grotor);
  const exc = cyl(0.9, 0.9, 2, MAT.steel, 38.5, 8, 0); // 励磁机
  exc.rotation.z = Math.PI / 2;
  gen.add(exc);
  gen.add(box(11, 2, 8, MAT.concrete, 33, 1, 0));
  items.push({ id: 'generator', group: gen, focus: v(33, 8, 0), dist: 30, rotor: grotor });

  // ============ 凝汽器 + 凝结水/给水管道 ============
  const cond = new THREE.Group();
  const cbody = box(9, 4.5, 7, MAT.steel, 22, 3.5, 0);
  cbody.userData.shell = true;
  cond.add(cbody);
  cond.add(box(6, 2.5, 5, MAT.darkSteel, 22, 6.5, 0)); // 喉部（接低压缸排汽）
  for (let i = 0; i < 3; i++) {                        // 内部冷却管束
    cond.add(box(8, 0.3, 6, MAT.tube, 22, 2.6 + i * 0.9, 0));
  }
  cond.add(cyl(1.2, 1.2, 2, MAT.steel, 22, 0.8, 0));   // 热井
  cond.add(cyl(0.8, 0.8, 1.5, MAT.copper, 14, 0.75, -5)); // 凝结水泵
  // 给水管道（凝汽器 → 锅炉汽包）
  cond.add(pipe([v(18, 2, -3), v(0, 2, -8), v(-24, 4, -9), v(-33, 12, -4), v(-35, 34, -2)], 0.35, MAT.pipeWater));
  items.push({ id: 'condenser', group: cond, focus: v(20, 4, 0), dist: 30 });

  return items;
}
