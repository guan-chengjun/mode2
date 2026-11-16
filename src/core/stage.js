import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** 场景 / 相机 / 渲染器 / 灯光 / 地面 */
export function createStage(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1420);
  scene.fog = new THREE.Fog(0x0e1420, 260, 750);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(95, 62, 115);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.localClippingEnabled = true; // 开启局部剖切
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-5, 12, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495; // 不允许钻到地面以下
  controls.minDistance = 5;
  controls.maxDistance = 400;

  // 灯光
  const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x3a3226, 0.75);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(90, 140, 70);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -130;
  sun.shadow.camera.right = 130;
  sun.shadow.camera.top = 130;
  sun.shadow.camera.bottom = -130;
  sun.shadow.camera.far = 400;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // 地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x272d36, roughness: 0.95, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(600, 60, 0x3a4554, 0x2e3642);
  grid.position.y = 0.02;
  scene.add(grid);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
