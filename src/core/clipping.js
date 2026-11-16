import * as THREE from 'three';

/**
 * 全局剖切平面管理器。
 * 三个正交平面（X / Y / Z），未启用时把常数推到无穷远处（等于不剖切）。
 * 平面法线朝负轴方向：保留坐标 <= 滑块值 的部分，拖动滑块可"切开"厂房与设备。
 */
export class ClipManager {
  constructor(renderer) {
    renderer.localClippingEnabled = true;
    this.planes = {
      x: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e6),
      y: new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6),
      z: new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6),
    };
    renderer.clippingPlanes = Object.values(this.planes);
  }

  /** @param {'x'|'y'|'z'} axis @param {boolean} enabled @param {number} value */
  set(axis, enabled, value) {
    this.planes[axis].constant = enabled ? value : 1e6;
  }
}
