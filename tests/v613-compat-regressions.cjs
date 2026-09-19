const fs=require('node:fs');

function has(file,needle,label){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes(needle))throw new Error(label+' ('+file+')');
}
function lacks(file,needle,label){
  const text=fs.readFileSync(file,'utf8');
  if(text.includes(needle))throw new Error(label+' ('+file+')');
}

has('v52-ui.js',"const chip=$('#v52RankChip');if(chip)",'ranking chip must be optional in v6');
has('v52-ui.js',"const petCount=$('#v52PetCount'),friendCount=$('#v52FriendCount');if(petCount)",'legacy topbar counters must be optional in v6');
lacks('v52-ui.js',"$('#v52RankChip').textContent",'ranking code must not dereference removed v5.2 chip');
lacks('v52-ui.js',"$('#v52PetCount').textContent",'chrome code must not dereference removed pet counter');
lacks('v52-ui.js',"$('#v52FriendCount').textContent",'chrome code must not dereference removed friend counter');
has('social.js',"document.body.dataset.sync='cloud';\n    try{renderSyncedGameState()}catch(renderError)",'successful cloud I/O must stay marked cloud even if rendering fails');
has('social.js',"Cloud data loaded but UI render failed",'cloud render exceptions must be isolated');
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
has('index.html',`window.MOFUMORI_BUILD='${version}'`,'cache rotation must match package version');
console.log(version+' compatibility regression checks passed');
