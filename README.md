# 声痕｜鸣潮抽卡分析、唤取记录导出工具

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Privacy: Local First](https://img.shields.io/badge/Privacy-Local%20First-172731)
![Wuthering Waves](https://img.shields.io/badge/Wuthering%20Waves-Convene%20Tracker-d7aa55)

**声痕**是一个免费、开源、隐私优先的《鸣潮》抽卡分析与唤取记录导出工具。它支持 Windows 国服、Steam、Epic 等常见安装方式，可查看当前垫抽、五星收藏、小保底不歪率、UP 角色/武器平均抽数和出金分布。

Windows 提取器从本地游戏日志取得临时记录链接，只请求库洛官方接口并生成 JSON；分析网页完全在浏览器本地运行，不上传抽卡记录。

> 非库洛游戏官方产品。本项目不会要求游戏账号、密码、验证码、Cookie 或库街区 Token。项目不提供统一的公共分析站点，请在自己的电脑上运行，或自行部署经过审阅的代码。

## 在本机打开

要求安装 [Node.js 22.13 或更高版本](https://nodejs.org/) 和 npm。

### 方法一：下载源码 ZIP（适合普通用户）

1. 打开本仓库的 [GitHub 页面](https://github.com/hyjing/shenghen-wuwa-analysis)。
2. 点击 **Code → Download ZIP**，下载后完整解压。
3. 在解压后的项目目录空白处按住 Shift 并点击鼠标右键，选择“在终端中打开”。
4. 依次执行：

```powershell
npm install
npm run dev
```

5. 终端显示启动成功后，用浏览器打开：

### [http://localhost:3000](http://localhost:3000)

使用期间不要关闭运行 `npm run dev` 的终端。需要停止时回到终端按 `Ctrl+C`。

### 方法二：使用 Git

```bash
git clone https://github.com/hyjing/shenghen-wuwa-analysis.git
cd shenghen-wuwa-analysis
npm install
npm run dev
```

然后打开 [http://localhost:3000](http://localhost:3000)。`localhost` 只指向当前电脑，不会把网页公开到互联网。

![声痕鸣潮抽卡分析](public/og.png)

## 完整使用流程（Windows）

1. 按“在本机打开”一节启动项目，并访问 [http://localhost:3000](http://localhost:3000)。
2. 点击页面里的“下载声痕提取器”，得到 `shenghen-extractor.zip`；也可以直接使用源码中的 [`public/shenghen-extractor.zip`](public/shenghen-extractor.zip)。
3. 解压 ZIP，不要直接在压缩包预览窗口运行脚本。
4. 启动《鸣潮》，进入“唤取”，打开一次“唤取记录”并等待记录出现。
5. 回到解压目录，右键 `shenghen-extractor.ps1`，选择“使用 PowerShell 运行”。
6. 完成后，同一目录会出现 `shenghen-pulls-你的UID.json`。
7. 回到本机网页 `http://localhost:3000`，把 JSON 拖进导入框。
8. 查看垫抽、五星收藏、小保底不歪率、UP 角色/武器平均抽数和出金分布。
9. 以后抽卡后继续运行同一目录里的脚本，它会合并同名旧 JSON。

如果 Windows 阻止脚本，在 PowerShell 中执行：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

再把脚本拖入该窗口并按 Enter。该设置只对当前窗口有效。

## 统计口径

- **平均出金**：各卡池每次五星间隔抽数的平均值。
- **小保底不歪率**：限定角色池中，排除“上一次已歪、下一金必定 UP”的大保底后，直接获得 UP 五星的次数 ÷ 可判断的小保底次数。
- **每个 UP 角色所需**：限定角色池总抽数 ÷ UP 五星角色数。
- **每把 UP 武器所需**：限定武器池总抽数 ÷ UP 五星武器数。
- **五星收藏**：同名五星合并显示，角标为获得次数；限定与常驻按五星物品本身分类。

缺失旧记录会影响保底链和平均值，结果仅供个人参考。

## 功能

- 导入声痕 JSON、记录数组及常见 `records` / `data.list` 格式
- 分卡池展示当前垫抽、每次五星抽数和分布
- 共鸣者与武器图标、限定/常驻去重收藏
- 小保底不歪率、UP 角色与武器平均成本
- 重复导入自动合并，浏览器本地保存
- Windows PowerShell 本地提取器
- 自动识别官服、Steam、Epic 等常见安装位置
- 兼容普通日志及新版 XOR 混淆的 `Client.log`
- 查询 1–13 号卡池类型并合并旧文件

## 为什么选择声痕

- **本地优先**：玩家记录不经过声痕服务器。
- **源码可审计**：PowerShell 提取脚本和网页代码全部公开。
- **不要求登录**：无需提供游戏密码、短信验证码、Cookie 或库街区 Token。
- **统计口径透明**：每项核心指标的计算方式都写在本文档中。
- **可持续备份**：重复运行会合并已有 JSON，方便长期保存自己的唤取历史。

## 隐私与安全

提取器只读取游戏目录的 `Client.log` 或 WebView `debug.log`，只请求 `gmserver-api.aki-game2.com` 或 `gmserver-api.aki-game2.net`，并在脚本目录生成 JSON。

它不会读取账号密码、Cookie、验证码或库街区 Token，不会修改游戏文件、上传记录、写出临时 URL/`record_id`/`resources_id`，也不发送遥测。网页仅使用浏览器 `localStorage`；可点击页面底部“清除本地数据”删除。

源码位于 [`public/shenghen-extractor.ps1`](public/shenghen-extractor.ps1)，建议运行前自行审阅。

## 历史记录限制

库洛记录页当前通过单次 `/gacha/record/query` 请求返回记录，没有供第三方继续向前翻页的参数。声痕会合并同目录已有 JSON，但无法凭当前临时链接恢复此前从未保存、且官方接口已不再返回的记录。

请固定使用同一解压目录、定期备份 JSON，不要删除旧文件。如果其他工具保存过完整记录，可先从其导出再导入声痕。

## JSON 格式

```json
{
  "format": "shenghen-pulls",
  "version": 1,
  "player": { "id": "示例UID", "serverId": "示例服务器" },
  "records": [
    {
      "id": "示例记录ID",
      "name": "示例共鸣者",
      "rarity": 5,
      "time": "2026-01-01 12:00:00",
      "pool": "限定角色",
      "poolType": 1,
      "kind": "角色"
    }
  ]
}
```

仓库不包含玩家 JSON、真实 UID、临时唤取链接或鉴权参数。提交 Issue 前也请删除这些信息。

## 本地开发与自行部署

要求 Node.js 22.13 或更高版本。

```bash
git clone https://github.com/hyjing/shenghen-wuwa-analysis.git
cd shenghen-wuwa-analysis
npm install
npm run dev
```

生产构建运行：

```bash
npm run build
```

项目所有分析功能均可在 `http://localhost:3000` 使用，不需要作者提供服务器。需要长期公开访问时，请先审阅源码，再使用你自己的静态或 Node.js 托管服务部署，并自行负责访问控制、依赖更新、流量费用和安全配置。不要在前端代码或公开仓库中加入 API Key、Cookie、Token、玩家 JSON 或临时唤取链接。

## 项目结构

```text
app/                         网页与统计逻辑、样式
public/item-assets.json      公开物品图标索引
public/shenghen-extractor.ps1 Windows 提取器源码
public/shenghen-extractor.zip 网页下载包
public/README.txt            提取器简明说明
```

## 公开仓库安全

- 不要提交 `.env`、Cookie、Token、抓包文件、游戏日志或玩家 JSON。
- `.gitignore` 已排除环境变量、构建产物和本地部署缓存。
- 图标来自公开的 [Wuthering Waves Assets](https://github.com/ryanbenson/wuthering-waves-assets)，版权归原权利方所有。

发现安全或隐私问题时，请阅读 [SECURITY.md](SECURITY.md)，不要在公开 Issue 中粘贴真实 UID、游戏日志或抽卡 JSON。

## 搜索关键词

鸣潮抽卡分析、鸣潮抽卡记录、鸣潮唤取记录、鸣潮抽卡导出、鸣潮保底统计、鸣潮抽卡工具、Wuthering Waves gacha tracker、Wuthering Waves convene history、Wuthering Waves gacha export。

## 参考项目

- [WuWa Local Tracker](https://github.com/dyar7474/WuWa_local_tracker)（MIT）
- [WuWa Tracker](https://github.com/wuwatracker/wuwatracker)（GPL-3.0，仅参考日志兼容信息，未复制其代码）
- [Wuthering Waves Convene Export](https://github.com/cuo-ren/Wuthering-Waves-Convene-Export)

## 许可证

本项目采用 [MIT License](LICENSE)。《鸣潮》名称、角色、武器、美术与相关素材归其权利方所有。
