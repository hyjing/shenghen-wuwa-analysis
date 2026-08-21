'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';

type Pull = { id:string; name:string; rarity:number; time:string; pool:string; isUp?:boolean };

const sample: Pull[] = [
  {id:'1',name:'今汐',rarity:5,time:'2026-08-16 21:42:12',pool:'限定角色',isUp:true},
  ...Array.from({length:63},(_,i)=>({id:`a${i}`,name:i%8===0?'丹瑾':'锻造武器',rarity:i%8===0?4:3,time:`2026-08-${String(15-Math.floor(i/10)).padStart(2,'0')} 18:22:10`,pool:'限定角色'})),
  {id:'2',name:'维里奈',rarity:5,time:'2026-07-28 10:21:01',pool:'限定角色',isUp:false},
  ...Array.from({length:70},(_,i)=>({id:`b${i}`,name:i%9===0?'秧秧':'训练武器',rarity:i%9===0?4:3,time:'2026-07-20 12:00:00',pool:'限定角色'})),
  {id:'3',name:'长离',rarity:5,time:'2026-07-12 13:04:51',pool:'限定角色',isUp:true},
  ...Array.from({length:24},(_,i)=>({id:`c${i}`,name:'训练武器',rarity:3,time:'2026-07-01 12:00:00',pool:'限定角色'})),
];

function normalize(raw: unknown): Pull[] {
  const root = raw as Record<string, unknown>;
  const findRecords=(value:unknown,depth=0):unknown[]|undefined=>{
    if(depth>5||value===null||typeof value!=='object')return;
    if(Array.isArray(value)){
      if(value.some(item=>item&&typeof item==='object'&&('rarity' in item||'qualityLevel' in item||'quality_level' in item||'rank' in item)))return value;
      for(const item of value){const found=findRecords(item,depth+1);if(found)return found;}
      return;
    }
    for(const child of Object.values(value)){const found=findRecords(child,depth+1);if(found)return found;}
  };
  const candidates = Array.isArray(raw) ? raw : [root?.records,root?.list,root?.data,(root?.data as Record<string,unknown>)?.list,(root?.data as Record<string,unknown>)?.records].find(Array.isArray) ?? findRecords(raw);
  if (!Array.isArray(candidates)) throw new Error('找不到抽卡记录数组');
  return candidates.map((item,index)=>{
    const x=item as Record<string,unknown>;
    const rarity=Number(x.rarity ?? x.qualityLevel ?? x.quality_level ?? x.rank ?? x.star ?? 3);
    const rawUp=x.isUp ?? x.is_up;
    return {id:String(x.id ?? x.recordId ?? x.record_id ?? `${x.time ?? x.createTime}-${index}`),name:String(x.name ?? x.resourceName ?? x.resource_name ?? x.item_name ?? '未知物品'),rarity,time:String(x.time ?? x.createTime ?? x.create_time ?? ''),pool:String(x.pool ?? x.cardPoolType ?? x.card_pool_type ?? x.banner ?? '限定角色'),...(rawUp===undefined?{}:{isUp:Boolean(rawUp)})};
  }).filter(x=>x.rarity>=3);
}

export default function Home() {
  const inputRef=useRef<HTMLInputElement>(null);
  const [pulls,setPulls]=useState<Pull[]>([]);
  const [dragging,setDragging]=useState(false);
  const [notice,setNotice]=useState('');
  const [pool,setPool]=useState('限定角色');
  useEffect(()=>{try{const saved=localStorage.getItem('shenghen-pulls');if(saved)setPulls(JSON.parse(saved));}catch{}},[]);
  const importPulls=(incoming:Pull[])=>{const map=new Map(pulls.map(x=>[x.id,x]));incoming.forEach(x=>map.set(x.id,x));const next=[...map.values()].sort((a,b)=>b.time.localeCompare(a.time));setPulls(next);localStorage.setItem('shenghen-pulls',JSON.stringify(next));setNotice(`已导入 ${incoming.length} 条，当前共 ${next.length} 条记录`);};
  const readFile=async(file?:File)=>{if(!file)return;try{importPulls(normalize(JSON.parse(await file.text())));}catch(e){setNotice(e instanceof Error?e.message:'文件解析失败');}};
  const onFile=(e:ChangeEvent<HTMLInputElement>)=>readFile(e.target.files?.[0]);
  const onDrop=(e:DragEvent<HTMLButtonElement>)=>{e.preventDefault();setDragging(false);readFile(e.dataTransfer.files?.[0]);};
  const pools=useMemo(()=>Array.from(new Set(pulls.map(x=>x.pool))),[pulls]);
  const current=useMemo(()=>pulls.filter(x=>x.pool===pool),[pulls,pool]);
  const five=current.filter(x=>x.rarity===5);
  const firstGold=current.findIndex(x=>x.rarity===5);
  const currentPity=firstGold<0?current.length:firstGold;
  const intervals=five.map((gold,i)=>{const start=current.indexOf(gold);const end=i===five.length-1?current.length:current.indexOf(five[i+1]);return Math.max(1,end-start);});
  const avg=intervals.length?Math.round(intervals.reduce((a,b)=>a+b,0)/intervals.length):0;
  const up=five.filter(x=>x.isUp).length;

  if(pulls.length) return <main className="dash">
    <header className="topbar"><button className="brand buttonBrand" onClick={()=>setPulls([])}><span className="brandMark">◈</span><span>声痕</span><span className="brandSub">鸣潮唤取分析</span></button><nav><a className="active" href="#overview">总览</a><a href="#five">五星记录</a><a href="#distribution">分布</a></nav><div className="headerActions"><span className="localPill"><i/> 本地模式</span><button onClick={()=>inputRef.current?.click()}>＋ 更新记录</button></div><input ref={inputRef} hidden type="file" accept=".json" onChange={onFile}/></header>
    <section className="dashHero" id="overview"><div><span className="eyebrow"><span/> CONVENE OVERVIEW</span><h1>你的唤取档案</h1><p>{pulls.length} 条记录 · 数据保存在此设备</p></div><div className="luckSeal"><b>{avg&&avg<60?'欧':'稳'}</b><span>综合手气</span></div></section>
    <div className="poolTabs">{pools.map(x=><button className={x===pool?'selected':''} key={x} onClick={()=>setPool(x)}>{x}</button>)}</div>
    <section className="stats">
      <article><span>当前垫抽</span><strong>{currentPity}<small> / 80</small></strong><div className="meter"><i style={{width:`${Math.min(100,currentPity/80*100)}%`}}/></div><p>距离硬保底最多还有 {Math.max(0,80-currentPity)} 抽</p></article>
      <article><span>平均出金</span><strong>{avg||'—'}<small> 抽</small></strong><p>{avg?avg<60?'比 60 抽基准更早':'数据会随导入逐渐准确':'暂无五星间隔数据'}</p></article>
      <article><span>五星总数</span><strong>{five.length}<small> 个</small></strong><p>{five.some(x=>x.isUp!==undefined)?`UP 命中 ${up} 次 · ${Math.round(up/five.filter(x=>x.isUp!==undefined).length*100)}%`:'官方记录不含 UP 标记'}</p></article>
      <article><span>总唤取</span><strong>{current.length}<small> 抽</small></strong><p>四星 {current.filter(x=>x.rarity===4).length} · 三星 {current.filter(x=>x.rarity===3).length}</p></article>
    </section>
    <section className="records" id="five"><div className="sectionTitle"><div><span>05★ ARCHIVE</span><h2>五星唤取记录</h2></div><small>从新到旧</small></div><div className="goldList">{five.length?five.map((x,i)=><article key={x.id}><div className="portrait">{x.name.slice(0,1)}</div><div><b>{x.name}</b><span>{x.isUp?'限定 UP':'五星共鸣者'}</span></div><div className="pullCount"><strong>{intervals[i]}</strong><span>抽出金</span></div><time>{x.time||'时间未知'}</time></article>):<p className="empty">这个卡池还没有五星记录</p>}</div></section>
    <section className="distribution" id="distribution"><div className="sectionTitle"><div><span>PITY DISTRIBUTION</span><h2>出金抽数分布</h2></div></div><div className="bars">{['1–20','21–40','41–60','61–70','71–80'].map((label,i)=>{const counts=[intervals.filter(n=>n<=20).length,intervals.filter(n=>n>20&&n<=40).length,intervals.filter(n=>n>40&&n<=60).length,intervals.filter(n=>n>60&&n<=70).length,intervals.filter(n=>n>70).length];const max=Math.max(1,...counts);return <div key={label}><i style={{height:`${20+counts[i]/max*100}px`}}><b>{counts[i]}</b></i><span>{label}</span></div>})}</div></section>
    {notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
    <footer><span>SHENGHEN · LOCAL FIRST</span><button onClick={()=>{localStorage.removeItem('shenghen-pulls');setPulls([])}}>清除本地数据</button></footer>
  </main>;

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brandMark">◈</span><span>声痕</span><span className="brandSub">鸣潮唤取分析</span></a><nav><a className="active" href="#import">导入</a><a href="#privacy">隐私说明</a><a href="#help">使用帮助</a></nav><span className="localPill"><i/> 数据仅存本机</span></header>
    <section className="hero" id="import"><div className="eyebrow"><span/> CONVENE ARCHIVE</div><h1>把每一次潮鸣，<br/><em>变成清晰的答案。</em></h1><p className="intro">导入你的唤取记录，查看保底进度、五星分布和真实欧气。<br/>无需登录，所有分析都在你的浏览器中完成。</p>
      <div className="importCard"><div className="cardHead"><div><span className="step">01</span><h2>导入唤取记录</h2></div><button className="sample" onClick={()=>importPulls(sample)}>使用示例数据 →</button></div>
        <button className={`dropzone ${dragging?'dragging':''}`} onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}><span className="uploadIcon">↥</span><strong>拖入唤取记录 JSON</strong><span>或点击选择文件</span><small>支持数组及常见 records / data.list 格式 · 重复导入自动合并</small></button><input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={onFile}/>
        <div className="cardFoot"><span>还没有记录文件？</span><a href="/shenghen-extractor.zip" download>下载声痕提取器 <b>↓</b></a></div>{notice&&<p className="error">{notice}</p>}</div>
    </section>
    <section className="features" id="privacy"><article><span className="featureNo">01</span><div className="featureIcon">⌁</div><h3>精确计算保底</h3><p>分卡池追踪当前垫抽、大保底状态与每次五星所用抽数。</p></article><article><span className="featureNo">02</span><div className="featureIcon">▥</div><h3>看懂你的欧气</h3><p>平均出金、UP 命中率、抽数分布，一眼看清真实运气。</p></article><article><span className="featureNo">03</span><div className="featureIcon">⌾</div><h3>隐私留在本地</h3><p>不需要账号密码，记录不会上传，随时可以导出或清除。</p></article></section>
    <footer><span>SHENGHEN · LOCAL FIRST</span><span>非库洛游戏官方产品</span></footer>
  </main>;
}
