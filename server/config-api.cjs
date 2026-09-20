const {allowMethods,json}=require('./auth.cjs');
const {configured,getSupabase}=require('./supabase.cjs');

const FALLBACK={
  activeBanner:'standard',
  banners:[{
    id:'standard',name:'森の仲間ガチャ',enabled:true,price1:180,price10:1600,
    rates:{N:55,R:27,SR:13,SSR:4,UR:1},
    speciesWeights:{buncho_sakura:16,buncho_white:14,buncho_cinnamon:11,buncho_silver:9,canary:8,inko_green:7,inko_blue:7,buncho_pied:6,buncho_black:5,finch_zebra:5,lovebird:4,cockatiel:4,cat:4,penguin:4,beaver:3,fox:3,owl:2}
  }]
};
module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['GET']))return;
  try{
    if(!configured())return json(res,200,{ok:true,data:FALLBACK,configured:false});
    const sb=getSupabase();
    const {data,error}=await sb.from('mofumori_game_config').select('value,updated_at').eq('key','gacha').maybeSingle();
    if(error)throw error;
    json(res,200,{ok:true,data:data?.value||FALLBACK,updatedAt:data?.updated_at||null,configured:true});
  }catch(error){json(res,500,{ok:false,message:error.message||'設定を取得できませんでした。'});}
};
