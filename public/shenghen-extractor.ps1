<#
声痕鸣潮唤取记录提取器 v0.2.0
只读本地日志，仅请求库洛官方 API，并在本地生成 JSON。
参考资料：
- WuWa Local Tracker (MIT): https://github.com/dyar7474/WuWa_local_tracker
- WuWa Tracker log extractor (GPL-3.0): https://github.com/wuwatracker/wuwatracker/blob/main/import.ps1
本文件为独立实现，采用 MIT License。Copyright (c) 2026 Shenghen contributors
#>
[CmdletBinding()]
param([string]$GamePath,[string]$OutputPath,[string]$ConveneUrl,[switch]$NoPause)

$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
Add-Type -AssemblyName System.Web
$PoolNames=@{1='限定角色';2='限定武器';3='常驻角色';4='常驻武器';5='新手池';6='新手自选';7='回馈池';8='新旅程角色';9='新旅程武器';10='联动角色';11='联动武器';12='特殊角色';13='特殊武器'}

function Read-SharedBytes([string]$Path) {
  $s=$null;$m=$null
  try {
    $share=[System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $s=[System.IO.File]::Open($Path,'Open','Read',$share)
    $m=New-Object System.IO.MemoryStream;$s.CopyTo($m)
    return ,$m.ToArray()
  } finally {if($m){$m.Dispose()};if($s){$s.Dispose()}}
}

function Find-ConveneUrl([byte[]]$Bytes) {
  $pattern='https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record[^"\s]*'
  $text=[System.Text.Encoding]::UTF8.GetString($Bytes)
  $hits=[regex]::Matches($text,$pattern)
  if($hits.Count){return $hits[$hits.Count-1].Value}
  # 新版 Client.log 可能经过 XOR 混淆；只在内存中解码副本。
  $decoded=New-Object byte[] $Bytes.Length
  for($i=0;$i -lt $Bytes.Length;$i++){
    $b=[int]$Bytes[$i];$mask=if(($b -band 1)-ne 0){0xA5}else{0xEF}
    $decoded[$i]=[byte]($b -bxor $mask)
  }
  $hits=[regex]::Matches([System.Text.Encoding]::UTF8.GetString($decoded),$pattern)
  if($hits.Count){return $hits[$hits.Count-1].Value}
  return $null
}

function Test-Root([string]$Root) {
  if(!$Root){return $false}
  return (Test-Path (Join-Path $Root 'Client\Saved\Logs\Client.log')) -or
    (Test-Path (Join-Path $Root 'Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log'))
}

function Get-Roots {
  $roots=New-Object System.Collections.Generic.List[string]
  if($GamePath){$roots.Add($GamePath)}
  try {
    $keys=@('Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*','Registry::HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*')
    Get-ItemProperty -Path $keys -ErrorAction SilentlyContinue |
      Where-Object{$_.DisplayName -like '*Wuthering*' -or $_.DisplayName -like '*鸣潮*'} |
      ForEach-Object{if($_.InstallPath){$roots.Add([string]$_.InstallPath)}}
  }catch{}
  try {
    $mui='Registry::HKEY_CURRENT_USER\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache'
    (Get-ItemProperty -Path $mui -ErrorAction SilentlyContinue).PSObject.Properties |
      Where-Object{$_.Name -like '*client-win64-shipping.exe*'} |
      ForEach-Object{$roots.Add(($_.Name -split '\\client\\')[0])}
  }catch{}
  foreach($drive in (Get-PSDrive -PSProvider FileSystem)){
    if($drive.Name.Length-ne 1){continue};$d=$drive.Name
    @(
      "$($d):\Wuthering Waves Game",
      "$($d):\Wuthering Waves\Wuthering Waves Game",
      "$($d):\Program Files\Wuthering Waves\Wuthering Waves Game",
      "$($d):\SteamLibrary\steamapps\common\Wuthering Waves",
      "$($d):\SteamLibrary\steamapps\common\Wuthering Waves\Wuthering Waves Game",
      "$($d):\Program Files (x86)\Steam\steamapps\common\Wuthering Waves",
      "$($d):\Program Files\Epic Games\WutheringWavesj3oFh",
      "$($d):\Program Files\Epic Games\WutheringWavesj3oFh\Wuthering Waves Game"
    )|ForEach-Object{$roots.Add($_)}
  }
  return @($roots|Where-Object{Test-Root $_}|Select-Object -Unique)
}

function Get-Param([string]$Url,[string]$Name) {
  $m=[regex]::Match($Url,"(?:[?&])$([regex]::Escape($Name))=([^&#]+)")
  if(!$m.Success){return ''}
  return [System.Web.HttpUtility]::UrlDecode($m.Groups[1].Value)
}

function Get-Hash([string]$Value) {
  $sha=[System.Security.Cryptography.SHA256]::Create()
  try{return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Value)))).Replace('-','').ToLowerInvariant()}
  finally{$sha.Dispose()}
}

try {
  Write-Host '========================================' -ForegroundColor Cyan
  Write-Host ' 声痕 · 鸣潮唤取记录提取器' -ForegroundColor Cyan
  Write-Host '========================================' -ForegroundColor Cyan
  Write-Host '只读取本地日志，并只连接库洛官方 API。' -ForegroundColor DarkGray

  if(!$ConveneUrl){
    Write-Host '\n[1/4] 查找鸣潮日志' -ForegroundColor Cyan
    $roots=@(Get-Roots)
    if(!$roots.Count){
      $manual=Read-Host '未自动找到游戏，请输入 Wuthering Waves Game 文件夹路径'
      if(!(Test-Root $manual)){throw '目录中没有日志。请先启动游戏并打开一次唤取记录。'}
      $roots=@($manual)
    }
    $logs=foreach($root in $roots){
      @((Join-Path $root 'Client\Saved\Logs\Client.log'),(Join-Path $root 'Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log')) |
        Where-Object{Test-Path $_}|ForEach-Object{Get-Item $_}
    }
    Write-Host '\n[2/4] 从最新日志提取临时链接' -ForegroundColor Cyan
    foreach($log in ($logs|Sort-Object LastWriteTime -Descending)){
      try{$found=Find-ConveneUrl (Read-SharedBytes $log.FullName);if($found){$ConveneUrl=$found;Write-Host "已读取：$($log.FullName)" -ForegroundColor Green;break}}catch{}
    }
    if(!$ConveneUrl){throw '日志中没有唤取链接。请在游戏中打开“唤取记录”，关闭后重试。'}
  }

  $p=@{serverId=Get-Param $ConveneUrl 'svr_id';playerId=Get-Param $ConveneUrl 'player_id';language=Get-Param $ConveneUrl 'lang';recordId=Get-Param $ConveneUrl 'record_id'}
  foreach($required in @('serverId','playerId','recordId')){if(!$p[$required]){throw "唤取链接缺少参数：$required"}}
  if(!$p.language){$p.language='zh-Hans'}
  $api=if($ConveneUrl -match 'aki-game\.com'){'https://gmserver-api.aki-game2.com'}else{'https://gmserver-api.aki-game2.net'}

  Write-Host '\n[3/4] 从库洛官方 API 获取记录' -ForegroundColor Cyan
  $records=New-Object System.Collections.Generic.List[object]
  # 新卡池会使用新的类型编号；查询到 13 以兼容当前联动池及后续预留池。
  foreach($poolType in 1..13){
    $body=@{cardPoolId=$p.recordId;cardPoolType=$poolType;languageCode=$p.language;playerId=$p.playerId;recordId=$p.recordId;serverId=$p.serverId}|ConvertTo-Json -Compress
    try{
      $response=Invoke-RestMethod -Uri "$api/gacha/record/query" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 30
      $items=@($response.data)
      for($i=0;$i-lt$items.Count;$i++){
        $item=$items[$i];$name=[string]$item.name;if(!$name){$name=[string]$item.resourceName}
        $rarity=[int]$item.qualityLevel;$time=[string]$item.time
        $id=[string]$item.id;if(!$id){$id=[string]$item.recordId};if(!$id){$id=Get-Hash "$($p.playerId)|$poolType|$time|$name|$rarity|$i"}
        $poolName=[string]$item.cardPoolType
        if(!$poolName -or $poolName -match '^\d+$'){$poolName=$PoolNames[$poolType]}
        $records.Add([PSCustomObject]@{id=$id;name=$name;rarity=$rarity;time=$time;pool=$poolName;poolType=$poolType})
      }
      Write-Host ("  {0}: {1} 条" -f $PoolNames[$poolType],$items.Count) -ForegroundColor Green
    }catch{Write-Warning ("{0}读取失败：{1}" -f $PoolNames[$poolType],$_.Exception.Message)}
  }
  if(!$records.Count){throw '官方接口没有返回记录。临时链接可能已过期，请重新打开游戏内唤取记录。'}

  Write-Host '\n[4/4] 合并旧记录并生成 JSON' -ForegroundColor Cyan
  if(!$OutputPath){$base=if($PSScriptRoot){$PSScriptRoot}else{(Get-Location).Path};$OutputPath=Join-Path $base "shenghen-pulls-$($p.playerId).json"}
  $byId=@{}
  if(Test-Path $OutputPath){
    try{$old=[IO.File]::ReadAllText($OutputPath,[Text.Encoding]::UTF8)|ConvertFrom-Json;foreach($r in @($old.records)){if($r.id){$byId[[string]$r.id]=$r}}}catch{Write-Warning '旧文件无法读取，将创建新文件。'}
  }
  foreach($r in $records){$byId[[string]$r.id]=$r}
  $merged=@($byId.Values|Sort-Object{[string]$_.time}-Descending)
  $out=[ordered]@{format='shenghen-pulls';version=1;exportedAt=[DateTime]::UtcNow.ToString('o');player=[ordered]@{id=$p.playerId;serverId=$p.serverId};records=$merged}
  [IO.File]::WriteAllText($OutputPath,($out|ConvertTo-Json -Depth 8),(New-Object Text.UTF8Encoding($false)))
  Write-Host "\n完成：$($merged.Count) 条记录" -ForegroundColor Green
  Write-Host "JSON 文件：$OutputPath" -ForegroundColor Green
  Write-Host '把这个 JSON 拖进声痕网页即可分析。' -ForegroundColor Cyan
  try{Start-Process 'https://shenghen-wuwa-analysis.frankyknarf.chatgpt.site'}catch{}
}catch{
  Write-Host "\n提取失败：$($_.Exception.Message)" -ForegroundColor Red
  exit 1
}finally{
  if(!$NoPause){Write-Host '';Read-Host '按 Enter 关闭'|Out-Null}
}
