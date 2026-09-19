const { allowMethods, json } = require('../server/auth.cjs');

function finite(v,min,max){
  const n=Number(v);
  return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}

module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['GET']))return;
  const latitude=finite(req.query?.latitude,-90,90);
  const longitude=finite(req.query?.longitude,-180,180);
  if(latitude==null||longitude==null)return json(res,400,{ok:false,message:'位置情報が不正です。'});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8500);
  try{
    const url=new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',String(latitude));
    url.searchParams.set('longitude',String(longitude));
    url.searchParams.set('current','weather_code');
    url.searchParams.set('timezone','auto');
    const r=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});
    const d=await r.json().catch(()=>({}));
    const code=d?.current?.weather_code;
    if(!r.ok||typeof code!=='number')return json(res,502,{ok:false,message:'天気サービスからデータを取得できませんでした。'});
    return json(res,200,{ok:true,weatherCode:code,time:d.current.time||null,timezone:d.timezone||null});
  }catch(error){
    return json(res,504,{ok:false,message:error?.name==='AbortError'?'天気サービスがタイムアウトしました。':'天気サービスに接続できませんでした。'});
  }finally{clearTimeout(timer);}
};
