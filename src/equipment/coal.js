import * as THREE from 'three';
import { MAT, box, cyl, ductBetween, v } from './materials.js';

/** 输煤系统：煤场 + 输煤栈桥 + 转运站 */
export function buildCoal() {
  const conv = new THREE.Group();

  // 煤场煤堆
  conv.add(cyl(0.5, 8, 4.5, MAT.coal, -80, 2.2, 26, 24));
  conv.add(cyl(0.5, 6, 3.5, MAT.coal, -70, 1.7, 33, 24));
  conv.add(cyl(0.5, 5, 3, MAT.coal, -88, 1.5, 33, 24));
  // 挡煤墙
  conv.add(box(30, 1.2, 0.6, MAT.concrete, -79, 0.6, 18));
  conv.add(box(0.6, 1.2, 20, MAT.concrete, -64, 0.6, 28));

  // 输煤栈桥（封闭廊道）：煤场 → 锅炉房煤仓顶部
  const a = v(-80, 5, 24);
  const b = v(-52, 28, 3);
  conv.add(ductBetween(a, b, 3, 2.6, MAT.green));
  // 栈桥支腿
  for (let i = 1; i <= 4; i++) {
    const p = a.clone().lerp(b, i / 5);
    conv.add(box(0.6, p.y, 0.6, MAT.darkSteel, p.x, p.y / 2, p.z));
  }
  // 转运站（煤仓顶部）
  const transfer = box(7, 5, 7, MAT.steel, -51, 29.5, 2);
  conv.add(transfer);

  return [{ id: 'conveyor', group: conv, focus: v(-66, 16, 14), dist: 55 }];
}
