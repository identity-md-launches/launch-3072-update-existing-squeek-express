// Optional browser validation. Uses an existing Playwright installation; it does
// not install browsers, require a backend, or become part of the production site.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {initial,startExpedition} from '../dist/engine.mjs';
import {profileKey} from '../dist/profiles.mjs';

const playwright=process.env.IMD_PLAYWRIGHT
  ? await import(pathToFileURL(process.env.IMD_PLAYWRIGHT).href)
  : await import('playwright');
const root=resolve('dist');
const output=resolve('artifacts/validation');
await mkdir(output,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const missing=[];
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const suffix=url.pathname.replace(/^\/preview\//,'/');
  const file=resolve(root,'.'+(suffix==='/'?'/index.html':suffix));
  if(!url.pathname.startsWith('/preview/')||!file.startsWith(root+sep))return res.writeHead(404).end();
  try{res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}
  catch{missing.push(url.pathname);res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}/preview/`;
const results={scope:'Committed static export, served at /preview/',checks:[],limitations:[],consoleErrors:[],externalRequests:[]};
const checked=(name,detail)=>{results.checks.push({name,passed:true,detail});console.log(`PASS · ${name}`);};
const assertText=async(page,selector,expected)=>assert.equal((await page.locator(selector).textContent()).trim(),expected);
const saved=(page,name,mode='practice')=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),profileKey(name,mode));
async function contrast(page,selectors){
  const pairs=await page.evaluate(selectors=>{
    const parse=value=>{const m=value.match(/[\d.]+/g)?.map(Number);return m?.length>=3?[...m.slice(0,3),m[3]??1]:null;};
    const luminance=color=>color.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
    return selectors.map(selector=>{
      const el=document.querySelector(selector),style=getComputedStyle(el),foreground=parse(style.color);let background=null;
      for(let node=el;node;node=node.parentElement){const css=getComputedStyle(node),color=parse(css.backgroundColor);if(css.backgroundImage!=='none')break;if(color?.[3]===1){background=color;break;}if(color?.[3]>0)break;}
      if(!background)return {selector,measured:false};
      const a=luminance(foreground),b=luminance(background);
      return {selector,measured:true,foreground:style.color,background:`rgb(${background.slice(0,3).join(', ')})`,ratio:Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2))};
    });
  },selectors);
  for(const pair of pairs)if(pair.measured)assert(pair.ratio>=4.5,`${pair.selector}: ${pair.ratio}:1 text contrast`);
  results.contrastPairs??=[];results.contrastPairs.push(...pairs);
}
async function enter(page,name){await page.locator('#username').fill(name);await page.locator('#usernameForm button').click();await page.locator('#gameMain').waitFor({state:'visible'});}
async function seed(context,name,state,mode='practice'){
  await context.addInitScript(({key,state})=>{
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));
  },{key:profileKey(name,mode),state});
}
function observe(page){
  page.on('pageerror',error=>results.consoleErrors.push(error.message));
  page.on('request',request=>{
    if(!request.url().startsWith(base)&&!request.url().startsWith('data:'))results.externalRequests.push(request.url());
  });
  page.on('dialog',dialog=>{results.consoleErrors.push(`Unexpected dialog: ${dialog.message()}`);dialog.dismiss();});
}
async function reflow(page,width){
  await page.setViewportSize({width,height:844});
  await page.evaluate(()=>window.scrollTo(0,0));
  const metrics=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,username:getComputedStyle(document.querySelector('#username')).fontSize}));
  assert(metrics.scroll<=metrics.viewport,`${width}px: horizontal overflow ${metrics.scroll-metrics.viewport}px`);
  assert(parseFloat(metrics.username)>=16,'Username input must not trigger iOS text zoom');
}
let browser;
try{
  browser=await playwright.chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();observe(page);
  await page.clock.install();
  await page.goto(base);await page.locator('#username').waitFor();
  for(const width of [320,390,768,1440])await reflow(page,width);
  await reflow(page,390);
  let buttonBox=await page.locator('#usernameForm button').boundingBox();
  assert(buttonBox.y+buttonBox.height<=844,'Start shift is below the first mobile screen');
  await page.screenshot({path:resolve(output,'welcome-390.png')});
  await contrast(page,['#usernameHint','.welcome-note','.welcome-card>p','#usernameForm button']);
  await page.locator('#username').fill('ab');await page.locator('#usernameForm button').click();
  assert.equal(await page.locator('#username').getAttribute('aria-invalid'),'true');
  await assertText(page,'#profileError','Use 3–20 letters, numbers, or underscores.');
  await page.locator('#username').fill('NightEngineer');await page.locator('#username').press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'run');
  await page.evaluate(()=>window.scrollTo(0,0));
  buttonBox=await page.locator('#run').boundingBox();
  assert(buttonBox.y+buttonBox.height<=844,'Wake hamster is below the first mobile screen');
  await page.screenshot({path:resolve(output,'railway-390.png')});
  await contrast(page,['#signal','.job small','#networkStations .current i']);
  checked('390px first screen and keyboard entry','Product, username entry, Start shift, and then Wake your hamster are visible; invalid name is announced and refocused.');

  await page.locator('#run').press('Space');
  await page.clock.runFor(4500);
  assert(Number(await page.locator('#energy').textContent())>70,'Practice wheel should generate energy');
  await page.locator('[data-cargo="ore"]').click();
  await page.locator('[data-to="1"]').click();
  await page.clock.runFor(38000);
  await assertText(page,'#deliveries','1');
  assert(Number(await page.locator('#gears').textContent())>=2);
  await page.locator('#questsNav').click();
  assert.equal(await page.locator('#modal').getAttribute('aria-labelledby'),'modalTitle');
  await page.locator('[data-quest="first"]').click();
  assert((await saved(page,'NightEngineer')).claimed.includes('first'));
  assert.equal(await page.locator('[data-quest="first"]').count(),0);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'questsNav');
  checked('Practice delivery, ore rewards, and one-time quest','Keyboard wake, moving delivery, full completion, gears, quest claim, Escape and focus return.');

  // Official endpoint, deterministic response fixtures. These responses are tests,
  // not evidence that the remote service was reachable during validation.
  let work='9007199254741000',outage=false;
  await page.route('https://api.squeekchain.com/v1/status',async route=>{
    if(outage)return route.fulfill({status:503,body:'Unavailable'});
    const observedAt=await page.evaluate(()=>new Date().toISOString());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({installationId:'browser-test',measurement:{freshness:'online',observedAt,counterEpoch:'test-epoch',cumulativeWorkUnits:work,rpmMilli:42000,staleAfterSeconds:120}})});
  });
  const practice=await saved(page,'NightEngineer');
  let response=page.waitForResponse('https://api.squeekchain.com/v1/status');
  await page.locator('#live').click();await response;await page.clock.runFor(200);
  await assertText(page,'#energy','70');assert(await page.locator('#run').isDisabled());
  work='9007199254741010';response=page.waitForResponse('https://api.squeekchain.com/v1/status');
  await page.clock.runFor(5100);await response;await page.clock.runFor(200);await assertText(page,'#energy','75');
  outage=true;response=page.waitForResponse('https://api.squeekchain.com/v1/status');
  await page.clock.runFor(5100);await response;await page.clock.runFor(200);
  assert((await page.locator('#signal').textContent()).includes('unavailable'));
  await assertText(page,'#rpm','Unknown RPM');
  await assertText(page,'#energy','75');
  await page.locator('#practice').click();await page.clock.runFor(200);
  assert.equal((await saved(page,'NightEngineer')).delivered,practice.delivered);
  assert.equal((await saved(page,'NightEngineer','live')).delivered,0);
  checked('Squeekchain Live baseline, delta, outage, and separate Practice save','Mocked official-endpoint responses: baseline credits no history; 10 new units credit 5 energy; outage pauses readings; returning to Practice restores its delivery.');

  await page.locator('#switchPlayer').click();await enter(page,'NewEngineer');
  await assertText(page,'#deliveries','0');
  await page.locator('#leaderboardNav').click();
  assert((await page.locator('#modalContent').textContent()).includes('profiles saved in this browser only'));
  assert((await page.locator('.ranking-table').textContent()).includes('nightengineer'));
  await page.locator('[data-board="live"]').click();
  assert(!(await page.locator('.ranking-table').textContent()).includes('newengineer'));
  await page.keyboard.press('Escape');await context.close();
  checked('Local profiles and leaderboard isolation','A second name starts fresh; local rankings contain only saved names in the selected mode.');

  const repair=initial();repair.coins=321;repair.delivered=8;repair.km=25;repair.owned.push('mint');
  repair.expedition={id:'bogus',name:'<img src=x onerror=alert(1)>',hamster:'mint',remaining:0,ready:true,coins:'1e9',gear:0,crystal:0};
  const recovery=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await seed(recovery,'Repair',repair);
  const repairPage=await recovery.newPage();observe(repairPage);await repairPage.goto(base);await enter(repairPage,'Repair');
  await assertText(repairPage,'#coins','321');await assertText(repairPage,'#deliveries','8');await assertText(repairPage,'#distance','25.0');
  assert.equal((await saved(repairPage,'Repair')).expedition,null);
  await repairPage.reload();await enter(repairPage,'Repair');await assertText(repairPage,'#coins','321');
  await repairPage.locator('#leaderboardNav').click();assert((await repairPage.locator('.ranking-table').textContent()).includes('repair'));
  await recovery.close();
  checked('Corrupted expedition recovery in the real UI','Unknown expedition dropped; 321 stars, 8 deliveries, 25 km and the leaderboard entry survive save and reload.');

  const expedition=initial();expedition.coins=321;expedition.delivered=5;expedition.owned.push('mint');
  assert(startExpedition(expedition,'forest','mint'));
  Object.assign(expedition.expedition,{remaining:5,ready:true,name:'<img src=x onerror=alert(1)>',coins:'1e9',gear:-2,crystal:999});
  const exploration=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await seed(exploration,'Explorer',expedition);
  const expeditionPage=await exploration.newPage();observe(expeditionPage);await expeditionPage.clock.install();
  await expeditionPage.goto(base);await enter(expeditionPage,'Explorer');await expeditionPage.locator('#expeditionOpen').click();
  await assertText(expeditionPage,'#expeditionName','Whispering Woods');
  assert.equal(await expeditionPage.locator('#modalContent img').count(),0);assert(await expeditionPage.locator('#claimExpedition').isDisabled());
  await expeditionPage.screenshot({path:resolve(output,'expedition-390.png')});
  await expeditionPage.clock.runFor(6000);assert(await expeditionPage.locator('#claimExpedition').isEnabled());
  await expeditionPage.locator('#claimExpedition').click();
  await assertText(expeditionPage,'#coins','356');await assertText(expeditionPage,'#gears','2');await assertText(expeditionPage,'#crystals','0');
  assert.equal((await saved(expeditionPage,'Explorer')).stats.expeditions,1);assert.equal(await expeditionPage.locator('#claimExpedition').count(),0);
  await expeditionPage.keyboard.press('Escape');await expeditionPage.locator('#expeditionOpen').click();await assertText(expeditionPage,'#coins','356');
  await exploration.close();
  checked('Safe expedition rendering and canonical single claim','HTML name becomes built-in text; forged rewards and ready flag are ignored; claim waits for completion and pays exactly 35 stars and 2 gears once.');

  const stream=await browser.newContext({viewport:{width:1100,height:560},reducedMotion:'reduce'});
  await stream.route('https://api.squeekchain.com/v1/status',route=>route.fulfill({status:503,body:'Unavailable'}));
  const streamPage=await stream.newPage();observe(streamPage);await streamPage.goto(base+'?mode=overlay');
  assert(await streamPage.locator('#welcome').isHidden());assert(await streamPage.locator('#gameHeader').isHidden());
  assert(await streamPage.locator('#world').isVisible());assert(await streamPage.locator('.operations').isHidden());
  assert.equal(await streamPage.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('squeek-express-profile-')).length),0);
  await stream.close();checked('Independent stream view','Direct overlay URL opens without username, account or wallet, renders the scene, and creates no player save.');

  const rich=initial();rich.coins=2000;rich.delivered=8;rich.km=25;rich.energy=20;rich.resources={gear:6,crystal:4,pollen:4};
  const maxName='Engineer_12345678901';assert.equal(maxName.length,20);
  const assets=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await seed(assets,maxName,rich);
  const assetsPage=await assets.newPage();observe(assetsPage);await assetsPage.goto(base);await enter(assetsPage,maxName);
  await assetsPage.locator('#collectionNav').click();await assetsPage.locator('[data-skin="moon"]').click();
  assert((await saved(assetsPage,maxName)).owned.includes('moon'));await assertText(assetsPage,'#hamsterName','Moon Mage');
  await assetsPage.keyboard.press('Escape');await assetsPage.locator('#depotNav').click();await assetsPage.locator('[data-train="swift"]').click();
  assert.equal((await saved(assetsPage,maxName)).train,'swift');
  await assetsPage.keyboard.press('Escape');await assetsPage.locator('#workshopNav').click();await assetsPage.locator('[data-upgrade="generator"]').click();
  assert((await saved(assetsPage,maxName)).upgrades.generator);
  await assetsPage.keyboard.press('Escape');await assetsPage.locator('#snack').click();await assetsPage.locator('#exchange').click();
  let state=await saved(assetsPage,maxName);assert.equal(state.resources.pollen,0);assert.equal(state.resources.crystal,2);assert.equal(state.energy,50);
  for(const width of [320,390,768,1440]){
    await reflow(assetsPage,width);
    const name=await assetsPage.locator('#playerName').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,text:el.textContent}));
    assert.equal(name.text,maxName);assert(name.scroll<=name.width+1,`${width}px: username clipped`);
    for(const control of ['#collectionNav','#depotNav','#workshopNav','#questsNav','#expeditionOpen']){
      await assetsPage.locator(control).click();
      const dialog=await assetsPage.locator('#modal').boundingBox();assert(dialog.x>=0&&dialog.x+dialog.width<=width+1,`${width}px: dialog overflow`);
      await assetsPage.keyboard.press('Escape');
    }
  }
  await reflow(assetsPage,390);await assetsPage.screenshot({path:resolve(output,'long-profile-390.png')});
  await reflow(assetsPage,1440);await assetsPage.screenshot({path:resolve(output,'railway-1440.png'),fullPage:true});
  await assets.close();
  checked('Crew, train perks, upgrades, crafting, and responsive dialogs','Real purchase/equip/upgrade/craft/exchange controls; 20-character username and dialogs fit at 320, 390, 768, 1440px.');

  const liveContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const livePage=await liveContext.newPage();observe(livePage);await livePage.goto(base);await enter(livePage,'LiveCheck');
  const actualResponse=livePage.waitForResponse('https://api.squeekchain.com/v1/status',{timeout:10000}).catch(()=>null);
  await livePage.locator('#live').click();const actual=await actualResponse;
  await livePage.waitForFunction(()=>!document.querySelector('#signal').textContent.includes('Connecting'),{timeout:10000}).catch(()=>{});
  results.realLive={httpStatus:actual?.status()??null,signal:await livePage.locator('#signal').textContent(),rpm:await livePage.locator('#rpm').textContent()};
  if(actual?.ok()&&!results.realLive.signal.includes('unavailable'))checked('Real official API browser smoke','Unmocked official endpoint returned HTTP 200 and produced live telemetry.');
  else results.limitations.push('Unmocked browser live-feed smoke could not obtain usable telemetry; the UI reports the signal as unavailable and preserves saved energy.');
  await liveContext.close();

  // Browser availability is tested by launching, never by inspecting this machine.
  let webkit;
  try{
    webkit=await playwright.webkit.launch({headless:true});
    const safari=await webkit.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});observe(safari);
    await safari.goto(base);await enter(safari,'SafariEngineer');await safari.locator('#run').click();
    assert((await safari.locator('#run').textContent()).includes('Time for a rest'));
    await safari.locator('#collectionNav').click();assert(await safari.locator('#modal').isVisible());await safari.keyboard.press('Escape');
    await reflow(safari,320);await reflow(safari,390);
    checked('WebKit primary interaction','Username entry, Practice wake, native dialog and mobile reflow.');
  }catch(error){
    if(webkit)throw error;
    results.limitations.push(`WebKit browser check could not run: ${error.message.split('\n')[0].replace(/\/[^ ]+/g,'[runtime path]')}`);
  }
  finally{await webkit?.close();}

  assert.equal(missing.length,0,`Missing local assets: ${missing.join(', ')}`);
  assert.equal(results.consoleErrors.length,0,`Browser errors: ${results.consoleErrors.join('; ')}`);
  assert(results.externalRequests.every(url=>url==='https://api.squeekchain.com/v1/status'),'Unexpected external resource or font request');
  checked('Static subpath, local resources, and runtime errors','No missing assets or page errors; no external requests except the explicitly tested official API.');
  results.limitations.push('Live success/outage scenarios use deterministic response fixtures; service availability is checked separately.');
  results.limitations.push('No physical-device, native screen-reader, or browser-native zoom session. Reflow and reduced-motion browser emulation are checked.');
  results.passed=true;
}catch(error){results.passed=false;results.failure=error.stack;console.error(error.message);process.exitCode=1;}
finally{
  await browser?.close();await new Promise(done=>server.close(done));
  await writeFile(resolve(output,'browser-results.json'),JSON.stringify(results,null,2)+'\n');
}
