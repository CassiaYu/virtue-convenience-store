const assert = require('node:assert/strict');
const {Game, virtues, scenarios} = require('../dist/engine.js');
const game = new Game(() => .37);
assert.equal(virtues.length,6);
assert.equal(scenarios.length,18);
for (const s of scenarios) assert.ok(virtues.some(v=>v.id===s.virtue));
assert.equal(game.start('bad'),false);
game.start();
assert.equal(game.customers.length,2);
const selected=game.customers.find(c=>c.uid===game.selected);
const first=game.action(selected.virtue);
assert.equal(first.type,'success');assert.equal(game.score,100);assert.equal(game.served,1);
assert.equal(game.action(selected.virtue).type,'ignored');assert.equal(game.score,100);
const time=game.remaining;game.pause();game.tick(15000);assert.equal(game.remaining,time);
assert.equal(game.action('honesty').type,'ignored');game.resume();game.tick(1000);assert.equal(game.remaining,time-1000);
game.start();
for(let i=0;i<3;i++){
  const c=game.customers.find(c=>c.uid===game.selected);
  const bad=virtues.find(v=>v.id!==c.virtue).id;
  assert.equal(game.action(bad).type,'wrong');
  if(i<2)game.tick(700);
}
assert.equal(game.status,'over');assert.equal(game.reason,'reputation');assert.equal(game.lives,0);
assert.equal(game.action('honesty').type,'ignored');
game.start();game.tick(27000);assert.equal(game.lives,1);assert.equal(game.mistakes,2);
game.tick(30000);assert.equal(game.status,'over');
game.start('practice');game.tick(500000);assert.equal(game.status,'playing');assert.equal(game.lives,3);
const practiceCustomer=game.customers.find(c=>c.uid===game.selected);
game.action(virtues.find(v=>v.id!==practiceCustomer.virtue).id);assert.equal(game.lives,3);game.tick(700);
let total=0, bonuses=0;
while(game.status==='playing'){
  if(game.customers.length){
    const c=game.customers.find(c=>c.uid===game.selected);
    const r=game.action(c.virtue);
    if(r.type==='success'){total+=r.gained;if(r.unlocked){total+=300;bonuses++;}}
  }
  game.tick(900);
}
assert.equal(game.served,12);assert.equal(game.reason,'practice');assert.equal(game.stamps.size,6);
assert.equal(bonuses,1);assert.equal(total,game.score);assert.equal(game.bestCombo,12);
game.start();assert.equal(game.score,0);assert.equal(game.remaining,90000);assert.equal(game.stamps.size,0);assert.equal(game.bonus,false);
for(let i=0;i<900;i++){
  game.tick(100);
  if(game.customers.length && game.status==='playing')game.action(game.customers.find(c=>c.uid===game.selected).virtue);
}
assert.equal(game.status,'over');assert.equal(game.reason,'time');assert.equal(game.remaining,0);
assert.ok(game.served>20);assert.ok(game.score>2000);assert.equal(game.lives,3);
assert.equal(game.stamps.size,6);assert.equal(game.stage,3);
const finalScore=game.score;game.tick(10000);assert.equal(game.score,finalScore);
assert.equal(game.select(987654),false);
game.reset();assert.equal(game.status,'idle');assert.equal(game.score,0);
console.log('PASS: scenarios, timing, scoring, cooldown, wrong action, expiry, pause, 12-order practice, six seals, one-time bonus, 90-second challenge, restart.');
