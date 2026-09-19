const {allowMethods,json,requireUser,requireSameOrigin}=require('../server/auth.cjs');
const {configured,getSupabase}=require('../server/supabase.cjs');
const {requireAdmin}=require('../server/admin.cjs');

const SPECIES=new Set(['buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','canary','inko_green','inko_blue','buncho_pied','buncho_black','finch_zebra','lovebird','cockatiel','owl','cat','fox','penguin','beaver']);
const RARITIES=['N','R','SR','SSR','UR'];

function str(v,max=''){const s=String(v??'').trim();return max?s.slice(0,max):s}
function num(v,min,max){const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Object.assign(new Error('数値設定が範囲外です。'),{status:400});return n}
function validateConfig(input){
  if(!input||typeof input!=='object'||!Array.isArray(input.banners)||input.banners.length<1||input.banners.length>12)throw Object.assign(new Error('ガチャ設定が不正です。'),{status:400});
  const ids=new Set();
  const banners=input.banners.map(raw=>{
    const id=str(raw.id,32).toLowerCase();
    if(!/^[a-z0-9_-]{2,32}$/.test(id)||ids.has(id))throw Object.assign(new Error('ガチャIDが不正または重複しています。'),{status:400});
    ids.add(id);
    const rates={};let rateSum=0;
    for(const r of RARITIES){rates[r]=num(raw.rates?.[r],0,100);rateSum+=rates[r]}
    if(Math.abs(rateSum-100)>.001)throw Object.assign(new Error('レア度確率の合計は100%にしてください。'),{status:400});
    const speciesWeights={};
    for(const [species,value] of Object.entries(raw.speciesWeights||{})){
      if(!SPECIES.has(species))continue;
      const weight=num(value,0,10000);if(weight>0)speciesWeights[species]=weight;
    }
    if(!Object.keys(speciesWeights).length)throw Object.assign(new Error('排出対象のどうぶつを1種類以上設定してください。'),{status:400});
    return {
      id,name:str(raw.name,40)||id,enabled:raw.enabled!==false,
      price1:Math.round(num(raw.price1,0,100000)),price10:Math.round(num(raw.price10,0,100000)),
      rates,speciesWeights
    };
  });
  let activeBanner=str(input.activeBanner,32).toLowerCase();
  if(!ids.has(activeBanner)||!banners.find(b=>b.id===activeBanner)?.enabled)activeBanner=banners.find(b=>b.enabled)?.id||banners[0].id;
  return {activeBanner,banners};
}
async function audit(sb,user,action,target,detail={}){
  try{await sb.from('mofumori_admin_audit').insert({admin_key:user.id,action,target:target||null,detail})}catch(e){console.warn('[admin-audit]',e?.message||e)}
}
async function loadConfig(sb){
  const {data,error}=await sb.from('mofumori_game_config').select('value,updated_at,updated_by').eq('key','gacha').maybeSingle();
  if(error)throw error;return data||null;
}
module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['POST']))return;
  try{
    requireSameOrigin(req);
    if(!configured())return json(res,503,{ok:false,message:'管理機能は準備中です。'});
    const user=await requireUser(req),sb=getSupabase(),admin=await requireAdmin(sb,user);
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),action=str(body.action,32);
    if(action==='status'){
      const config=await loadConfig(sb);
      return json(res,200,{ok:true,data:{authorized:true,role:admin.role,permissions:admin.permissions,gacha:config?.value||null,updatedAt:config?.updated_at||null}});
    }
    if(action==='setGachaConfig'){
      if(admin.permissions?.gacha!==true)throw Object.assign(new Error('ガチャ設定の権限がありません。'),{status:403});
      const value=validateConfig(body.config);
      const {error}=await sb.from('mofumori_game_config').upsert({key:'gacha',value,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'key'});
      if(error)throw error;
      await audit(sb,user,'set_gacha_config',value.activeBanner,{bannerCount:value.banners.length});
      return json(res,200,{ok:true,data:value});
    }
    if(action==='adjustCurrency'){
      if(admin.permissions?.economy!==true)throw Object.assign(new Error('通貨操作の権限がありません。'),{status:403});
      const playerId=str(body.playerId,16).toUpperCase();
      if(!/^MF-[A-Z0-9]{8,12}$/.test(playerId))throw Object.assign(new Error('プレイヤーIDが不正です。'),{status:400});
      const coins=Math.trunc(num(body.coinsDelta||0,-100000000,100000000)),gems=Math.trunc(num(body.gemsDelta||0,-1000000,1000000));
      const {data,error}=await sb.rpc('mofumori_admin_adjust_currency',{p_admin:user.id,p_player_id:playerId,p_coins:coins,p_gems:gems});
      if(error){
        const m=String(error.message||'');
        if(m.includes('player_missing'))throw Object.assign(new Error('対象プレイヤーが見つかりません。'),{status:404});
        if(m.includes('save_missing'))throw Object.assign(new Error('対象プレイヤーのクラウドセーブがまだありません。'),{status:409});
        throw error;
      }
      await audit(sb,user,'adjust_currency',playerId,{coinsDelta:coins,gemsDelta:gems});
      return json(res,200,{ok:true,data});
    }
    if(action==='diagnostics'){
      if(admin.permissions?.debug!==true)throw Object.assign(new Error('診断権限がありません。'),{status:403});
      const [{count:profiles},{count:pets},{count:matches},{count:bots}]=await Promise.all([
        sb.from('mofumori_profiles').select('*',{count:'exact',head:true}).not('user_key','like','bot:arena:%'),
        sb.from('mofumori_pets').select('*',{count:'exact',head:true}).not('owner_key','like','bot:arena:%'),
        sb.from('mofumori_arena_matches').select('*',{count:'exact',head:true}).in('status',['ready','running']),
        sb.from('mofumori_profiles').select('*',{count:'exact',head:true}).like('user_key','bot:arena:%')
      ]);
      return json(res,200,{ok:true,data:{profiles:profiles||0,pets:pets||0,activeMatches:matches||0,arenaBots:bots||0,serverTime:new Date().toISOString()}});
    }
    throw Object.assign(new Error('未対応の管理操作です。'),{status:400});
  }catch(error){
    json(res,error.status||500,{ok:false,authorized:![401,403].includes(error.status),message:error.message||'管理操作に失敗しました。'});
  }
};
