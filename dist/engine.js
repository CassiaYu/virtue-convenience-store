(function (root) {
  'use strict';
  const virtues = [
    { id: 'honesty', seal: '信', name: '诚信', action: '失物归还', icon: '🔑', key: 'Q', color: '#b34230', meaning: '把无人监督时的诚实，带进扫码支付、失物招领和日常交易。', tradition: '诚实守信 · 拾金不昧', today: '核对支付、归还失物、尊重隐私' },
    { id: 'thrift', seal: '俭', name: '节俭', action: '按需取用', icon: '🍚', key: 'W', color: '#638148', meaning: '珍惜一饭一物，也可以是小份点单、自带水杯和减少一次性用品。', tradition: '勤俭节约 · 惜物惜粮', today: '光盘行动、适量点餐、循环使用' },
    { id: 'kindness', seal: '仁', name: '仁爱', action: '暖心援手', icon: '☂️', key: 'E', color: '#b76a30', meaning: '关心他人的处境，用一杯水、一把伞和一次耐心回应传递善意。', tradition: '仁者爱人 · 助人为乐', today: '邻里互助、校园关怀、友善服务' },
    { id: 'respect', seal: '敬', name: '敬老', action: '耐心陪伴', icon: '🫖', key: 'A', color: '#8c607d', meaning: '在数字生活里帮助长者，也尊重他们的选择；关怀不等于替他们做主。', tradition: '尊老敬老 · 推己及人', today: '跨越数字鸿沟、平等沟通、先问需求' },
    { id: 'courtesy', seal: '礼', name: '礼让', action: '文明协调', icon: '🤝', key: 'S', color: '#397e87', meaning: '把礼落实到公共生活：遵守秩序，温和沟通，尊重每个人的时间。', tradition: '谦和有礼 · 以和为贵', today: '有序排队、公共礼仪、友善协商' },
    { id: 'duty', seal: '责', name: '责任', action: '绿色行动', icon: '🌱', key: 'D', color: '#416751', meaning: '对共同生活的环境负责，从随手关灯、节约用水和分类投放开始。', tradition: '躬行践履 · 担当尽责', today: '节能减排、环保习惯、维护公共空间' }
  ];
  const scenarios = [
    ['honesty', '赶课的同学', '🧑‍🎓', '刚才结账好像多付了钱，能帮我核对后退回吗？', '主动核对并退回多付款，小额交易也要守信。'],
    ['honesty', '找卡的同学', '👩‍🎓', '我把校园卡落在这里了，能核对信息后还给我吗？', '核实身份、归还校园卡，也保护了失主的隐私。'],
    ['honesty', '送货的师傅', '🧑‍🔧', '门口捡到一个钱包，请帮忙登记失物招领。', '妥善登记、归还失物，让信任在社区里流动。'],
    ['thrift', '午休的同学', '🧑', '今天胃口小，能给我小份饭吗？吃完再加。', '按需取餐、吃完再添，让惜粮成为日常习惯。'],
    ['thrift', '自带杯的同学', '👩', '我带了自己的杯子，这次不用一次性纸杯。', '重复使用，让传统的惜物精神遇见低碳生活。'],
    ['thrift', '晚课的同学', '🧑‍🎓', '这些点心两个人分着吃就够了，不用多拿。', '适量分享，把节俭变成更聪明的消费选择。'],
    ['kindness', '淋雨的同学', '👩‍🦱', '突然下雨了，我没带伞，可以借一把爱心伞吗？', '借出一把伞，让助人为乐有了具体的模样。'],
    ['kindness', '路过的骑手', '🧑‍🚴', '送了好几单有点渴，能接一杯饮用水吗？', '一杯水，也是对劳动者的体谅与尊重。'],
    ['kindness', '刚来的新生', '🧑‍🎓', '初来学校有点迷路，能告诉我宿舍怎么走吗？', '耐心指路，让陌生的校园多一点归属感。'],
    ['respect', '学手机的奶奶', '👵', '这个扫码支付我还不太会，能慢慢教我一次吗？', '先征得同意，再耐心讲解，帮助长者跨过数字鸿沟。'],
    ['respect', '散步的爷爷', '👴', '这些字有点小，可以帮我读一下配料表吗？', '帮助看清信息，保留长者自己选择的权利。'],
    ['respect', '买菜的奶奶', '👵', '走得有点累，能让我坐下休息一会儿吗？', '主动提供座位，把敬老做成细致的关怀。'],
    ['courtesy', '排队的同学', '🧑', '大家都等着结账，有人插队了，能温和提醒一下吗？', '友善提醒、有序排队，让礼让守护公平。'],
    ['courtesy', '自习的同学', '👩‍🎓', '旁边视频声音有点大，能帮忙协调戴上耳机吗？', '照顾公共空间里的他人，用沟通减少冲突。'],
    ['courtesy', '取货的同学', '🧑‍🦱', '门口被共享单车挡住了，能协调大家留出通道吗？', '公共空间留一条路，也是给别人多一分尊重。'],
    ['duty', '值日的同学', '🧑‍🔧', '储物间没人，灯却一直开着，我们把它关掉吧。', '随手关灯，让对资源的责任变成一次行动。'],
    ['duty', '打扫的同学', '👩‍🔧', '这个用完的饮料瓶，能按标识分类投放吗？', '依照投放标识分类，共同维护校园环境。'],
    ['duty', '路过的同学', '🧑', '洗手台的水还流着，麻烦检查并关好水龙头。', '留意并处理小浪费，就是对共同生活负责。']
  ].map((s, i) => ({ id: i, virtue: s[0], name: s[1], avatar: s[2], request: s[3], lesson: s[4] }));
  class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset(mode = 'challenge') {
      this.mode = mode; this.status = 'idle'; this.score = 0; this.combo = 0; this.bestCombo = 0;
      this.lives = 3; this.remaining = 90000; this.elapsed = 0; this.served = 0; this.mistakes = 0;
      this.stamps = new Set(); this.counts = Object.fromEntries(virtues.map(v => [v.id, 0]));
      this.customers = []; this.deck = []; this.selected = null; this.serial = 0;
      this.spawnIn = 3600; this.cooldown = 0; this.bonus = false; this.lastLesson = '';
    }
    shuffle(items) {
      const a = [...items];
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    }
    start(mode = 'challenge') {
      if (!['challenge', 'practice'].includes(mode)) return false;
      this.reset(mode); this.status = 'playing'; this.spawn(); this.spawn(); return true;
    }
    get stage() { return this.mode === 'practice' ? 1 : Math.min(3, Math.floor(this.elapsed / 30000) + 1); }
    spawn() {
      if (this.customers.length >= 3 || this.status !== 'playing') return false;
      if (!this.deck.length) this.deck = this.shuffle(virtues.map(v => v.id));
      const type = this.deck.pop(); const options = scenarios.filter(s => s.virtue === type);
      const scene = options[Math.floor(this.random() * options.length)];
      const maxPatience = [26000, 22000, 18000][this.stage - 1];
      const slot = [0, 1, 2].find(n => !this.customers.some(c => c.slot === n));
      const customer = { ...scene, uid: ++this.serial, slot, patience: maxPatience, maxPatience };
      this.customers.push(customer);
      if (this.selected === null) this.selected = customer.uid;
      return true;
    }
    select(uid) {
      if (this.status !== 'playing' || !this.customers.some(c => c.uid === uid)) return false;
      this.selected = uid; return true;
    }
    pause() { if (this.status === 'playing') { this.status = 'paused'; return true; } return false; }
    resume() { if (this.status === 'paused') { this.status = 'playing'; return true; } return false; }
    finish(reason) { if (this.status === 'over') return; this.status = 'over'; this.reason = reason; }
    action(id) {
      if (this.status !== 'playing' || this.cooldown > 0) return { type: 'ignored' };
      if (!virtues.some(v => v.id === id)) return { type: 'ignored' };
      const customer = this.customers.find(c => c.uid === this.selected);
      if (!customer) return { type: 'empty' };
      if (customer.virtue !== id) {
        this.combo = 0; this.mistakes++; this.cooldown = 650;
        if (this.mode === 'challenge') { this.lives--; if (this.lives <= 0) this.finish('reputation'); }
        return { type: 'wrong', correct: customer.virtue };
      }
      this.combo++; this.bestCombo = Math.max(this.combo, this.bestCombo); this.served++;
      this.counts[id]++; this.stamps.add(id);
      const gained = 100 + Math.min(this.combo - 1, 5) * 20;
      this.score += gained; this.lastLesson = customer.lesson;
      this.customers = this.customers.filter(c => c.uid !== customer.uid);
      this.selected = this.customers.length ? this.customers.reduce((a,b) => a.slot < b.slot ? a : b).uid : null;
      this.spawnIn = Math.min(this.spawnIn, 850); this.cooldown = 180;
      let unlocked = false;
      if (this.stamps.size === 6 && !this.bonus) {
        this.bonus = true; unlocked = true; this.score += 300;
        this.customers.forEach(c => { c.patience = c.maxPatience; });
      }
      if (this.mode === 'practice' && this.served >= 12) this.finish('practice');
      return { type: 'success', gained, virtue: id, lesson: customer.lesson, unlocked };
    }
    tick(ms) {
      if (this.status !== 'playing' || !Number.isFinite(ms) || ms <= 0) return [];
      const dt = this.mode === 'challenge' ? Math.min(ms, this.remaining) : ms;
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.elapsed += dt; const events = [];
      if (this.mode === 'challenge') {
        this.remaining = Math.max(0, this.remaining - dt);
        this.customers.forEach(c => { c.patience -= dt; });
        const expired = this.customers.filter(c => c.patience <= 0);
        if (expired.length) {
          this.customers = this.customers.filter(c => c.patience > 0);
          this.lives = Math.max(0, this.lives - expired.length); this.mistakes += expired.length; this.combo = 0;
          if (!this.customers.some(c => c.uid === this.selected)) this.selected = this.customers[0]?.uid ?? null;
          events.push({ type: 'expired', count: expired.length });
        }
        if (this.remaining === 0) this.finish('time');
        else if (this.lives === 0) this.finish('reputation');
      }
      if (this.status === 'over') { events.push({ type: 'over' }); return events; }
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        if (this.spawn()) events.push({ type: 'spawn' });
        this.spawnIn = this.mode === 'practice' ? 2200 : [3800, 2900, 2100][this.stage - 1];
      }
      return events;
    }
    snapshot() {
      return { status: this.status, mode: this.mode, score: this.score, remaining: Math.ceil(this.remaining / 1000), served: this.served, combo: this.combo, lives: this.lives, stamps: [...this.stamps], selected: this.selected, customers: this.customers.map(({ uid, name, request, slot }) => ({ uid, name, request, slot })) };
    }
  }
  root.VirtueGame = { Game, virtues, scenarios };
  if (typeof module !== 'undefined') module.exports = root.VirtueGame;
})(typeof globalThis !== 'undefined' ? globalThis : this);
