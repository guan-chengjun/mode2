/**
 * 仿真状态机：运行/暂停、速度、负荷。
 * 统一驱动流体粒子、火焰、羽流与旋转机械。
 */
export class Simulation {
  constructor() {
    this.running = true;  // 运行/暂停
    this.speed = 1;       // 时间倍率 0.2 ~ 3
    this.load = 0.8;      // 机组负荷 0 ~ 1（影响流量、火焰强度、转速）
    this.time = 0;
    this.flows = [];      // Flow[]
    this.flames = [];     // Flame[]
    this.plumes = [];     // Plume[]
    this.rotors = [];     // { obj, rate } 旋转机械
  }

  update(dt) {
    if (this.running) this.time += dt * this.speed;
    const t = this.time;
    const L = Math.max(this.load, 0.02);
    for (const f of this.flows) f.update(t, L);
    for (const f of this.flames) f.update(t, L);
    for (const p of this.plumes) p.update(t, L);
    if (this.running) {
      for (const r of this.rotors) {
        r.obj.rotation.x += dt * this.speed * r.rate * (0.2 + 0.8 * L);
      }
    }
  }
}
