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
mustNot('v6-ui.js',"$('[data-tool]',s).forEach",'Do not call forEach on querySelector result');
must('social.js',"document.body.dataset.sync='cloud';\n    renderSyncedGameState();",'Successful cloud pull must mark UI connected');
must('v52-ui.js',"if(document.body.classList.contains('mofumori-v6'))return",'Legacy tap animation must be disabled in v6');
must('index.html',"window.MOFUMORI_BUILD='6.1.1'",'Build cache guard must be present');
must('index.html','v6-ui.js?v=6.1.1','Versioned UI asset must be present');
must('sw.js',"const CACHE='mofumori-shell-v6.1.1'",'Service worker cache must be versioned');
must('sw.js','networkFirst(request)','Service worker must prefer fresh assets');
console.log('v6.1.1 regression checks passed');
