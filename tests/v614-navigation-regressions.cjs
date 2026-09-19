const fs=require('node:fs');

function has(file,needle,label){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes(needle))throw new Error(label+' ('+file+')');
}

has('index.html','maximum-scale=1.0, user-scalable=no','viewport zoom must be disabled');
has('index.html',"'gesturestart','gesturechange','gestureend'",'iOS gesture zoom must be blocked');
has('style.css','html,body{touch-action:pan-x pan-y}','touch zoom must be disabled while scrolling remains available');
has('v6-ui.js',"if(k==='bird')return openBirdCollection();",'bottom Buncho tab must open collection');
has('v6-ui.js',"window.showModal('birdModal')",'Buncho tab must open bird collection/gacha modal');
has('v6-ui.js',"$('#v6OpenProfile')?.addEventListener('click',openPet)",'profile must remain reachable separately');
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
has('index.html',`window.MOFUMORI_BUILD='${version}'`,'browser cache version must match app version');
console.log(version+' navigation/no-zoom regression checks passed');
