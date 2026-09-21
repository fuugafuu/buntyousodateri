const assert=require('node:assert/strict');
const fs=require('node:fs');

const main=fs.readFileSync('main.js','utf8');
const pets=fs.readFileSync('pet-system.js','utf8');
const arena=fs.readFileSync('v6-ui.js','utf8');
const v7=fs.readFileSync('v7-ui.js','utf8');
const daily=fs.readFileSync('daily-events.js','utf8');

assert.ok(main.includes('function birdAnimationActive()'),'visibility-aware bird animation missing');
assert.ok(main.includes("if(document.hidden||!birdAnimVisible)return false"),'hidden bird animation must stop');
assert.ok(main.includes("const targetFps=activeMotion?60:30"),'idle animation throttling missing');
assert.ok(main.includes('IntersectionObserver'),'off-screen bird rendering must pause');
assert.ok(main.includes("if(!document.hidden)gameTick()"),'background game tick must stop');
assert.ok(main.includes("if(!document.hidden)save()"),'background periodic saves must stop');
assert.ok(main.includes("if(signature===lastStatsSignature)return"),'unchanged stats DOM should not rebuild');

assert.ok(pets.includes("document.getElementById('breedingModal')?.classList.contains('show')"),'breeding countdown should update only when visible');
assert.ok(pets.includes('45000'),'idle pet dashboard polling should be relaxed');
assert.ok(pets.includes('8000'),'social tab polling should be relaxed');
assert.ok(arena.includes("if(!logged()||document.hidden)return"),'arena polling must pause in background');
assert.ok(v7.includes('if(document.hidden)return'),'progress polling must pause in background');
assert.ok(daily.includes("if(!document.hidden)load(false)"),'daily events polling must pause in background');

console.log('v7.3.2 performance guards: idle/background work reduced without removing UI or features');
