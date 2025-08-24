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
      borderRadius:12,padding:18,minWidth:220,flex:1,background:bg,
      border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
      color:"#FFFFFF",margin:8,cursor: conf.modal ? "pointer" : "default"
    }}>
      <div style={{fontSize:13,opacity:.9,marginBottom:6,fontWeight:500}}>{conf.label}</div>
      <div style={{fontSize:36,fontWeight:700,lineHeight:"40px",marginBottom:6}}>{err ? "!" : data ? data.count : "…"}</div>
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

  // Hilfsfunktion für sichere URL-Erstellung (mit Encoding)
  const makeApiUrl = (conf: KPIConf, extraParams: Record<string,string> = {}) => {
    const base = (typeof window !== "undefined" && window.location && window.location.origin)
      ? window.location.origin
      : "https://sweet-greet-dashboard.vercel.app"; // Fallback

    const u = new URL("/api/kpi", base);

    if(conf.view) u.searchParams.set("view", encodeURIComponent(conf.view));
    if(conf.formula) u.searchParams.set("formula", encodeURIComponent(conf.formula));
    if(conf.dateField) u.searchParams.set("dateField", encodeURIComponent(conf.dateField));
    if(conf.redDays) u.searchParams.set("redDays", conf.redDays);

    Object.entries(extraParams).forEach(([k,v]) => u.searchParams.set(k,v));

    u.searchParams.set("table", encodeURIComponent(conf.table));
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
      const url = makeApiUrl(c);
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

  const openModal = async (conf: KPIConf) => {
    setModalTitle(conf.label);
    setDetailUrl(conf.detailUrl || "");
    const url = makeApiUrl(conf, { list:"1" });
    const res = await fetch(url);
    const data = await res.json();
    setModalItems(data.records || []);
  };

  return (
    <>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
        gap:"16px"
      }}>
        {items.map((it,idx)=>
          <Card key={idx} {...it} onClick={() => it.conf.modal && openModal(it.conf)} />
        )}
      </div>
      {modalItems && (
        <div style={{
          position:"fixed",top:0,left:0,width:"100%",height:"100%",
          background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",
          zIndex:1000
        }}>
          <div style={{background:"#fff",padding:24,borderRadius:8,maxWidth:"600px",width:"90%",maxHeight:"80%",overflowY:"auto"}}>
            <h3>{modalTitle}</h3>
            <ul>
              {modalItems.map((r:any,i:number)=>(
                <li key={i} style={{marginBottom:8}}>
                  {detailUrl ? (
                    <a href={detailUrl.replace("{id}", r.id)} target="_blank" rel="noreferrer">
                      {r.fields?.["Follow-up Datum"] || r.id}
                    </a>
                  ) : JSON.stringify(r.fields)}
                </li>
              ))}
            </ul>
            <button onClick={()=>setModalItems(null)}>Schließen</button>
          </div>
        </div>
      )}
    </>
  );
}
