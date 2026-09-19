const fs=require('node:fs');

function must(file,needle,message){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes(needle))throw new Error(message+' ('+file+')');
}
function mustNot(file,needle,message){
  const text=fs.readFileSync(file,'utf8');
  if(text.includes(needle))throw new Error(message+' ('+file+')');
}

must('v6-ui.js',"$$('[data-tool]',s).forEach",'More menu must bind every button');
must('social.js',"document.body.dataset.sync='cloud';",'Successful cloud pull must mark UI connected');
must('social.js',"try{renderSyncedGameState()}catch(renderError)",'Cloud UI rendering must not break sync state');
must('v52-ui.js',"if(document.body.classList.contains('mofumori-v6'))return",'Legacy tap animation must be disabled in v6');
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
must('index.html',`window.MOFUMORI_BUILD='${version}'`,'Build cache guard must match package version');
must('index.html',`v6-ui.js?v=${version}`,'Versioned UI asset must match package version');
must('sw.js',`const CACHE='mofumori-shell-v${version}'`,'Service worker cache must match package version');
must('sw.js','networkFirst(request)','Service worker must prefer fresh assets');
console.log(version+' base regression checks passed');
