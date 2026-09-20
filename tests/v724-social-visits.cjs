const assert=require('node:assert/strict');
const fs=require('node:fs');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const social=fs.readFileSync('social.js','utf8');
const socialApi=fs.readFileSync('api/social.js','utf8');
const pets=fs.readFileSync('api/pets.js','utf8');
const petUi=fs.readFileSync('pet-system.js','utf8');
const petCss=fs.readFileSync('pet-system.css','utf8');
const sql=fs.readFileSync('supabase/mofumori_v7_2_4_fusion_rewards.sql','utf8');

assert.ok(/^7\./.test(pkg.version),'v7 release required');
assert.ok(html.includes('id="giftQtyInput"'),'gift quantity input missing');
assert.ok(html.includes('まとめて送る'),'bulk send button missing');

assert.ok(social.includes('function updateGiftQuantityLimit()'),'gift quantity limiter missing');
assert.ok(social.includes("quantity});if(result.gameState)"),'bulk quantity must be sent to API');
assert.ok(social.includes('async function claimAllGifts()'),'claim-all UI missing');
assert.ok(social.includes("remoteSocialAction('claimAllGifts'"),'claim-all API call missing');
assert.ok(social.includes('gift-bulk-bar'),'claim-all inbox bar missing');

assert.ok(socialApi.includes('integer(payload.quantity, 1, 9999, 1)'),'server gift quantity range missing');
assert.ok(socialApi.includes("action === 'claimAllGifts'"),'server claim-all action missing');
assert.ok(socialApi.includes('mofumori_claim_all_gifts'),'claim-all RPC missing');

assert.ok(pets.includes("action === 'careVisit'"),'visit care route missing');
assert.ok(pets.includes('VISIT_CARE_ACTIONS'),'visit care allowlist missing');
assert.ok(petUi.includes('function renderVisitorPresence()'),'live visitor rendering missing');
assert.ok(petUi.includes('function careVisitor('),'visitor care client missing');
assert.ok(petUi.includes('visitGuestLive'),'visitor live mount missing');
assert.ok(petUi.includes('Object.entries(VCARE)'),'visitor care controls missing');
assert.ok(petCss.includes('.visit-guest-live')&&petCss.includes('.visit-live-care'),'live visitor CSS missing');

assert.ok(sql.includes('mofumori_claim_all_gifts'),'claim-all DB function missing');
assert.ok(sql.includes('quantity between 1 and 9999'),'gift DB quantity constraint not widened');
assert.ok(sql.includes('mofumori_visit_care'),'visit care DB function missing');
assert.ok(sql.includes("'care:feed'")&&sql.includes("'care:pet'"),'visit care action constraint missing');
assert.ok(sql.includes('least(120,endurance')&&sql.includes('least(120,flight_power'),'care must preserve fusion stats above 100');
assert.ok(sql.includes("set search_path=''"),'privileged functions must lock search_path');

console.log('v7.2.4 social/visit guards: bulk gifts, claim-all, live visitor care and fusion-safe care OK');
