const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
const {allowMethods,json,requireSameOrigin,sessionCookie}=require('../../server/auth.cjs');
const {configured,getSupabase}=require('../../server/supabase.cjs');

function username(v){const s=String(v||'').trim().toLowerCase();return /^[a-z0-9_]{3,20}$/.test(s)?s:null}
function display(v){const s=String(v||'').trim().slice(0,30);return s||null}
function password(v){const s=String(v||'');return s.length>=8&&s.length<=72?s:null}
async function hashPassword(pass,saltHex){
  const salt=Buffer.from(saltHex,'hex');
  const out=await scrypt(pass,salt,32,{N:16384,r:8,p:1});
  return Buffer.from(out).toString('hex');
}
function safe(a,b){const aa=Buffer.from(String(a),'hex'),bb=Buffer.from(String(b),'hex');return aa.length===bb.length&&aa.length>0&&crypto.timingSafeEqual(aa,bb)}
function playerIdFor(userKey){return 'MF-'+crypto.createHash('sha256').update(String(userKey)).digest('hex').slice(0,10).toUpperCase()}
function bucket(req,name){
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'').split(',')[0].trim();
  return crypto.createHash('sha256').update(ip+'|'+String(name||'')).digest('hex');
}
async function limit(sb,req,name){
  const {data,error}=await sb.rpc('mofumori_take_auth_limit',{p_bucket:bucket(req,name),p_window_seconds:900,p_limit:20});
  if(error)throw error;
  if(data!==true)throw Object.assign(new Error('ログイン試行が多すぎます。少し時間をおいてください。'),{status:429});
}

module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['POST']))return;
  try{
    requireSameOrigin(req);
    if(!configured())return json(res,503,{ok:false,message:'アカウント機能は準備中です。'});
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const action=String(body.action||'login');
    const u=username(body.username),p=password(body.password),sb=getSupabase();
    if(!u||!p)throw Object.assign(new Error('ユーザー名は英数字と_で3〜20文字、パスワードは8文字以上にしてください。'),{status:400});
    await limit(sb,req,u);

    if(action==='register'){
      const name=display(body.displayName)||u;
      const salt=crypto.randomBytes(16).toString('hex');
      const hash=await hashPassword(p,salt);
      const {data:account,error}=await sb.from('mofumori_accounts')
        .insert({username:u,display_name:name,password_salt:salt,password_hash:hash})
        .select('id,username,display_name').single();
      if(error){
        if(String(error.code)==='23505')throw Object.assign(new Error('そのユーザー名はすでに使われています。'),{status:409});
        throw error;
      }
      const userKey='local:'+account.id;
      const {error:profileError}=await sb.from('mofumori_profiles').insert({
        user_key:userKey,player_id:playerIdFor(userKey),display_name:name,score:0,
        character:{name:'文鳥',species:'buncho_sakura',speciesName:'桜文鳥',icon:'🐦',level:1,bond:0}
      });
      if(profileError)throw profileError;
      const user={id:userKey,email:'',name,picture:'',provider:'mofumori',username:u};
      res.setHeader('set-cookie',sessionCookie(user));
      return json(res,201,{ok:true,data:{...user,expiresAt:Date.now()+30*86400*1000}});
    }

    if(action!=='login')throw Object.assign(new Error('未対応の操作です。'),{status:400});
    const {data:account,error}=await sb.from('mofumori_accounts')
      .select('id,username,display_name,password_salt,password_hash').eq('username',u).maybeSingle();
    if(error)throw error;
    if(!account)throw Object.assign(new Error('ユーザー名またはパスワードが違います。'),{status:401});
    const hash=await hashPassword(p,account.password_salt);
    if(!safe(hash,account.password_hash))throw Object.assign(new Error('ユーザー名またはパスワードが違います。'),{status:401});
    const user={id:'local:'+account.id,email:'',name:account.display_name,picture:'',provider:'mofumori',username:account.username};
    res.setHeader('set-cookie',sessionCookie(user));
    return json(res,200,{ok:true,data:{...user,expiresAt:Date.now()+30*86400*1000}});
  }catch(error){
    return json(res,error.status||400,{ok:false,message:error.message||'ログイン処理に失敗しました。'});
  }
};
