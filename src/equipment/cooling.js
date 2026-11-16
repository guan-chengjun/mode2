import * as THREE from 'three';
import { MAT, box, cyl, pipe, v } from './materials.js';

/** 循环冷却水系统：双曲线冷却塔 + 循环水泵房 + 循环水管 */
export function buildCooling() {
  const cool = new THREE.Group();

  // 双曲线自然通风冷却塔（车削曲面）
  const prof = [
    [14, 0], [12.6, 4], [11, 9], [9.8, 14],
    [9.3, 19], [9.4, 24], [10.2, 29], [11.2, 32],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const towerMat = MAT.concrete.clone();
  towerMat.side = THREE.DoubleSide;
  const tower = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), towerMat);
  tower.position.set(58, 0, -32);
  tower.castShadow = true;
  tower.userData.shell = true;
  cool.add(tower);

  // 内部：淋水填料 + 集水池（隐藏塔筒外壳可见）
  cool.add(cyl(9, 9, 2.5, MAT.tube, 58, 8, -32));
  cool.add(cyl(12.5, 12.5, 1.5, MAT.pipeCool, 58, 0.75, -32));

  // 循环水泵房
  cool.add(box(8, 4, 6, MAT.steel, 44, 2, -20));

  // 循环水管道（冷却塔 ↔ 凝汽器）
  cool.add(pipe([v(58, 2, -26), v(40, 1.5, -14), v(26, 2, -4)], 0.8, MAT.pipeCool)); // 供水
  cool.add(pipe([v(26, 2, 4), v(42, 1.5, -10), v(58, 3, -28)], 0.8, MAT.pipeCool));  // 回水

  return [{ id: 'cooling', group: cool, focus: v(58, 16, -32), dist: 60 }];
}
