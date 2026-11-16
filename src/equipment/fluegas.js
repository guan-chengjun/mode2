import * as THREE from 'three';
import { MAT, box, cyl, ductBetween, v } from './materials.js';

/** 烟气净化岛：烟道 / SCR脱硝 / 电除尘 / 湿法脱硫 / 烟囱 / 引送风机 */
export function buildFlueGas() {
  const items = [];

  // ============ 烟道（含空气预热器） ============
  const duct = new THREE.Group();
  duct.add(ductBetween(v(-35, 32, 8), v(-35, 26, 16), 5, 4));   // 炉顶出口 → SCR
  duct.add(ductBetween(v(-35, 8, 20), v(-35, 6, 26), 4.5, 3.5)); // SCR → 空预器
  duct.add(box(6, 9, 6, MAT.duct, -35, 4.5, 30));                // 空气预热器
  duct.add(ductBetween(v(-32, 6, 30), v(-16, 9, 28), 4.5, 3.5)); // 空预器 → 电除尘
  duct.add(ductBetween(v(0, 9, 28), v(5, 4, 28), 4, 3));         // 电除尘 → 引风机
  duct.add(ductBetween(v(9, 4, 28), v(18, 8, 28), 4, 3));        // 引风机 → 脱硫塔
  duct.add(ductBetween(v(22, 19, 28), v(40, 10, 28), 3.5, 3));   // 脱硫塔顶 → 烟囱
  items.push({ id: 'duct', group: duct, focus: v(-20, 10, 27), dist: 50 });

  // ============ SCR 脱硝反应器 ============
  const scr = new THREE.Group();
  const scrShell = box(9, 14, 7, MAT.steel, -35, 15, 20);
  scrShell.userData.shell = true;
  scr.add(scrShell);
  [11, 15, 19].forEach((y) => scr.add(box(8, 0.8, 6, MAT.green, -35, y, 20))); // 催化剂层
  scr.add(box(10, 1.5, 8, MAT.concrete, -35, 0.75, 20)); // 基础
  items.push({ id: 'scr', group: scr, focus: v(-35, 14, 20), dist: 30 });

  // ============ 电除尘器 ============
  const esp = new THREE.Group();
  const espShell = box(16, 14, 10, MAT.steel, -8, 10, 28);
  espShell.userData.shell = true;
  esp.add(espShell);
  for (let i = 0; i < 7; i++) { // 收尘极板
    esp.add(box(0.25, 11, 8, MAT.tube, -14 + i * 2, 10, 28));
  }
  [-12, -8, -4].forEach((x) => { // 灰斗
    esp.add(cyl(0.8, 2.2, 3, MAT.duct, x, 1.5, 28));
  });
  items.push({ id: 'esp', group: esp, focus: v(-8, 9, 28), dist: 35 });

  // ============ 湿法脱硫吸收塔 ============
  const fgd = new THREE.Group();
  const absShell = cyl(5, 5, 20, MAT.white, 22, 11, 28);
  absShell.userData.shell = true;
  const absTop = cyl(0.5, 5, 3, MAT.white, 22, 22.5, 28);
  absTop.userData.shell = true;
  fgd.add(absShell, absTop);
  [8, 11, 14].forEach((y) => fgd.add(cyl(4.4, 4.4, 0.3, MAT.pipeCool, 22, y, 28))); // 喷淋层
  fgd.add(cyl(4.4, 4.4, 0.8, MAT.tube, 22, 17, 28));   // 除雾器
  fgd.add(cyl(4.6, 4.6, 3, MAT.green, 22, 2.5, 28));   // 浆液池
  items.push({ id: 'fgd', group: fgd, focus: v(22, 12, 28), dist: 35 });

  // ============ 烟囱（红白相间 + 内筒） ============
  const chim = new THREE.Group();
  const SEGS = 6, H = 12;
  for (let i = 0; i < SEGS; i++) {
    const r1 = 4.2 - i * 0.28;
    const r2 = 4.2 - (i + 1) * 0.28;
    const c = cyl(r2, r1, H, i % 2 ? MAT.white : MAT.red, 44, i * H + H / 2, 28);
    c.userData.shell = true;
    chim.add(c);
  }
  chim.add(cyl(1.8, 2.2, 70, MAT.darkSteel, 44, 35, 28)); // 内筒
  items.push({ id: 'chimney', group: chim, focus: v(44, 36, 28), dist: 70 });

  // ============ 引送风机 ============
  const fans = new THREE.Group();
  // 引风机（电除尘后）
  const idf = cyl(2.6, 2.6, 2.2, MAT.darkSteel, 7, 3, 28);
  idf.rotation.x = Math.PI / 2;
  fans.add(idf);
  fans.add(box(2, 1.5, 1.5, MAT.steel, 7, 1.2, 24.5)); // 电机
  fans.add(box(4, 0.6, 4, MAT.concrete, 7, 0.3, 28));
  // 送风机（炉前）
  const fdf = cyl(2, 2, 1.8, MAT.darkSteel, -24, 2.5, -14);
  fdf.rotation.x = Math.PI / 2;
  fans.add(fdf);
  fans.add(box(1.6, 1.2, 1.2, MAT.steel, -24, 1, -17));
  fans.add(box(3.5, 0.6, 3.5, MAT.concrete, -24, 0.3, -14));
  fans.add(ductBetween(v(-24, 3, -13), v(-30, 8, -9), 2.5, 2)); // 送风道 → 炉膛
  items.push({ id: 'fans', group: fans, focus: v(-8, 3, 8), dist: 45 });

  return items;
}
