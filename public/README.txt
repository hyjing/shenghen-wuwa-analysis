声痕 · 鸣潮唤取记录提取器

1. 启动 Windows 版《鸣潮》。
2. 打开一次“唤取记录/历史记录”，然后关闭记录页面。
3. 右键 shenghen-extractor.ps1，选择“使用 PowerShell 运行”。
4. 将生成的 shenghen-pulls-你的UID.json 拖进声痕网页。

如果 Windows 阻止运行：
打开 PowerShell，输入 Set-ExecutionPolicy -Scope Process Bypass；
再把 shenghen-extractor.ps1 拖入窗口，按 Enter。

脚本只读鸣潮日志；网络请求仅发送到库洛官方 API；
不读取密码、Cookie 或验证码，临时链接不会写入 JSON。
