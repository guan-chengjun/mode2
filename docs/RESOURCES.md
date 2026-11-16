# 资源文件清单

本项目**不依赖任何外部二进制资源文件**（无贴图、无模型下载），全部 3D 模型由代码参数化生成，粒子贴图由 Canvas 程序化绘制，可完全离线运行。

## 源码文件

| 文件 | 说明 |
|---|---|
| `index.html` | 入口页面，UI 骨架（左侧设备列表 / 右侧信息面板 / 底部控制条） |
| `styles.css` | 界面样式，深色主题 |
| `package.json` | 项目依赖与 npm 脚本 |
| `src/main.js` | 主入口：模块装配、点击拾取、相机聚焦动画、渲染主循环 |
| `src/core/stage.js` | 场景、相机、渲染器、灯光、地面、窗口自适应 |
| `src/core/clipping.js` | X/Y/Z 三向全局剖切平面管理 |
| `src/data/info.js` | 16 类设备的名称与工艺说明文本 |
| `src/equipment/materials.js` | 共享材质库、几何辅助函数、程序化粒子贴图 |
| `src/equipment/coal.js` | 煤场、输煤栈桥、转运站 |
| `src/equipment/boiler.js` | 锅炉本体、水冷壁、过热器、燃烧系统、煤仓 |
| `src/equipment/turbine.js` | 汽机房、汽轮机、发电机、凝汽器、汽水管道 |
| `src/equipment/fluegas.js` | 烟道、SCR 脱硝、电除尘、湿法脱硫、烟囱、引送风机 |
| `src/equipment/cooling.js` | 双曲线冷却塔、循环水泵房、循环水管道 |
| `src/equipment/index.js` | 设备组装、注册表、拾取标记与外壳收集 |
| `src/systems/flows.js` | 流体粒子（Flow）、炉膛火焰（Flame）、羽流（Plume） |
| `src/systems/simulation.js` | 仿真状态机：运行/暂停、速度、负荷联动 |
| `src/ui/ui.js` | 设备列表、信息面板、仿真/剖切/显隐控件装配 |

## 程序化生成的资源

| 资源 | 生成位置 | 说明 |
|---|---|---|
| 粒子圆点贴图 | `materials.js` `spriteTexture()` | 64×64 Canvas 径向渐变，用于所有粒子 |
| 全部设备几何体 | `src/equipment/*.js` | Box/Cylinder/Lathe/Tube/InstancedMesh 参数化建模 |
| 火焰/烟气/水流粒子 | `src/systems/flows.js` | THREE.Points 粒子系统 |

## 外部依赖（npm）

| 包 | 版本 | 说明 |
|---|---|---|
| three | ^0.169.0 | 3D 引擎（含 addons: OrbitControls） |
| vite | ^5.4.8 | 开发服务器与构建工具（devDependencies） |

## 可选：替换为真实 glTF 模型

如需使用网络下载的火电站模型素材（如 Sketchfab CC 许可模型），放入 `public/assets/models/` 后用 `GLTFLoader` 加载替换对应设备 Group 即可，详见 README「扩展指南」。请自行确认模型授权条款。
