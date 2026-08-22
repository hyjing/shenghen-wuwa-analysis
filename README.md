# 声痕 · 鸣潮唤取分析

隐私优先的《鸣潮》唤取记录提取与分析工具。玩家可以在 Windows 本地生成 JSON，再通过网页查看保底进度、五星记录和抽数分布。

> 非库洛游戏官方产品。本项目不会要求输入游戏账号、密码、验证码或 Cookie。

## 在线使用

在线页面具体网址：

https://shenghen-wuwa-analysis.frankyknarf.chatgpt.site

当前站点为项目所有者私有访问；如需提供给其他玩家使用，需要调整站点访问权限或自行部署。

### 在 Windows 上打开

1. 使用 Edge、Chrome 或 Firefox 打开上面的在线页面链接。
2. 登录创建该站点时使用的同一个 ChatGPT/OpenAI 账号。
3. 如果出现“无权限”或登录提示，请确认浏览器登录的是站点所有者账号。
4. 进入页面后即可下载提取器，或拖入已经生成的 JSON。

请勿在 Windows 上访问 <code>http://localhost:3000</code>。这是开发电脑上的临时本地地址，其他电脑无法访问；Windows 应使用上面的正式 HTTPS 地址。

## 功能

- 导入声痕提取器生成的 JSON
- 兼容常见数组、<code>records</code> 和嵌套记录格式
- 按卡池展示当前垫抽、五星总数、平均出金和抽数分布
- 为常见共鸣者与五星武器展示图标，并用彩色进度条回顾每次出金抽数
- 重复导入自动合并
- 使用浏览器本地存储保存分析数据
- 提供 Windows PowerShell 本地提取器
- 自动识别官服、Steam、Epic 等常见安装位置
- 兼容普通日志及新版 XOR 混淆的 <code>Client.log</code>
- 从库洛官方接口读取 1–13 号卡池（含新旅程、联动及预留类型）并保留旧记录

## 生成抽卡 JSON

1. 打开在线页面，点击“下载声痕提取器”。
2. 解压 <code>shenghen-extractor.zip</code>。
3. 启动 Windows 版《鸣潮》。
4. 在游戏中打开一次“唤取记录/历史记录”，然后关闭记录页面。
5. 右键 <code>shenghen-extractor.ps1</code>，选择“使用 PowerShell 运行”。
6. 等待脚本生成 <code>shenghen-pulls-你的UID.json</code>。
7. 将 JSON 文件拖入声痕网页。

如果 Windows 阻止脚本运行，可打开 PowerShell，执行：

~~~powershell
Set-ExecutionPolicy -Scope Process Bypass
~~~

然后把脚本拖入 PowerShell 窗口并按 Enter。

## 隐私与安全

提取器会：

- 只读游戏目录中的 <code>Client.log</code> 或 WebView <code>debug.log</code>
- 仅请求库洛官方域名 <code>gmserver-api.aki-game2.com</code> 或 <code>gmserver-api.aki-game2.net</code>
- 将结果写入脚本所在目录
- 再次运行时合并已有 JSON，保留官方接口不再返回的旧记录

提取器不会：

- 读取账号密码、Cookie 或验证码
- 修改游戏文件
- 把唤取记录上传到声痕服务器
- 将临时唤取 URL 写入导出的 JSON
- 发送遥测或分析事件

PowerShell 源码位于 [public/shenghen-extractor.ps1](public/shenghen-extractor.ps1)，可在运行前自行检查。

## JSON 格式

~~~json
{
  "format": "shenghen-pulls",
  "version": 1,
  "exportedAt": "2026-08-21T18:00:00.000Z",
  "player": {
    "id": "123456789",
    "serverId": "服务器标识"
  },
  "records": [
    {
      "id": "记录唯一标识",
      "name": "共鸣者或武器名称",
      "rarity": 5,
      "time": "2026-08-20 21:30:00",
      "pool": "限定角色",
      "poolType": 1
    }
  ]
}
~~~

唤取临时 URL、<code>record_id</code> 等鉴权参数不会出现在文件中。

## 本地开发

要求 Node.js 22.13 或更高版本。

~~~bash
npm install
npm run dev
~~~

生产构建：

~~~bash
npm run build
~~~

## 目录

~~~text
app/
  page.tsx                 网页交互与统计逻辑
  globals.css              首页样式
  dashboard.css            分析面板样式
public/
  shenghen-extractor.ps1   Windows 本地提取器
  shenghen-extractor.zip   网页下载包
  README.txt               提取器使用说明
~~~

## 已知限制

- 当前提取器需要 Windows PowerShell 5.1 或更高版本。
- 浏览器无法直接读取游戏日志，因此网页与本地提取器需要配合使用。
- 官方唤取记录只保留有限时间，建议定期运行提取器备份。
- 官方接口一次返回当前仍可查询的记录，不提供向更早历史翻页的参数；重复运行时，提取器会把新结果与同名旧 JSON 合并，因此不要删除旧文件。
- 提取器分别使用链接中的 `record_id` 与 `resources_id` 请求官方接口；两者用途不同，不能互相替代。
- 官方记录不提供明确的“是否命中当期 UP”字段，因此网页不会凭名称猜测。
- 角色与武器图标通过公开的 [Wuthering Waves Assets](https://github.com/ryanbenson/wuthering-waves-assets) 资源路径加载；图片版权归其原权利方所有。
- 真实接口流程需要在安装了《鸣潮》的 Windows 电脑上验证。

## 参考项目

- [WuWa Local Tracker](https://github.com/dyar7474/WuWa_local_tracker)（MIT）
- [WuWa Tracker](https://github.com/wuwatracker/wuwatracker)（GPL-3.0，仅参考日志兼容信息）
- [Wuthering Waves Convene Export](https://github.com/cuo-ren/Wuthering-Waves-Convene-Export)

## 许可证

项目中的声痕提取器采用 MIT License。网页部分暂未单独声明许可证；在添加正式开源许可证前，请勿默认将整个仓库视为可再分发。
