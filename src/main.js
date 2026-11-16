import * as THREE from 'three';
import { createStage } from './core/stage.js';
import { ClipManager } from './core/clipping.js';
import { buildPlant } from './equipment/index.js';
import { createProcessFlows } from './systems/flows.js';
import { Simulation } from './systems/simulation.js';
import { createUI } from './ui/ui.js';

// ---------- 场景 ----------
const stage = createStage(document.getElementById('app'));
const { scene, camera, renderer, controls } = stage;

// ---------- 设备与工艺流程 ----------
const registry = buildPlant(scene);
const { flows, flames, plumes } = createProcessFlows(scene);

const sim = new Simulation();
sim.flows.push(...flows);
sim.flames.push(...flames);
sim.plumes.push(...plumes);
// 汽轮机 / 发电机转子
for (const id of ['turbine', 'generator']) {
  const item = registry.find((r) => r.id === id);
  if (item?.rotor) sim.rotors.push({ obj: item.rotor, rate: 6 });
}

const clip = new ClipManager(renderer);

// ---------- 相机聚焦动画 ----------
const HOME = { target: new THREE.Vector3(-5, 12, 0), pos: new THREE.Vector3(95, 62, 115) };
const focusTarget = HOME.target.clone();
const camTarget = HOME.pos.clone();
let animating = false;

function focusOn(item) {
  focusTarget.copy(item.focus);
  const dir = camera.position.clone().sub(controls.target).normalize();
  camTarget.copy(item.focus).addScaledVector(dir, item.dist || 50);
  animating = true;
}
function resetView() {
  focusTarget.copy(HOME.target);
  camTarget.copy(HOME.pos);
  animating = true;
}
// 用户手动操作时停止自动聚焦
renderer.domElement.addEventListener('pointerdown', () => { animating = false; });
renderer.domElement.addEventListener('wheel', () => { animating = false; });

// ---------- UI ----------
const ui = createUI({
  registry, sim, clip, flows, flames, plumes,
  onFocus: focusOn,
  onReset: resetView,
});

// ---------- 点击拾取 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;
renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return; // 拖拽不算点击
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    if (!hit.object.visible) continue;
    let o = hit.object;
    while (o) {
      if (o.userData.equipId) { ui.select(o.userData.equipId); return; }
      o = o.parent;
    }
  }
});

// ---------- 主循环 ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  sim.update(dt);

  if (animating) {
    controls.target.lerp(focusTarget, 0.08);
    camera.position.lerp(camTarget, 0.08);
    if (camera.position.distanceTo(camTarget) < 0.5) animating = false;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
