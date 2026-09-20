const { allowMethods, json } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

const ICONS=['🌰','🌿','🍎','🌾','💧','☀️','🌙','🍃','🌸','🍂','🎋','🪶','🥬','🍓','🌽','🫐','🥕','🌻','🪵','✨'];
const THEMES=['木の実ひろい','森のお散歩','りんご祭り','シード収穫祭','水浴び大会','ひなたぼっこ','月夜の探検','風の日チャレンジ','花びら集め','落ち葉レース','竹林探検','羽づくろいの日','小松菜フェス','いちご探し','とうもろこし祭り','木の実宝探し','にんじん収穫','ひまわり祭り','止まり木大会','きらきら探索'];
const BOSS=[{name:'森の大カラス',icon:'🐦‍⬛',hp:12000},{name:'巨大モフモフ猫',icon:'🐈',hp:14500},{name:'暴風ワシ',icon:'🦅',hp:16000},{name:'どんぐりゴーレム',icon:'🗿',hp:18000},{name:'夜のフクロウ王',icon:'🦉',hp:20000}];
function catalog(){
  return Array.from({length:100},(_,i)=>{
    const n=i+1,boss=i%20===19,t=THEMES[i%THEMES.length],tier=Math.floor(i/20)+1;
    if(boss){const b=BOSS[Math.floor(i/20)];return{id:'event-'+String(n).padStart(3,'0'),type:'boss',title:'ボス襲来：'+b.name,icon:b.icon,summary:'みんなの文鳥で挑む特別ボス戦。今日だけの強敵を撃退しよう！',boss:{...b,level:tier},reward:{coins:900+tier*180,xp:180+tier*35}}}
    return{id:'event-'+String(n).padStart(3,'0'),type:'normal',title:t+' '+tier,icon:ICONS[i%ICONS.length],summary:['育成アクションでイベントポイントを集めよう。','ミニゲームに挑戦して今日の記録を伸ばそう。','文鳥と交流して限定ボーナスを獲得しよう。','森を探索して特別な報酬を見つけよう。'][i%4],mission:['care','minigame','social','explore'][i%4],target:3+(i%5),reward:{coins:120+(i%5)*40,xp:30+(i%4)*15}};
  });
}
function jstDate(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${v.year}-${v.month}-${v.day}`;
}
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function permute(cycle){const a=Array.from({length:100},(_,i)=>i);let x=hash('mofumori:'+cycle);for(let i=99;i>0;i--){x=(Math.imul(1664525,x)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['GET']))return;
  const date=jstDate(),epoch=Date.UTC(2026,8,20),day=Math.max(0,Math.floor((Date.parse(date+'T00:00:00Z')-epoch)/86400000)),cycle=Math.floor(day/100),slot=day%100,events=catalog(),event=events[permute(cycle)[slot]];
  if(configured()){try{const sb=getSupabase();const {data,error}=await sb.from('mofumori_daily_event_state').upsert({event_date:date,cycle_no:cycle,slot_no:slot,event_id:event.id,event_type:event.type},{onConflict:'event_date'}).select('event_id').single();if(error)throw error;if(data?.event_id!==event.id){const fixed=events.find(x=>x.id===data.event_id);if(fixed)Object.assign(event,fixed)}}catch(e){console.warn('[daily-event]',e.message)}}
  json(res,200,{ok:true,date,cycle,slot,event,total:100,nextReset:'00:00 Asia/Tokyo'});
};