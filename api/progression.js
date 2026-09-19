const crypto=require('node:crypto');
const {allowMethods,json,requireUser,requireSameOrigin}=require('../server/auth.cjs');
const {configured,getSupabase}=require('../server/supabase.cjs');

function playerIdFor(userKey){return 'MF-'+crypto.createHash('sha256').update(String(userKey)).digest('hex').slice(0,10).toUpperCase()}
function levelFor(xp){return Math.floor(Math.sqrt(Math.max(0,Number(xp)||0)/75))+1}
function view(row){
  const xp=Number(row?.forest_xp||0),level=levelFor(xp),nextXp=Math.pow(level,2)*75;
  const daily={
    care:Number(row?.daily_care||0),play:Number(row?.daily_play||0),train:Number(row?.daily_train||0),
    battle:Number(row?.daily_battle||0),visit:Number(row?.daily_visit||0),gacha:Number(row?.daily_gacha||0),
    claims:row?.daily_claims||{}
  };
  return{
    xp,level,nextXp,streak:Number(row?.care_streak||0),daily,
    goals:[
      {id:'care3',name:'3回お世話する',current:daily.care,goal:3,rewardXp:50,claimed:Boolean(daily.claims?.care3)},
      {id:'play2',name:'2回いっしょに遊ぶ',current:daily.play,goal:2,rewardXp:60,claimed:Boolean(daily.claims?.play2)},
      {id:'train1',name:'1回トレーニング',current:daily.train,goal:1,rewardXp:70,claimed:Boolean(daily.claims?.train1)}
    ],
    unlocks:[
      {level:1,name:'文鳥のお世話',icon:'🐦'},
      {level:2,name:'オンライン対戦',icon:'⚔️'},
      {level:3,name:'ビーバーの出会い',icon:'🦫'},
      {level:5,name:'上級ミッション',icon:'🏅'},
      {level:8,name:'特別な森エリア',icon:'🌲'}
    ]
  };
}
async function ensureProfile(sb,user){
  let {data,error}=await sb.from('mofumori_profiles').select('*').eq('user_key',user.id).maybeSingle();
  if(error)throw error;
  if(data)return data;
  const record={user_key:user.id,player_id:playerIdFor(user.id),display_name:String(user.name||'Mofumoriユーザー').slice(0,50),score:0,character:{name:'文鳥',species:'buncho_sakura',speciesName:'桜文鳥',icon:'🐦',level:1,bond:0}};
  const inserted=await sb.from('mofumori_profiles').insert(record).select('*').single();
  if(inserted.error)throw inserted.error;
  return inserted.data;
}

module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  try{
    if(req.method==='POST')requireSameOrigin(req);
    const user=await requireUser(req);
    if(!configured())return json(res,503,{ok:false,message:'進行データは準備中です。'});
    const sb=getSupabase();
    let row=await ensureProfile(sb,user);
    if(req.method==='POST'){
      const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
      if(body.action!=='claim')throw Object.assign(new Error('未対応の操作です。'),{status:400});
      const goal=String(body.goal||'');
      const {data,error}=await sb.rpc('mofumori_claim_daily_goal',{p_user:user.id,p_goal:goal});
      if(error){
        const m=String(error.message||'');
        if(m.includes('already_claimed'))throw Object.assign(new Error('この報酬は受け取り済みです。'),{status:409});
        if(m.includes('goal_incomplete'))throw Object.assign(new Error('まだ目標を達成していません。'),{status:400});
        throw error;
      }
      const refreshed=await sb.from('mofumori_profiles').select('*').eq('user_key',user.id).single();
      if(refreshed.error)throw refreshed.error;
      return json(res,200,{ok:true,data:view(refreshed.data),reward:data?.rewardXp||0});
    }
    const refreshed=await sb.from('mofumori_profiles').select('*').eq('user_key',user.id).single();
    if(refreshed.error)throw refreshed.error;
    return json(res,200,{ok:true,data:view(refreshed.data)});
  }catch(error){return json(res,error.status||400,{ok:false,message:error.message||'進行データを取得できませんでした。'});}
};
