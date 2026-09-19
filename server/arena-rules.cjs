function num(v,min,max,fallback=0){
  const n=Number(v);
  return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
}
function round(v,d=2){
  const p=10**d;
  return Math.round(Number(v||0)*p)/p;
}
function invalid(message,status=400){
  return Object.assign(new Error(message),{status});
}
function calculate(game,raw,s){
  if(game==='flight'){
    const duration=30000,maxHeight=21600;
    const height=num(raw?.height,0,maxHeight,0),collisions=Math.round(num(raw?.collisions,0,45,0));
    const weightFit=1-Math.min(Math.abs(s.weightG-s.idealWeightG)/Math.max(1,s.idealWeightG),.35);
    const modifier=.50+s.flightPower/260+s.endurance/360+s.agility/520+s.fitness/700+weightFit*.12;
    return {score:Math.max(0,Math.round(Math.max(0,height-collisions*160)*modifier)),detail:{height:round(height,0),collisions,durationMs:duration,modifier:round(modifier,3),weightFit:round(weightFit,3)}};
  }
  if(game==='kale'){
    const duration=10000,maxTaps=181;
    const taps=Math.round(num(raw?.taps,0,maxTaps,0));
    const modifier=.50+s.appetite/220+s.beakSpeed/300+s.focus/500+s.fitness/850;
    return {score:Math.max(0,Math.round(taps*100*modifier)),detail:{taps,durationMs:duration,modifier:round(modifier,3),maxTaps}};
  }
  const hits=Math.round(num(raw?.hits,0,12,0)),misses=Math.round(num(raw?.misses,0,12,0));
  const avgReaction=num(raw?.avgReactionMs,100,2000,1200);
  const base=Math.max(0,hits*100-misses*30-avgReaction*.12);
  const modifier=.55+s.agility/300+s.balance/280+s.focus/450+s.temperament/900-Math.max(0,s.frame-70)/1200;
  return {score:Math.max(0,Math.round(base*modifier)),detail:{hits,misses,avgReactionMs:round(avgReaction,0),modifier:round(modifier,3)}};
}
function validateSubmission(game,raw,{elapsedMs=0,expired=false}={}){
  if(expired)throw invalid('この対戦は終了しています。',410);
  if(game==='flight'){
    const duration=Number(raw?.durationMs),height=Number(raw?.height),collisions=Number(raw?.collisions);
    if(!Number.isFinite(duration)||duration<28500||duration>31500||elapsedMs<27000)throw invalid('飛行バトルのプレイ時間が不正です。');
    if(!Number.isFinite(height)||height<0||height>21600||!Number.isFinite(collisions)||collisions<0||collisions>45)throw invalid('飛行バトルの結果が不正です。');
    return true;
  }
  if(game==='kale'){
    const duration=Number(raw?.durationMs),taps=Number(raw?.taps);
    if(!Number.isFinite(duration)||duration<9000||duration>11000||elapsedMs<8500)throw invalid('もぐもぐ対戦のプレイ時間が不正です。');
    if(!Number.isFinite(taps)||!Number.isInteger(taps)||taps<0||taps>181)throw invalid('タップ数が不正です。');
    return true;
  }
  if(game==='perch'){
    const hits=Number(raw?.hits),misses=Number(raw?.misses),reaction=Number(raw?.avgReactionMs);
    if(elapsedMs<1200)throw invalid('反射バトルのプレイ時間が不正です。');
    if(!Number.isInteger(hits)||!Number.isInteger(misses)||hits<0||misses<0||hits+misses!==12)throw invalid('反射バトルのラウンド数が不正です。');
    if(hits>0&&(!Number.isFinite(reaction)||reaction<100||reaction>2000))throw invalid('反応時間が不正です。');
    return true;
  }
  throw invalid('ゲーム種別が不正です。');
}
module.exports={calculate,validateSubmission};
