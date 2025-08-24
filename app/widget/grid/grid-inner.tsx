"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRESETS, KPIConf } from "./presets";

type ApiResp = { count: number; maxAgeDays: number; status: "green"|"amber"|"red", records?: any[] };

function Card({conf, data, err, onClick}:{conf:KPIConf; data?:ApiResp; err?:string; onClick?:()=>void}) {
  const color = err ? "red" : data?.status || "amber";
  const bg =
    color==="green" ? "#9EB384" :
    color==="red"   ? "#E57373" :
                      "#E6C972";

  const sub = err ? err : !data ? "Lade..." :
    !conf.showDateInfo ? "" :
    data.status==="green" ? "Alles erledigt" :
    data.status==="red" ? `Älteste offen: ${data.maxAgeDays} Tage` :
    `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div style={{
      fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      borderRadius:12,
      padding:18,
      minWidth:220,
      flex:1,
      background:bg,
      border:"1px solid rgba(0,0,0,0.08)",
      boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
      color:"#FFFFFF",
      margin:8,
      cursor: conf.modal ? "pointer" : "default",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      textAlign:"center"
    }}>
      <div style={{fontSize:13,opacity:.9,marginBottom:6,fontWeight:500}}>{conf.label}</div>
      <div style={{fontSize:36,fontWeight:700,lineHeight:"40px",marginBottom:6}}>
        {err ? "!" : data ? data.count : "…"}
      </div>
      <div style={{fontSize:12,opacity:.9}}>{sub}</div>
    </div>
  );
  if(conf.modal && onClick){
    return <div onClick={onClick} style={{flex:1}}>{card}</div>;
  }
  return conf.target 
    ? <a href={conf.target} target={conf.targetBlank===false?"_self":"_blank"} rel="noreferrer" style={{textDecoration:"none",flex:1}}>{card}</a> 
    : card;
}

export default function GridInner(){
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const preset = sp.get("preset") || "vertrieb";

  const [items,setItems]=useState<{conf:KPIConf;data?:ApiResp;err?:string}[]>([]);
  const [modalItems, setModalItems] = useState<any[] | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [detailUrl, setDetailUrl] = useState<string>("");

  const makeApiUrl = (conf: KPIConf, extraParams: Record<string,string> = {}) => {
    if(!conf.table) throw new Error("❌ Preset ohne table: " + JSON.stringify(conf));
    const base = (typeof window !== "undefined" && window.location && window.location.origin)
      ? window.location.origin
      : "https://sweet-greet-dashboard.vercel.app";

    const u = new URL("/api/kpi", base);
    if(conf.view) u.searchParams.set("view", conf.view);
    if(conf.formula) u.searchParams.set("formula", conf.formula);
    if(conf.dateField) u.searchParams.set("dateField", conf.dateField);
    if(conf.redDays) u.searchParams.set("redDays", conf.redDays);
    Object.entries(extraParams).forEach(([k,v]) => u.searchParams.set(k, v));
    u.searchParams.set("table", conf.table);
    return u.toString();
  };

  useEffect(()=>{
    let confs: KPIConf[] | null = null;
    if (b64) {
      try { confs = JSON.parse(atob(b64)) as KPIConf[]; } catch(e){ /* ignore */ }
    }
    if (!confs) {
      confs = PRESETS[preset] || [];
    }
    if (!confs.length) {
      setItems([{conf:{label:"Config fehlt",table:"x"},err:"config oder preset ungültig"}]);
      return;
    }
    setItems(confs.map(c=>({conf:c})));
    confs.forEach((c,i)=>{
      let url = "";
      try {
        url = makeApiUrl(c);
      } catch(err) {
        setItems(prev => { const copy=[...prev]; copy[i]={conf:c,err:String(err)}; return copy; });
        return;
      }
      fetch(url).then(r=>r.json()).then(data=>{
        setItems(prev => { const copy=[...prev]; copy[i]={conf:c,data}; return copy; });
      }).catch(e=>{
        setItems(prev => { const copy=[...prev]; copy[i]={conf:c,err:String(e)}; return copy; });
      });
    });
  },[b64,preset]);

  useEffect(() => {
    let timer:any;
    const resize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const h = document.documentElement.offsetHeight;
        window.parent.postMessage({ type: "resize-iframe", height: h }, "*");
      }, 100);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
        gap:"16px",
        alignItems:"stretch",
        justifyItems:"center",
        padding:"24px",
        margin:"0 auto",
        maxWidth:"1200px",
        boxSizing:"border-box"
      }}>
        {items.map((it,idx)=>
          <Card key={idx} {...it} onClick={() => it.conf.modal && setModalItems([])} />
        )}
      </div>
    </>
  );
}
