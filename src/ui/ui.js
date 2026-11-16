/**
 * UI 装配：设备列表、信息面板、仿真控制、剖切控制、流系显隐。
 */
export function createUI({ registry, sim, clip, flows, flames, plumes, onFocus, onReset }) {
  const listEl = document.getElementById('equip-list');
  const nameEl = document.getElementById('info-name');
  const descEl = document.getElementById('info-desc');
  const rowBtns = {};

  // ---------- 设备列表 ----------
  registry.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'equip-row';

    const btn = document.createElement('button');
    btn.className = 'eq-name';
    btn.textContent = item.name;
    btn.addEventListener('click', () => select(item.id));
    row.appendChild(btn);
    rowBtns[item.id] = btn;

    if (item.shell.length) {
      const lab = document.createElement('label');
      lab.className = 'shell-toggle';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.addEventListener('change', () => {
        item.shell.forEach((m) => { m.visible = cb.checked; });
      });
      lab.append(cb, document.createTextNode(' 外壳'));
      row.appendChild(lab);
    }
    listEl.appendChild(row);
  });

  function select(id) {
    const item = registry.find((r) => r.id === id);
    if (!item) return;
    nameEl.textContent = item.name;
    descEl.textContent = item.desc;
    Object.values(rowBtns).forEach((b) => b.classList.remove('active'));
    rowBtns[id]?.classList.add('active');
    onFocus(item);
  }

  // ---------- 仿真控制 ----------
  const btnRun = document.getElementById('btn-run');
  btnRun.addEventListener('click', () => {
    sim.running = !sim.running;
    btnRun.textContent = sim.running ? '⏸ 暂停' : '▶ 运行';
  });

  document.getElementById('speed').addEventListener('input', (e) => {
    sim.speed = parseFloat(e.target.value);
  });

  const loadVal = document.getElementById('load-val');
  document.getElementById('load').addEventListener('input', (e) => {
    sim.load = parseInt(e.target.value, 10) / 100;
    loadVal.textContent = `${e.target.value}%`;
  });

  // ---------- 剖切控制 ----------
  ['x', 'y', 'z'].forEach((axis) => {
    const cb = document.getElementById(`clip-${axis}`);
    const slider = document.getElementById(`clip-${axis}-val`);
    const apply = () => clip.set(axis, cb.checked, parseFloat(slider.value));
    cb.addEventListener('change', apply);
    slider.addEventListener('input', apply);
  });

  // ---------- 流系显隐 ----------
  const bindFlowToggle = (id, categories) => {
    document.getElementById(id).addEventListener('change', (e) => {
      flows
        .filter((f) => categories.includes(f.category))
        .forEach((f) => { f.points.visible = e.target.checked; });
    });
  };
  bindFlowToggle('tg-coal', ['coal']);
  bindFlowToggle('tg-gas', ['air', 'flue']);
  bindFlowToggle('tg-steam', ['steam', 'water']);
  bindFlowToggle('tg-cool', ['cool']);
  document.getElementById('tg-fx').addEventListener('change', (e) => {
    flames.forEach((f) => {
      f.points.visible = e.target.checked;
      f.light.visible = e.target.checked;
    });
    plumes.forEach((p) => { p.points.visible = e.target.checked; });
  });

  // ---------- 复位视角 ----------
  document.getElementById('btn-reset').addEventListener('click', onReset);

  return { select };
}
