const fs=require('node:fs');

function has(file,needle,label){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes(needle))throw new Error(label+' ('+file+')');
}

has('supabase/mofumori_v6_1_2_online_reliability.sql',"pg_advisory_xact_lock",'random matchmaking must serialize joins');
has('supabase/mofumori_v6_1_2_online_reliability.sql',"'reused',true",'duplicate queue calls must reuse active match');
has('api/arena.js',"if(existing?.id)return{status:'matched'",'API must recover already-created matches');
has('v6-ui.js',"if(A.queueing)return",'client must prevent duplicate random-match submits');
has('v6-ui.js',"const recovered=await refreshArena()", 'client must recover an active match after queue errors');
has('pet-system.js',"if(t==='friends'&&identityUser){N.last=0;refresh(true)}",'friends tab must refresh requests immediately');
has('pet-system.js',"friendsTab?.classList.contains('active')", 'open friends tab must poll for incoming requests');
has('pet-system.js',"window.addEventListener('focus'", 'returning to app must refresh online state');
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
has('index.html',`window.MOFUMORI_BUILD='${version}'`,'browser build cache must rotate');
console.log(version+' online reliability checks passed');
