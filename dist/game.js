(function () {
  'use strict';
  const { Game, virtues, scenarios } = window.VirtueGame;
  const game = new Game();
  const $ = id => document.getElementById(id);
  let last = performance.now();
  let resultShown = false;
  let soundEnabled = false;
  let audioContext;
  let best = 0;
  let messageUntil = 0;
  let infoPausedGame = false;
  let priorFocus;
  try { best = Math.max(0, Number(localStorage.getItem('virtue-store-best-v1')) || 0); } catch (_) { /* Storage may be disabled. */ }
  const actionHints = {
    honesty: '核对 · 归还', thrift: '小份 · 惜物', kindness: '借伞 · 互助',
    respect: '敬老 · 关怀', courtesy: '秩序 · 礼让', duty: '节能 · 环保'
  };
  function tone(ok = true, bonus = false) {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume().catch(() => {});
      const t = audioContext.currentTime;
      (bonus ? [523, 659, 784, 1047] : ok ? [660, 880] : [200, 160]).forEach((frequency, i) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, t + i * .09);
        gain.gain.linearRampToValueAtTime(.045, t + i * .09 + .01);
        gain.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .18);
        oscillator.connect(gain); gain.connect(audioContext.destination);
        oscillator.start(t + i * .09); oscillator.stop(t + i * .09 + .2);
      });
    } catch (_) { soundEnabled = false; updateSound(); }
  }
  function updateSound() {
    $('sound').setAttribute('aria-pressed', String(soundEnabled));
    $('sound').setAttribute('aria-label', soundEnabled ? '关闭音效' : '开启音效');
    $('sound').title = soundEnabled ? '音效已开启' : '音效已关闭';
  }
  function feedback(text, style = '', duration = 4800) {
    $('feedback').textContent = text;
    $('feedback').className = 'feedback ' + style;
    messageUntil = game.elapsed + duration;
  }
  function stampMarkup() {
    return virtues.map(v => `<span class="stamp ${game.stamps.has(v.id) ? 'collected' : ''}" title="${v.name}：${game.counts[v.id]}次" aria-label="${v.name}${game.stamps.has(v.id) ? '已获得' : '未获得'}">${v.seal}</span>`).join('');
  }
  function renderCustomers() {
    const focusId = document.activeElement?.dataset?.customer;
    const demo = game.status === 'idle';
    const list = demo ? [scenarios[0], scenarios[3]].map((c,i) => ({ ...c, uid: -i-1, slot: i, maxPatience: 26000, patience: 26000 })) : game.customers;
    const active = list.find(c=>c.uid===game.selected) || list[0];
    $('mobile-request').textContent = active ? `${active.name}：${active.request}` : '下一位顾客正在路上，稍等一下。';
    $('customers').innerHTML = [0,1,2].map(slot => {
      const c = list.find(c => c.slot === slot);
      if (!c) return `<div class="empty-slot"><span class="empty-icon" aria-hidden="true">＋</span><span>等待下一位顾客</span></div>`;
      const selected = c.uid === game.selected;
      return `<button class="customer ${selected ? 'selected' : ''}" data-customer="${c.uid}" ${demo ? 'disabled' : ''} aria-pressed="${selected}" aria-label="${c.name}：${c.request}">
        <span class="customer-top"><span class="avatar" aria-hidden="true">${c.avatar}</span><span class="customer-name">${c.name}</span><span class="slot-number">${slot+1}</span></span>
        <span class="request">${c.request}</span>
        <span class="patience-track" role="progressbar" aria-label="${c.name}的耐心" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span class="patience-fill" style="display:block" data-patience="${c.uid}"></span></span>
        <span class="customer-foot"><span>${game.mode === 'practice' ? '不计时 · 慢慢来' : '等待回应'}</span><span class="select-label">${selected ? '正在服务' : '点击选择'}</span></span>
      </button>`;
    }).join('');
    if (focusId) document.querySelector(`[data-customer="${game.selected ?? focusId}"]`)?.focus({preventScroll:true});
    renderPatience();
  }
  function renderPatience() {
    game.customers.forEach(c => {
      const fill = document.querySelector(`[data-patience="${c.uid}"]`);
      if (!fill) return;
      const percent = game.mode === 'practice' ? 100 : Math.max(0, c.patience / c.maxPatience * 100);
      fill.style.width = percent + '%';
      fill.classList.toggle('urgent', percent < 30);
      fill.parentElement.setAttribute('aria-valuenow', String(Math.round(percent)));
    });
  }
  function renderStats() {
    document.querySelector('.game-shell').classList.toggle('in-session', game.status !== 'idle');
    $('score').textContent = String(game.score).padStart(4, '0');
    $('time-label').textContent = game.mode === 'practice' ? '练习进度' : '营业倒计时';
    $('timer').innerHTML = game.mode === 'practice' ? `${game.served}<span>/12单</span>` : `${Math.ceil(game.remaining / 1000)}<span>s</span>`;
    $('timer').classList.toggle('urgent-time', game.remaining <= 15000 && game.mode === 'challenge');
    $('lives').textContent = game.mode === 'practice' ? '∞' : '♥ '.repeat(game.lives).trim() + ' ♡'.repeat(3-game.lives);
    $('lives').setAttribute('aria-label', game.mode === 'practice' ? '练习模式不扣信誉' : `${game.lives}点信誉`);
    $('pause').disabled = game.status !== 'playing';
    $('phase').textContent = game.status === 'idle' ? '今日，你来当店长。' : game.mode === 'practice' ? '练习营业 · 慢慢来，也很好' : ['上午 · 小店开张','午间 · 来客渐多','放学 · 温暖高峰'][game.stage-1];
    const multiplier = (1 + Math.min(Math.max(game.combo - 1, 0), 5)*.2).toFixed(1);
    $('combo').textContent = game.combo > 1 ? `${game.combo} 连击 · ×${multiplier}` : game.status === 'idle' ? '准备营业' : '每单 +100 起';
    document.querySelectorAll('.action').forEach(b => { b.disabled = game.status !== 'playing' || !game.customers.length; });
  }
  function renderAll() { renderCustomers(); renderStats(); $('stamps').innerHTML = stampMarkup(); }
  function start(mode) {
    if (!game.start(mode)) return false;
    priorFocus = null; messageUntil = 0; resultShown = false; last = performance.now();
    if ($('result-dialog').open) $('result-dialog').close();
    $('welcome').hidden = true; $('paused').hidden = true;
    $('stamp-hint').textContent = '集齐六章 · +300分并回满顾客耐心';
    renderAll(); feedback(mode === 'practice' ? '练习模式：没有倒计时，完成12单即可。选错会提示，再试一次就好。' : '营业啦！点选一位顾客，再用合适的行动回应需求。', '', 6000);
    document.querySelector('.customer.selected')?.focus({preventScroll:true});
    tone(); return true;
  }
  function select(uid) {
    if (!game.select(uid)) return false;
    renderCustomers(); tone(); return true;
  }
  function act(id) {
    advance();
    const result = game.action(id);
    if (result.type === 'ignored') return result;
    if (result.type === 'empty') { feedback('稍等一下，下一位顾客马上到。'); return result; }
    document.querySelectorAll('.action.hint').forEach(b=>b.classList.remove('hint'));
    if (result.type === 'success') {
      const virtue = virtues.find(v=>v.id===id);
      feedback(result.unlocked ? `六章集齐！善意时刻 +300，等待中的顾客耐心回满。${result.lesson}` : `+${result.gained} · ${virtue.name}：${result.lesson}`, result.unlocked ? 'bonus' : 'success', 6000);
      tone(true, result.unlocked);
      if (result.unlocked) $('stamp-hint').textContent = '善意时刻已解锁 · 六种美德正在发光';
    } else if (result.type === 'wrong') {
      const correct = virtues.find(v=>v.id===result.correct);
      feedback(`先听清这位顾客的需要：试试「${correct.action}」。${game.mode === 'practice' ? '练习不扣信誉。' : '本次信誉 −1。'}`, 'error', 6500);
      document.querySelector(`[data-action="${correct.id}"]`)?.classList.add('hint'); tone(false);
    }
    renderAll();
    if (game.status === 'over') showResult();
    return result;
  }
  function pause() {
    advance();
    if (!game.pause()) return false;
    priorFocus = document.activeElement;
    $('paused').hidden = false;
    $('paused').setAttribute('role','dialog'); $('paused').setAttribute('aria-modal','true'); $('paused').setAttribute('aria-label','营业已暂停');
    renderStats(); $('resume').focus({preventScroll:true}); return true;
  }
  function resume() {
    if (!game.resume()) return false;
    last = performance.now(); $('paused').hidden = true; renderStats();
    if (priorFocus?.isConnected && !priorFocus.disabled) priorFocus.focus({preventScroll:true});
    else document.querySelector('.customer.selected')?.focus({preventScroll:true});
    return true;
  }
  function home() {
    game.reset(); resultShown = false; last = performance.now();
    if ($('result-dialog').open) $('result-dialog').close();
    $('paused').hidden = true; $('welcome').hidden = false;
    renderAll(); feedback('先选一位顾客，再点击下方合适的行动。');
    $('stamp-hint').textContent = '集齐六章 · 解锁善意时刻'; updateBest(); $('start').focus({preventScroll:true});
  }
  function updateBest() { $('best-label').textContent = best > 0 ? `本机挑战最佳：${best} 善意值` : '每一份善意，都值得认真回应。'; }
  function showResult() {
    if (resultShown) return;
    resultShown = true;
    let newBest = false;
    if (game.mode === 'challenge' && game.score > best) {
      best = game.score; newBest = true;
      try { localStorage.setItem('virtue-store-best-v1', String(best)); } catch (_) { /* Optional local record. */ }
    }
    $('result-title').textContent = game.mode === 'practice' ? '暖心练习，完成！' : game.stamps.size === 6 ? '六德齐聚，满店温暖！' : game.served >= 5 ? '你的善意，已经送达。' : '再试一次，也是一种成长。';
    $('result-subtitle').textContent = (game.reason === 'reputation' ? '小店打烊啦。放慢一点，先看清顾客的需要。' : game.mode === 'practice' ? '12次回应，把美德放进真实生活。' : '90秒营业结束，看看今天的收获。') + (newBest ? ' 刷新了本机纪录！' : '');
    $('result-score').textContent = game.score; $('result-served').textContent = game.served;
    $('result-combo').textContent = game.bestCombo; $('result-stamps').textContent = `${game.stamps.size}/6`;
    $('result-seals').innerHTML = stampMarkup();
    const most = virtues.reduce((a,b)=>game.counts[b.id] > game.counts[a.id] ? b : a);
    $('result-lesson').textContent = game.served ? `你实践最多的是「${most.name}」。${most.meaning}` : '先从一件小事开始：认真倾听、诚实回应、愿意帮忙。你也可以选择不计时练习。';
    $('paused').hidden = true; renderStats();
    $('result-dialog').showModal(); $('restart').focus();
  }
  function advance() {
    const now = performance.now(); const elapsed = now-last; last=now;
    if (game.status !== 'playing') return;
    const events = game.tick(elapsed);
    const expiredEvent = events.find(e=>e.type==='expired');
    if (expiredEvent) { feedback(`有${expiredEvent.count}位顾客等得太久离开了，信誉 −${expiredEvent.count}。先回应耐心较少的顾客吧。`,'error'); tone(false); }
    if (events.length) renderCustomers();
    renderStats(); renderPatience();
    if (messageUntil && game.elapsed >= messageUntil) { messageUntil=0; $('feedback').textContent='点选顾客，再用工具箱回应。连续服务，积累更多善意值。'; $('feedback').className='feedback'; }
    if (game.status === 'over') showResult();
  }
  function openInfo(type) {
    infoPausedGame = game.status === 'playing';
    if (infoPausedGame) { advance(); game.pause(); renderStats(); }
    const intro = `<span class="ticket-kicker">当中华传统美德遇上现代生活</span>`;
    $('info-content').innerHTML = type === 'about' ? `${intro}<h2>把美德，带进每一天。</h2><p>传统美德不是只能留在课本里的名词。在现代校园里，它可以是退款时的诚实、点餐时的节制、与长者沟通时的耐心，也可以是公共空间里的礼让。</p><p>这间小店把这些价值转化成可以操作的行动：你先理解一个人的处境，再选择如何回应。每枚印章都连接一种传统品格与一个现代生活场景。</p><div class="guide-grid">${virtues.map(v=>`<div class="guide-item"><b>${v.seal} · ${v.name}</b><p>${v.tradition}<br>↓<br>${v.today}</p></div>`).join('')}</div><h3>关于这份创意作业</h3><p>作品以日常校园服务为切入点，将中华传统美德与数字生活、绿色消费、公共秩序和社区互助联系起来。关卡情境与规则为本作品设计；小店场景插画由 AI 辅助生成。</p><p>计时与连击是游戏挑战，不是对个人品德的评判。真正重要的是：把理解他人的心意，变成生活中的行动。</p>` : `${intro}<h2>店长上手指南</h2><ol><li><strong>选顾客：</strong>点击订单卡，红框表示当前服务对象。读一读对方的需要。</li><li><strong>给回应：</strong>从六种行动中选一种。每单基础100分，连击最高达到每单200分。</li><li><strong>照顾等待：</strong>顾客的耐心条会变短。顾客离开或选错行动扣1点信誉，3点用完就打烊。</li><li><strong>收集六章：</strong>每种美德至少成功实践一次，额外获得300分，场上顾客耐心回满。每局奖励一次。</li></ol><p><strong>挑战：</strong>90秒，分三个时段逐渐加快。<br><strong>练习：</strong>无倒计时、不扣信誉，完成12单结束。</p><div class="key-guide">键盘：1 / 2 / 3 选择从左到右的顾客。<br>Q 失物归还 · W 按需取用 · E 暖心援手<br>A 耐心陪伴 · S 文明协调 · D 绿色行动<br>空格暂停或继续。切换页面会自动暂停。</div><p>本机最佳分只保存在当前浏览器，不收集姓名、账号或其他个人信息。</p>`;
    $('info-dialog').showModal();
  }
  $('actions').innerHTML = virtues.map(v=>`<button class="action" data-action="${v.id}" disabled aria-label="${v.action}，${v.name}，快捷键${v.key}"><kbd>${v.key}</kbd><span class="action-icon" aria-hidden="true">${v.icon}</span><span class="action-title">${v.action}</span><span class="action-virtue">${actionHints[v.id]}</span></button>`).join('');
  $('customers').addEventListener('click', e=>{ const c=e.target.closest('[data-customer]'); if(c) select(Number(c.dataset.customer)); });
  $('actions').addEventListener('click', e=>{ const a=e.target.closest('[data-action]'); if(a) act(a.dataset.action); });
  $('start').addEventListener('click',()=>start('challenge'));
  $('practice').addEventListener('click',()=>start('practice'));
  $('pause').addEventListener('click',pause); $('resume').addEventListener('click',resume);
  $('back-home').addEventListener('click',home); $('result-home').addEventListener('click',home);
  $('restart').addEventListener('click',()=>start(game.mode));
  $('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled; updateSound(); if(soundEnabled) tone();});
  $('about').addEventListener('click',()=>openInfo('about'));
  $('help').addEventListener('click',()=>openInfo('help'));
  $('keyboard-help').addEventListener('click',()=>openInfo('help'));
  document.querySelector('.dialog-close').addEventListener('click',()=>$('info-dialog').close());
  $('info-dialog').addEventListener('close',()=>{ if(infoPausedGame && game.status === 'paused') {game.resume();last=performance.now();renderStats();} infoPausedGame=false; });
  $('result-dialog').addEventListener('cancel',e=>{e.preventDefault();home();});
  document.addEventListener('visibilitychange',()=>{ if(document.hidden && game.status==='playing') pause(); });
  document.addEventListener('keydown',e=>{
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || $('info-dialog').open || $('result-dialog').open) return;
    if (e.key==='Tab' && !$('paused').hidden) {
      const a=$('resume'), b=$('back-home');
      if(e.shiftKey && document.activeElement===a){e.preventDefault();b.focus();}
      else if(!e.shiftKey && document.activeElement===b){e.preventDefault();a.focus();}
      return;
    }
    if(e.code==='Space' && (game.status==='playing'||game.status==='paused')) {e.preventDefault();game.status==='playing'?pause():resume();return;}
    if(game.status!=='playing')return;
    if(/^[123]$/.test(e.key)){e.preventDefault();const c=game.customers.find(c=>c.slot===Number(e.key)-1);if(c)select(c.uid);return;}
    const virtue=virtues.find(v=>v.key.toLowerCase()===e.key.toLowerCase());
    if(virtue){e.preventDefault();act(virtue.id);}
  });
  // Optional progressive enhancement: real game actions for supporting browsers.
  if(document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    const definitions = [
      { name:'get_store_game',title:'查看小店状态',description:'读取当前游戏状态、顾客需求与成绩。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>game.snapshot() },
      { name:'start_store_game',title:'开始小店游戏',description:'从店门口或结算开始新的挑战或练习；不会覆盖进行中的一局。',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['challenge','practice']}},required:['mode'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!['challenge','practice'].includes(input.mode))throw new Error('请选择challenge或practice');if(['playing','paused'].includes(game.status)||$('info-dialog').open)throw new Error('请先结束当前游戏或关闭说明');start(input.mode);return game.snapshot();} },
      { name:'serve_store_customer',title:'回应小店顾客',description:'选定一位正在等待的顾客并执行一种行动，成功时完成服务，选错会按当前模式扣信誉。',inputSchema:{type:'object',properties:{customerId:{type:'integer'},action:{type:'string',enum:virtues.map(v=>v.id)}},required:['customerId','action'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!Number.isInteger(input.customerId)||!virtues.some(v=>v.id===input.action))throw new Error('顾客或行动参数不正确');if(game.status!=='playing'||game.cooldown>0||!game.customers.some(c=>c.uid===input.customerId))throw new Error('当前无法服务该顾客');select(input.customerId);const result=act(input.action);return {result,state:game.snapshot()};} }
    ];
    definitions.forEach(tool=>{try{void Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch(_){/* The game works without WebMCP. */}});
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
  renderAll(); updateBest(); updateSound();
  window.setInterval(advance, 100);
})();
