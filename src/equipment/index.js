import { buildCoal } from './coal.js';
import { buildBoiler } from './boiler.js';
import { buildTurbine } from './turbine.js';
import { buildFlueGas } from './fluegas.js';
import { buildCooling } from './cooling.js';
import { EQUIP_INFO } from '../data/info.js';

/**
 * 组装全厂设备，返回设备注册表：
 * [{ id, name, desc, group, shell[], focus, dist, rotor? }]
 * - group 内所有节点打上 userData.equipId（用于点击拾取）
 * - userData.shell=true 的网格收集到 shell[]（用于外壳显隐）
 */
export function buildPlant(scene) {
  const registry = [];
  const builders = [buildCoal, buildBoiler, buildTurbine, buildFlueGas, buildCooling];

  for (const build of builders) {
    for (const item of build()) {
      const info = EQUIP_INFO[item.id] || { name: item.id, desc: '' };
      item.name = info.name;
      item.desc = info.desc;
      item.shell = [];
      item.group.traverse((o) => {
        o.userData.equipId = item.id;
        if (o.userData.shell) item.shell.push(o);
      });
      scene.add(item.group);
      registry.push(item);
    }
  }
  return registry;
}
