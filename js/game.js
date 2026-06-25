/**
 * ==================== 垃圾分类大挑战 V3 — 完整逻辑 ====================
 * 三模式 + 知识图鉴 + 成就系统 + 新手引导 + 成绩分析 + 85题
 */
(function () {
  'use strict';

  const AudioEngine = {
    ctx: null,
    init() { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} },
    play(f, t, d, v = 0.1) {
      if (!this.ctx) return;
      try { const o = this.ctx.createOscillator(); const g = this.ctx.createGain(); o.type = t; o.frequency.setValueAtTime(f, this.ctx.currentTime); g.gain.setValueAtTime(v, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + d); o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + d); } catch (e) {}
    },
    sfxCorrect() { this.play(660, 'sine', 0.1); setTimeout(() => this.play(880, 'sine', 0.12), 80); },
    sfxWrong() { this.play(180, 'square', 0.18, 0.07); },
    sfxCombo() { this.play(700, 'triangle', 0.08); setTimeout(() => this.play(900, 'triangle', 0.08), 60); setTimeout(() => this.play(1100, 'triangle', 0.1), 120); },
    sfxMilestone() { this.play(523, 'sine', 0.1); setTimeout(() => this.play(659, 'sine', 0.1), 100); setTimeout(() => this.play(784, 'sine', 0.1), 200); setTimeout(() => this.play(1047, 'sine', 0.15), 300); },
    sfxDrop() { this.play(350, 'sawtooth', 0.04, 0.05); },
    sfxTick() { this.play(1200, 'sine', 0.03, 0.03); },
  };

  const categoryNames = { recyclable: '可回收物', hazardous: '有害垃圾', kitchen: '厨余垃圾', other: '其他垃圾' };
  const categoryColors = { recyclable: '#2b6ef0', hazardous: '#d9363e', kitchen: '#389e0d', other: '#595959' };

  // ==================== 垃圾数据库（85题） ====================
  const garbageDB = [
    // 可回收物 (22题)
    { name: '废纸', emoji: '📄', category: 'recyclable', tip: '回收1吨废纸可造好纸850公斤，节省木材300公斤' },
    { name: '塑料瓶', emoji: '🫙', category: 'recyclable', tip: '回收后可制成聚酯纤维，用来做衣服' },
    { name: '玻璃瓶', emoji: '🍾', category: 'recyclable', tip: '玻璃可100%无限次回收，且不损失品质' },
    { name: '易拉罐', emoji: '🥫', category: 'recyclable', tip: '铝罐回收再造可节省95%的能源' },
    { name: '旧衣物', emoji: '👕', category: 'recyclable', tip: '可捐赠或回收制成工业抹布、保温材料' },
    { name: '废铁钉', emoji: '📌', category: 'recyclable', tip: '金属回收大幅减少采矿对环境的破坏' },
    { name: '纸箱', emoji: '📦', category: 'recyclable', tip: '快递纸箱应拆开压扁后投入可回收桶' },
    { name: '牛奶盒', emoji: '🥛', category: 'recyclable', tip: '需冲洗干净、剪开晾干后再回收' },
    { name: '旧书本', emoji: '📚', category: 'recyclable', tip: '可循环再造再生纸或捐赠给图书馆' },
    { name: '塑料玩具', emoji: '🧸', category: 'recyclable', tip: '破损后可作塑料原料回收' },
    { name: '泡沫箱', emoji: '📦', category: 'recyclable', tip: '属于可回收物，但需清理干净' },
    { name: '废铜线', emoji: '🔌', category: 'recyclable', tip: '铜是优良导体，回收利用价值高' },
    { name: '旧报纸', emoji: '📰', category: 'recyclable', tip: '报纸可回收制成再生纸，每吨省17棵树' },
    { name: '旧手机', emoji: '📱', category: 'recyclable', tip: '含贵金属和稀有元素，有极高回收价值' },
    { name: '旧锅', emoji: '🍳', category: 'recyclable', tip: '金属制品，属于可回收物' },
    { name: '碎玻璃', emoji: '🪟', category: 'recyclable', tip: '碎玻璃可回收，但应用纸包好防止伤人' },
    { name: '易拉罐拉环', emoji: '🔘', category: 'recyclable', tip: '铝制品，属于可回收金属' },
    { name: '旧书包', emoji: '🎒', category: 'recyclable', tip: '织物类可回收物' },
    { name: '不锈钢餐具', emoji: '🍴', category: 'recyclable', tip: '金属制品，可回收再利用' },
    { name: '旧雨伞', emoji: '☂️', category: 'recyclable', tip: '金属骨架可回收，伞面需拆开' },
    { name: 'LED灯泡', emoji: '💡', category: 'recyclable', tip: 'LED灯不含汞，属于可回收电子废弃物' },
    { name: '旧轮胎', emoji: '🛞', category: 'recyclable', tip: '橡胶制品可回收制成再生胶或运动场地垫' },
    { name: '废铝箔', emoji: '🍱', category: 'recyclable', tip: '铝箔（如蛋挞托）冲洗干净后可回收' },
    { name: '旧电脑', emoji: '💻', category: 'recyclable', tip: '电子废弃物含贵金属，需专业回收拆解' },
    { name: '塑料梳子', emoji: '🪮', category: 'recyclable', tip: '硬质塑料制品，属于可回收物' },

    // 有害垃圾 (20题)
    { name: '废电池', emoji: '🔋', category: 'hazardous', tip: '一颗纽扣电池可污染60万升水' },
    { name: '废灯管', emoji: '💡', category: 'hazardous', tip: '荧光灯管含汞，1支可污染180吨地下水' },
    { name: '过期药品', emoji: '💊', category: 'hazardous', tip: '不可随意丢弃，可能污染水源和土壤' },
    { name: '废油漆', emoji: '🎨', category: 'hazardous', tip: '含有机溶剂和重金属，属危险废物' },
    { name: '水银温度计', emoji: '🌡️', category: 'hazardous', tip: '水银（汞）有剧毒，破碎后需密封收集' },
    { name: '农药瓶', emoji: '🧪', category: 'hazardous', tip: '农药残留物对土壤和水体危害极大' },
    { name: '废相片纸', emoji: '🖼️', category: 'hazardous', tip: '相片纸含银盐等化学物质' },
    { name: '指甲油', emoji: '💅', category: 'hazardous', tip: '含有机溶剂，属于有害垃圾' },
    { name: '杀虫剂罐', emoji: '🪳', category: 'hazardous', tip: '残留气体和液体对人体和环境有害' },
    { name: '废墨盒', emoji: '🖨️', category: 'hazardous', tip: '含重金属和有机污染物' },
    { name: '废血压计', emoji: '🩺', category: 'hazardous', tip: '含水银，需专门回收处理' },
    { name: '充电宝', emoji: '🔌', category: 'hazardous', tip: '含锂电池，属于有害垃圾，需专门回收' },
    { name: '节能灯泡', emoji: '💡', category: 'hazardous', tip: '含汞蒸气，破碎后需通风并专门收集' },
    { name: '过期化妆品', emoji: '💄', category: 'hazardous', tip: '含化学成分和防腐剂，不可倒入下水道' },
    { name: '废机油', emoji: '🛢️', category: 'hazardous', tip: '污染性极强，1升可污染100万升水' },
    { name: '84消毒液瓶', emoji: '🧴', category: 'hazardous', tip: '残留化学消毒剂，属有害垃圾' },
    { name: '废蓄电池', emoji: '🔌', category: 'hazardous', tip: '含铅和硫酸，污染性极强，需专门回收' },
    { name: '荧光棒', emoji: '🪄', category: 'hazardous', tip: '含化学发光剂和荧光染料，属有害垃圾' },
    { name: '废油桶', emoji: '🛢️', category: 'hazardous', tip: '残留矿物油等有害物质，需专门处理' },
    { name: '废农药', emoji: '☠️', category: 'hazardous', tip: '剧毒有机磷化合物，绝不可随意丢弃' },

    // 厨余垃圾 (22题)
    { name: '苹果核', emoji: '🍎', category: 'kitchen', tip: '经堆肥处理可变成有机肥料' },
    { name: '剩饭', emoji: '🍚', category: 'kitchen', tip: '我国每年餐饮浪费约1700万吨粮食' },
    { name: '鱼骨头', emoji: '🐟', category: 'kitchen', tip: '含大量水分，适合生物降解处理' },
    { name: '菜叶', emoji: '🥬', category: 'kitchen', tip: '易腐烂，堆肥后是很好的有机肥' },
    { name: '蛋壳', emoji: '🥚', category: 'kitchen', tip: '含碳酸钙，粉碎后可改良土壤' },
    { name: '果皮', emoji: '🍌', category: 'kitchen', tip: '果皮可用于制作环保酵素' },
    { name: '茶叶渣', emoji: '🍵', category: 'kitchen', tip: '可作除臭剂或肥料，属于厨余垃圾' },
    { name: '花生壳', emoji: '🥜', category: 'kitchen', tip: '可自然降解，属厨余垃圾' },
    { name: '过期食品', emoji: '🍞', category: 'kitchen', tip: '可生物降解的食品属厨余垃圾' },
    { name: '玉米棒', emoji: '🌽', category: 'kitchen', tip: '可堆肥处理，也可作工业原料' },
    { name: '西瓜皮', emoji: '🍉', category: 'kitchen', tip: '含水量高，易腐烂，适合堆肥' },
    { name: '鸡骨头', emoji: '🍗', category: 'kitchen', tip: '小型动物骨骼易降解，属厨余垃圾' },
    { name: '中药渣', emoji: '🫖', category: 'kitchen', tip: '植物性残渣，可自然降解' },
    { name: '咖啡渣', emoji: '☕', category: 'kitchen', tip: '有机物质，可作肥料或除味剂' },
    { name: '过期奶粉', emoji: '🍼', category: 'kitchen', tip: '食品类有机物，属厨余垃圾' },
    { name: '过期番茄酱', emoji: '🥫', category: 'kitchen', tip: '食品有机物，可生物降解' },
    { name: '烂蔬菜', emoji: '🥕', category: 'kitchen', tip: '有机质含量高，适合堆肥处理' },
    { name: '剩菜剩饭', emoji: '🍛', category: 'kitchen', tip: '餐厨有机废弃物，生物降解处理' },
    { name: '虾壳蟹壳', emoji: '🦐', category: 'kitchen', tip: '甲壳类残渣，有机质丰富可降解' },
    { name: '烂水果', emoji: '🍑', category: 'kitchen', tip: '腐烂水果有机质含量高，适合堆肥处理' },
    { name: '甘蔗渣', emoji: '🎋', category: 'kitchen', tip: '植物纤维残渣，可自然降解' },
    { name: '瓜子壳', emoji: '🌻', category: 'kitchen', tip: '属于厨余垃圾，轻薄易腐化' },

    // 其他垃圾 (33题)
    { name: '烟蒂', emoji: '🚬', category: 'other', tip: '过滤嘴含塑料纤维，不可生物降解' },
    { name: '陶瓷碎片', emoji: '🏺', category: 'other', tip: '不属于可回收玻璃类，归入其他垃圾' },
    { name: '卫生纸', emoji: '🧻', category: 'other', tip: '遇水即溶，有污染无法回收' },
    { name: '一次性餐具', emoji: '🥢', category: 'other', tip: '被污染无法回收，属其他垃圾' },
    { name: '宠物粪便', emoji: '💩', category: 'other', tip: '用纸包好后投入其他垃圾桶' },
    { name: '灰土', emoji: '🪨', category: 'other', tip: '装修垃圾中的灰土渣土属其他垃圾' },
    { name: '口香糖', emoji: '🫧', category: 'other', tip: '含胶基不可降解，属其他垃圾' },
    { name: '创可贴', emoji: '🩹', category: 'other', tip: '日常用创可贴属其他垃圾' },
    { name: '脏塑料袋', emoji: '🛍️', category: 'other', tip: '被污染的塑料袋不可回收' },
    { name: '毛发', emoji: '💇', category: 'other', tip: '头发和动物毛发属于其他垃圾' },
    { name: '湿纸巾', emoji: '🤧', category: 'other', tip: '无论用过与否都属于其他垃圾' },
    { name: '一次性口罩', emoji: '😷', category: 'other', tip: '使用过的口罩属其他垃圾' },
    { name: '陶瓷碗碎片', emoji: '🍽️', category: 'other', tip: '陶瓷不是玻璃，不可回收' },
    { name: '大骨头', emoji: '🦴', category: 'other', tip: '大型动物骨骼质地坚硬难降解，属其他垃圾' },
    { name: '椰子壳', emoji: '🥥', category: 'other', tip: '质地坚硬不易腐烂，不属于厨余' },
    { name: '榴莲壳', emoji: '🫒', category: 'other', tip: '外壳坚硬，难生物降解，属其他垃圾' },
    { name: '核桃壳', emoji: '🥜', category: 'other', tip: '硬壳不易腐化，归入其他垃圾' },
    { name: '粽叶', emoji: '🍃', category: 'other', tip: '纤维韧性高难降解，跟玉米皮一样属其他垃圾' },
    { name: '猪大骨', emoji: '🦴', category: 'other', tip: '大型牲畜骨骼不易降解，属其他垃圾' },
    { name: '猫砂', emoji: '🐱', category: 'other', tip: '含宠物排泄物，属其他垃圾' },
    { name: '干燥剂', emoji: '🧂', category: 'other', tip: '化学干燥剂无法回收，属其他垃圾' },
    { name: '光盘', emoji: '💿', category: 'other', tip: 'CD/DVD不是普通塑料，不可回收' },
    { name: '无汞电池', emoji: '🔋', category: 'other', tip: '标注"无汞"的干电池已达低汞标准，可作其他垃圾处理' },
    { name: '煤渣', emoji: '🪨', category: 'other', tip: '燃煤残渣，属其他垃圾' },
    { name: '旧地毯', emoji: '🏠', category: 'other', tip: '复合材料不易分离回收，属其他垃圾' },
    { name: '蜡笔', emoji: '🖍️', category: 'other', tip: '含石蜡和颜料，不可回收' },
    { name: '胶带', emoji: '📎', category: 'other', tip: '黏胶污染无法回收，属其他垃圾' },
    { name: '便利贴', emoji: '📋', category: 'other', tip: '含黏胶无法回收，属其他垃圾' },
    { name: '尿不湿', emoji: '👶', category: 'other', tip: '含吸水材料和排泄物，属其他垃圾' },
    { name: '用过的纸杯', emoji: '🥤', category: 'other', tip: '内壁有塑料膜且被污染，不可回收' },
    { name: '橡皮泥', emoji: '🫠', category: 'other', tip: '含色素和胶质，不可回收降解' },
    { name: '贴纸', emoji: '🏷️', category: 'other', tip: '背胶污染无法回收，属其他垃圾' },
    { name: '竹签', emoji: '🍢', category: 'other', tip: '烧烤竹签被油污污染，不可回收' },
  ];

  // ==================== 成就定义 ====================
  const achievementsDef = [
    { id: 'first_game', icon: '🎮', name: '初次挑战', desc: '完成第一局游戏' },
    { id: 'ten_correct', icon: '⭐', name: '十题正确', desc: '单局正确10题' },
    { id: 'thirty_correct', icon: '🌟', name: '学富五车', desc: '单局正确30题' },
    { id: 'combo_5', icon: '🔥', name: '五连击', desc: '连续正确5题' },
    { id: 'combo_10', icon: '💥', name: '十连击', desc: '连续正确10题' },
    { id: 'combo_20', icon: '👑', name: '二十连击', desc: '连续正确20题' },
    { id: 'accuracy_80', icon: '🎯', name: '准确射手', desc: '单局正确率≥80%' },
    { id: 'accuracy_100', icon: '💎', name: '完美分类', desc: '单局正确率100%（至少10题）' },
    { id: 'total_100', icon: '💯', name: '百题斩', desc: '累计分类100题' },
    { id: 'total_500', icon: '🏅', name: '分类达人', desc: '累计分类500题' },
    { id: 'speed_demon', icon: '⚡', name: '闪电手', desc: '平均反应时间<2秒（≥10题）' },
    { id: 'all_cats', icon: '🌈', name: '全面掌握', desc: '单局四类垃圾都至少答对3题' },
    { id: 'encyclopedia', icon: '📚', name: '博学多识', desc: '浏览知识图鉴' },
  ];

  // ==================== DOM ====================
  const $ = s => document.querySelector(s);
  const dom = {};

  function initDom() {
    ['startPage','gamePage','resultPage','btnStart','highScoreDisplay','rulesList','modeCards',
     'timer','score','combo','correctCount','livesStat','livesDisplay','garbageCard','garbageEmoji',
     'garbageName','garbageHint','binBodies','knowledgePopup','popupBar','popupEmoji','popupText',
     'popupTip','floatTextContainer','milestonePopup','particlesContainer','touchClone','btnPause',
     'btnRestartGame','btnQuit','pauseOverlay','btnResume','btnPauseRestart','btnPauseQuit',
     'resultScore','resultCorrect','resultWrong','resultAccuracy','resultMaxCombo','resultEmoji',
     'resultTitle','resultSubtitle','resultFeedbackText','reviewList','btnRestart','btnBackHome',
     'encyclopediaOverlay','encyContent','encyTabs','btnCloseEncy','btnEncyclopedia',
     'achievementsOverlay','achGrid','achTotal','btnCloseAch','btnAchievements',
     'leaderboardOverlay','lbList','btnCloseLb','btnClearLb','btnLeaderboard',
     'btnResetAll',
     'tutorialOverlay','btnTutSkip','categoryAnalysis','analysisBars','weaknessTip',
     'newAchievements','newAchList'].forEach(k => {
      const el = $('#' + k) || (k === 'modeCards' ? document.querySelectorAll('.mode-card') : null) ||
                 (k === 'binBodies' ? document.querySelectorAll('.bin-body') : null);
      if (el) dom[k] = el;
    });
  }

  // ==================== 状态 ====================
  const state = {
    mode: 'classic', score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, total: 0,
    timeLeft: 90, totalTime: 90, lives: 5, maxLives: 5, timerInterval: null, isPlaying: false,
    currentItem: null, usedItems: [], knowledgeLog: [], lastAnswerTime: 0,
    fastBonusThreshold: 2000, paused: false,
    // 分类统计
    catStats: { recyclable: { c: 0, t: 0 }, hazardous: { c: 0, t: 0 }, kitchen: { c: 0, t: 0 }, other: { c: 0, t: 0 } },
    reactionTimes: [],
    newAchievements: [],
  };

  // 累计统计（localStorage 持久化）
  function getCumulative() {
    try { return JSON.parse(localStorage.getItem('garbage_cumulative') || '{"total":0,"unlocked":[]}'); } catch (e) { return { total: 0, unlocked: [] }; }
  }
  function saveCumulative(c) {
    try { localStorage.setItem('garbage_cumulative', JSON.stringify(c)); } catch (e) {}
  }

  const modeConfig = {
    classic: { name: '经典模式', hasTimer: true, totalTime: 90, hasLives: false, desc: '90秒限时挑战', rules: ['将垃圾<span class="highlight">拖拽</span>到对应桶 或 <strong>点击</strong>垃圾桶','也可以按键盘 <strong>1 2 3 4</strong> 快速分类','正确分类 <strong>+10分</strong>，快速回答额外加分','连续正确可获<span class="combo">连击加分</span>','限时 <strong>90秒</strong>，挑战你的分类速度'] },
    endless: { name: '无尽模式', hasTimer: false, totalTime: 0, hasLives: true, maxLives: 5, desc: '5条命，拼最高分', rules: ['将垃圾<span class="highlight">拖拽</span>到对应桶 或 <strong>点击</strong>垃圾桶','也可以按键盘 <strong>1 2 3 4</strong> 快速分类','正确分类 <strong>+10分</strong>，+1连击','错误分类 <strong>-1条命</strong>，5条命耗尽则结束','无时间限制，<strong>你能走多远？</strong>'] },
    learn: { name: '学习模式', hasTimer: false, totalTime: 0, hasLives: false, desc: '无压力慢慢学', rules: ['将垃圾<span class="highlight">拖拽</span>到对应桶 或 <strong>点击</strong>垃圾桶','也可以按键盘 <strong>1 2 3 4</strong> 快速分类','无计时、无惩罚，<strong>轻松学习</strong>','每次分类后弹出<span class="highlight">科普知识</span>','答完<span class="combo">全部100题</span>即可通关'] },
  };

  function showPage(page) { [dom.startPage, dom.gamePage, dom.resultPage].forEach(p => p.classList.remove('active')); page.classList.add('active'); }
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function showFloatText(x, y, text, color) {
    const el = document.createElement('div'); el.className = 'float-text'; el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.color = color;
    dom.floatTextContainer.appendChild(el); setTimeout(() => el.remove(), 1000);
  }

  function showMilestone(text) {
    dom.milestonePopup.textContent = text; dom.milestonePopup.classList.remove('show', 'hide');
    void dom.milestonePopup.offsetWidth; dom.milestonePopup.classList.add('show');
    AudioEngine.sfxMilestone(); setTimeout(() => dom.milestonePopup.classList.add('hide'), 1500);
  }

  function spawnParticles(x, y, count = 10) {
    const e = ['⭐', '✨', '💚', '🌟', '♻️', '🌱'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span'); p.className = 'particle'; p.textContent = e[i % e.length];
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--x', (Math.random() - 0.5) * 140 + 'px');
      p.style.setProperty('--y', (Math.random() - 0.5) * 140 + 'px');
      dom.particlesContainer.appendChild(p); setTimeout(() => p.remove(), 700);
    }
  }

  let popupTimer = null;
  function showKnowledge(emoji, text, tip, isCorrect) {
    if (popupTimer) clearTimeout(popupTimer);
    dom.popupBar.className = 'popup-bar ' + (isCorrect ? 'correct' : 'wrong');
    dom.popupEmoji.textContent = emoji; dom.popupText.textContent = text; dom.popupTip.textContent = tip;
    dom.knowledgePopup.classList.add('show');
    popupTimer = setTimeout(() => dom.knowledgePopup.classList.remove('show'), 2500);
  }

  function checkAchievements() {
    const cum = getCumulative();
    const newlyUnlocked = [];
    const unlocked = cum.unlocked || [];
    const addAch = (id) => {
      if (!unlocked.includes(id)) { unlocked.push(id); newlyUnlocked.push(id); }
    };

    if (state.total > 0) addAch('first_game');
    if (state.correct >= 10) addAch('ten_correct');
    if (state.correct >= 30) addAch('thirty_correct');
    if (state.maxCombo >= 5) addAch('combo_5');
    if (state.maxCombo >= 10) addAch('combo_10');
    if (state.maxCombo >= 20) addAch('combo_20');
    if (state.total >= 10 && state.correct / state.total >= 0.8) addAch('accuracy_80');
    if (state.total >= 10 && state.correct === state.total) addAch('accuracy_100');

    const avgRT = state.reactionTimes.length > 0 ? state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length : 9999;
    if (state.reactionTimes.length >= 10 && avgRT < 2000) addAch('speed_demon');

    const cats = state.catStats;
    if (cats.recyclable.c >= 3 && cats.hazardous.c >= 3 && cats.kitchen.c >= 3 && cats.other.c >= 3) addAch('all_cats');

    const newTotal = cum.total + state.total;
    if (cum.total < 100 && newTotal >= 100) addAch('total_100');
    if (cum.total < 500 && newTotal >= 500) addAch('total_500');

    cum.total = newTotal;
    cum.unlocked = unlocked;
    saveCumulative(cum);
    state.newAchievements = newlyUnlocked;
  }

  function updateStats() {
    const cfg = modeConfig[state.mode];
    if (cfg.hasTimer) { dom.timer.textContent = state.timeLeft; if (state.timeLeft <= 10) dom.timer.classList.add('warning'); else dom.timer.classList.remove('warning'); }
    else { dom.timer.textContent = '∞'; dom.timer.classList.remove('warning'); }
    dom.score.textContent = state.score;
    dom.combo.textContent = state.combo;
    if (state.combo >= 5) dom.combo.classList.add('fire'); else dom.combo.classList.remove('fire');
    dom.correctCount.textContent = state.correct + '/' + state.total;
    if (cfg.hasLives) { dom.livesStat.style.display = 'flex'; dom.livesDisplay.textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, cfg.maxLives - state.lives)); }
    else dom.livesStat.style.display = 'none';
  }

  function nextItem() {
    if (state.usedItems.length >= garbageDB.length) state.usedItems = [];
    const available = garbageDB.filter(item => !state.usedItems.includes(item));
    if (available.length === 0) { state.usedItems = []; return nextItem(); }
    const item = available[Math.floor(Math.random() * available.length)];
    state.currentItem = item; state.usedItems.push(item);
    dom.garbageEmoji.textContent = item.emoji; dom.garbageName.textContent = item.name;
    dom.garbageCard.classList.remove('dragging'); dom.garbageCard.style.opacity = '1'; dom.garbageCard.style.transform = '';
    dom.garbageCard.style.animation = 'none'; void dom.garbageCard.offsetWidth;
    dom.garbageCard.style.animation = 'cardIn 0.35s cubic-bezier(0.22,0.61,0.36,1)';
    state.lastAnswerTime = Date.now();
  }

  function handleDrop(category, dropX, dropY) {
    if (!state.isPlaying || !state.currentItem || state.paused) return;
    const item = state.currentItem, isCorrect = item.category === category;
    const cfg = modeConfig[state.mode], now = Date.now();
    const reactionTime = now - state.lastAnswerTime;
    state.reactionTimes.push(reactionTime);
    state.total++;

    // 分类统计
    if (state.catStats[item.category]) state.catStats[item.category].t++;
    if (isCorrect && state.catStats[item.category]) state.catStats[item.category].c++;

    if (isCorrect) {
      state.combo++; if (state.combo > state.maxCombo) state.maxCombo = state.combo; state.correct++;
      if (state.mode !== 'learn') {
        let pts = 10;
        if (state.combo >= 20) pts += 6; else if (state.combo >= 10) pts += 4; else if (state.combo >= 5) pts += 2; else if (state.combo >= 3) pts += 1;
        if (reactionTime < state.fastBonusThreshold) pts += 2;
        state.score += pts; showFloatText(dropX, dropY - 20, '+' + pts, '#4caf50');
      }
      AudioEngine.sfxCorrect(); spawnParticles(dropX, dropY, 8);
      if (state.combo === 5) showMilestone('🔥 五连击！'); else if (state.combo === 10) showMilestone('⚡ 十连击！');
      else if (state.combo === 15) showMilestone('💥 十五连击！'); else if (state.combo === 20) showMilestone('👑 二十连击！');
      else if (state.combo >= 5 && state.combo % 5 === 0) AudioEngine.sfxCombo();
      showKnowledge(item.emoji, item.name + ' → ' + categoryNames[item.category], item.tip, true);
    } else {
      state.combo = 0; state.wrong++;
      if (state.mode !== 'learn') { state.score = Math.max(0, state.score - 5); showFloatText(dropX, dropY - 20, '-5', '#d9363e'); }
      AudioEngine.sfxWrong();
      showKnowledge(item.emoji, '错误！' + item.name + ' → ' + categoryNames[item.category], item.tip, false);
      if (cfg.hasLives) { state.lives--; if (state.lives <= 0) { endGame(); return; } }
    }
    state.knowledgeLog.push({ name: item.name, emoji: item.emoji, category: item.category, tip: item.tip });
    updateStats(); nextItem();
  }

  function startTimer() {
    state.timeLeft = state.totalTime; updateStats();
    if (state.totalTime > 0) state.timerInterval = setInterval(() => { state.timeLeft--; updateStats(); if (state.timeLeft <= 5) AudioEngine.sfxTick(); if (state.timeLeft <= 0) endGame(); }, 1000);
  }
  function stopTimer() { if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; } }

  // 暂停
  function pauseGame() { if (!state.isPlaying || state.paused) return; state.paused = true; stopTimer(); dom.pauseOverlay.classList.add('show'); dom.btnPause.textContent = '▶'; }
  function resumeGame() { if (!state.isPlaying || !state.paused) return; state.paused = false; dom.pauseOverlay.classList.remove('show'); dom.btnPause.textContent = '⏸'; if (modeConfig[state.mode].hasTimer) startTimer(); }
  function restartGame() { dom.pauseOverlay.classList.remove('show'); dom.btnPause.textContent = '⏸'; stopTimer(); startGame(); }
  function quitToHome() { dom.pauseOverlay.classList.remove('show'); dom.btnPause.textContent = '⏸'; stopTimer(); state.isPlaying = false; state.paused = false; showPage(dom.startPage); displayHighScore(); }

  function startGame() {
    const cfg = modeConfig[state.mode];
    state.score = 0; state.combo = 0; state.maxCombo = 0; state.correct = 0; state.wrong = 0; state.total = 0;
    state.usedItems = []; state.knowledgeLog = []; state.newAchievements = []; state.reactionTimes = [];
    state.catStats = { recyclable: { c: 0, t: 0 }, hazardous: { c: 0, t: 0 }, kitchen: { c: 0, t: 0 }, other: { c: 0, t: 0 } };
    state.isPlaying = true; state.paused = false;
    dom.pauseOverlay.classList.remove('show'); dom.btnPause.textContent = '⏸';
    if (cfg.hasTimer) { state.totalTime = cfg.totalTime; state.timeLeft = cfg.totalTime; } else { state.totalTime = 0; state.timeLeft = 0; }
    if (cfg.hasLives) state.lives = cfg.maxLives; else state.lives = 0;
    showPage(dom.gamePage); updateStats(); nextItem(); startTimer(); AudioEngine.init();
    dom.garbageHint.textContent = state.mode === 'learn' ? '点击垃圾桶 或 拖拽垃圾卡到对应位置' : '拖拽垃圾卡 或 点击垃圾桶 或 按键盘 1-4';
  }

  function endGame() {
    state.isPlaying = false; stopTimer();
    checkAchievements();
    showPage(dom.resultPage);

    const accuracy = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
    dom.resultScore.textContent = state.score; dom.resultCorrect.textContent = state.correct;
    dom.resultWrong.textContent = state.wrong; dom.resultAccuracy.textContent = accuracy + '%';
    dom.resultMaxCombo.textContent = state.maxCombo;

    let emoji = '📖', title = '再接再厉！', subtitle = '', feedback = '别灰心，看看下方的知识回顾会有帮助！';
    if (state.mode === 'learn') { emoji = '📖'; title = '学习完成！'; subtitle = '浏览了 ' + state.total + ' 道垃圾分类题目'; feedback = '知识的种子已经播下！'; }
    else if (accuracy >= 90 && state.correct >= 15) { emoji = '🏆'; title = '分类大师！'; subtitle = '满分表现！'; feedback = '对垃圾分类了如指掌，真正的环保达人！'; }
    else if (accuracy >= 70) { emoji = '👏'; title = '分类能手！'; subtitle = '表现优秀'; feedback = '基础扎实，再学几个易混淆的分类就完美了！'; }
    else if (accuracy >= 50) { emoji = '💪'; title = '继续加油！'; subtitle = '还有进步空间'; feedback = '有一定基础，多练习几次就能熟练掌握。'; }
    dom.resultEmoji.textContent = emoji; dom.resultTitle.textContent = title;
    dom.resultSubtitle.textContent = subtitle; dom.resultFeedbackText.textContent = feedback;

    // 分类分析
    renderCategoryAnalysis();

    // 新成就
    if (state.newAchievements.length > 0) {
      dom.newAchievements.style.display = 'block';
      dom.newAchList.innerHTML = state.newAchievements.map(id => {
        const ach = achievementsDef.find(a => a.id === id);
        return ach ? `<span class="new-ach-item">${ach.icon} ${ach.name}</span>` : '';
      }).join('');
    } else {
      dom.newAchievements.style.display = 'none';
    }

    // 知识回顾
    const seen = new Set(); const uniqueLog = [];
    for (const item of state.knowledgeLog) { if (!seen.has(item.name)) { seen.add(item.name); uniqueLog.push(item); } }
    dom.reviewList.innerHTML = uniqueLog.map(item =>
      `<div class="review-item"><span class="review-emoji">${item.emoji}</span><div><strong>${item.name}</strong><span class="review-category" style="background:${categoryColors[item.category]}">${categoryNames[item.category]}</span><p style="font-size:10px;color:#999;margin-top:1px;">${item.tip}</p></div></div>`
    ).join('') || '<p style="color:#999;text-align:center;">暂无记录</p>';

    if (state.mode !== 'learn') saveHighScore(state.score);
    addScoreToLeaderboard(state.mode, state.score);
    updateAllTimeStats();
  }

  function renderCategoryAnalysis() {
    const cats = ['recyclable', 'hazardous', 'kitchen', 'other'];
    const colors = { recyclable: '#2b6ef0', hazardous: '#d9363e', kitchen: '#389e0d', other: '#595959' };
    const labels = { recyclable: '可回收物', hazardous: '有害垃圾', kitchen: '厨余垃圾', other: '其他垃圾' };

    let minAcc = 100, weakest = '';
    dom.analysisBars.innerHTML = cats.map(cat => {
      const s = state.catStats[cat];
      const acc = s.t > 0 ? Math.round((s.c / s.t) * 100) : 0;
      if (s.t > 0 && acc < minAcc) { minAcc = acc; weakest = labels[cat]; }
      return `<div class="analysis-bar-row">
        <span class="analysis-bar-label">${labels[cat]}</span>
        <div class="analysis-bar-bg">
          <div class="analysis-bar-fill" style="width:${Math.max(4, acc)}%;background:${colors[cat]}">
            <span>${s.c}/${s.t} ${acc}%</span>
          </div>
        </div>
      </div>`;
    }).join('');

    if (weakest && minAcc < 100 && state.total >= 4) {
      dom.weaknessTip.textContent = '💡 提示：你在「' + weakest + '」方面掌握较弱，可查看知识图鉴加强学习';
    } else if (state.total < 4) {
      dom.weaknessTip.textContent = '';
    } else {
      dom.weaknessTip.textContent = '🎉 四类垃圾分类均表现优异！';
    }
  }

  function updateAllTimeStats() {
    try {
      const cum = getCumulative();
      const allTime = JSON.parse(localStorage.getItem('garbage_alltime') || '{"total":0,"correct":0}');
      allTime.total += state.total;
      allTime.correct += state.correct;
      localStorage.setItem('garbage_alltime', JSON.stringify(allTime));
    } catch (e) {}
  }

  function saveHighScore(score) {
    const key = 'garbage_sort_v3_' + state.mode;
    try { const prev = parseInt(localStorage.getItem(key) || '0', 10); if (score > prev) localStorage.setItem(key, String(score)); } catch (e) {}
    displayHighScore();
  }
  function getHighScore() { try { return parseInt(localStorage.getItem('garbage_sort_v3_' + state.mode) || '0', 10); } catch (e) { return 0; } }
  function displayHighScore() {
    const hs = getHighScore();
    dom.highScoreDisplay.textContent = hs > 0 ? '🏅 ' + modeConfig[state.mode].name + '最高分：' + hs : '';
  }

  // ==================== 知识图鉴 ====================
  function showEncyclopedia() {
    dom.encyclopediaOverlay.classList.add('show');
    switchEncyTab('recyclable');

    // 解锁成就
    const cum = getCumulative();
    if (!cum.unlocked.includes('encyclopedia')) {
      cum.unlocked.push('encyclopedia');
      saveCumulative(cum);
    }
  }
  function hideEncyclopedia() { dom.encyclopediaOverlay.classList.remove('show'); }

  function switchEncyTab(cat) {
    const items = garbageDB.filter(i => i.category === cat);
    dom.encyContent.innerHTML = items.map(i =>
      `<div class="ency-item">
        <span class="ency-item-emoji">${i.emoji}</span>
        <div class="ency-item-info">
          <div class="ency-item-name">${i.name}</div>
          <div class="ency-item-tip">${i.tip}</div>
        </div>
      </div>`
    ).join('');

    document.querySelectorAll('.ency-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === cat);
    });
  }

  // ==================== 成就面板 ====================
  function showAchievements() {
    dom.achievementsOverlay.classList.add('show');
    const cum = getCumulative();
    const unlocked = cum.unlocked || [];
    const allTime = JSON.parse(localStorage.getItem('garbage_alltime') || '{"total":0,"correct":0}');

    dom.achGrid.innerHTML = achievementsDef.map(a => {
      const isUnlocked = unlocked.includes(a.id);
      return `<div class="ach-badge ${isUnlocked ? 'unlocked' : 'locked'}">
        <span class="ach-badge-icon">${isUnlocked ? a.icon : '🔒'}</span>
        <div class="ach-badge-name">${a.name}</div>
        <div class="ach-badge-desc">${a.desc}</div>
      </div>`;
    }).join('');

    dom.achTotal.textContent = `已解锁 ${unlocked.length}/${achievementsDef.length} 项成就 · 累计分类 ${cum.total} 题 · 正确 ${allTime.correct} 题`;
  }
  function hideAchievements() { dom.achievementsOverlay.classList.remove('show'); }

  // ==================== 排行榜 ====================
  function getLeaderboard(mode) {
    try { return JSON.parse(localStorage.getItem('garbage_lb_' + mode) || '[]'); } catch (e) { return []; }
  }
  function saveLeaderboard(mode, data) {
    try { localStorage.setItem('garbage_lb_' + mode, JSON.stringify(data.slice(0, 10))); } catch (e) {}
  }
  function addScoreToLeaderboard(mode, score) {
    if (mode === 'learn' || score <= 0) return;
    const lb = getLeaderboard(mode);
    // 只有进入前10才弹窗
    if (lb.length >= 10 && score <= lb[lb.length - 1].score) return;
    const name = prompt('🏅 你的成绩进入排行榜！\n请输入你的名字（留空则匿名）：') || '匿名玩家';
    lb.push({ name: name.substring(0, 10), score, date: new Date().toLocaleDateString() });
    lb.sort((a, b) => b.score - a.score);
    saveLeaderboard(mode, lb);
  }
  function showLeaderboard() {
    dom.leaderboardOverlay.classList.add('show');
    switchLbTab('classic');
  }
  function hideLeaderboard() { dom.leaderboardOverlay.classList.remove('show'); }
  function switchLbTab(mode) {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    renderLbList(mode);
  }
  function renderLbList(mode) {
    const lb = getLeaderboard(mode);
    const icons = ['🥇', '🥈', '🥉'];
    dom.lbList.innerHTML = lb.length === 0
      ? '<div class="lb-empty">暂无记录，快去挑战吧！</div>'
      : lb.map((entry, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
        const rankText = i < 3 ? icons[i] : (i + 1);
        return `<div class="lb-row" data-index="${i}">
          <span class="lb-rank ${rankClass}">${rankText}</span>
          <span class="lb-name">${entry.name}</span>
          <span class="lb-score">${entry.score}</span>
          <span class="lb-date">${entry.date}</span>
          <button class="lb-del" data-index="${i}" title="删除此记录">✕</button>
        </div>`;
      }).join('');

    // 绑定删除事件
    dom.lbList.querySelectorAll('.lb-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        if (confirm('确定删除这条记录？')) {
          deleteLbEntry(mode, idx);
        }
      });
    });
  }
  function deleteLbEntry(mode, index) {
    const lb = getLeaderboard(mode);
    lb.splice(index, 1);
    saveLeaderboard(mode, lb);
    renderLbList(mode);
  }
  function clearLeaderboard() {
    if (confirm('确定清空排行榜？此操作不可恢复！')) {
      try { localStorage.removeItem('garbage_lb_classic'); localStorage.removeItem('garbage_lb_endless'); } catch (e) {}
      const activeMode = document.querySelector('.lb-tab.active').dataset.mode;
      renderLbList(activeMode || 'classic');
    }
  }

  function resetAllData() {
    if (confirm('确定要重置所有数据吗？\n\n将清除：最高分、成就进度、排行榜、游戏次数、新手引导标记\n\n此操作不可恢复！')) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('garbage_')) keys.push(key);
        }
        keys.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
      alert('已重置，刷新页面后生效。');
      location.reload();
    }
  }

  // ==================== 新手引导 ====================
  function showTutorial() {
    try {
      if (localStorage.getItem('garbage_tutorial_done')) return;
    } catch (e) { return; }
    dom.tutorialOverlay.classList.add('show');
  }
  function hideTutorial() {
    dom.tutorialOverlay.classList.remove('show');
    try { localStorage.setItem('garbage_tutorial_done', '1'); } catch (e) {}
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    dom.btnStart.addEventListener('click', startGame);
    dom.btnRestart.addEventListener('click', startGame);
    dom.btnBackHome.addEventListener('click', () => { stopTimer(); state.isPlaying = false; state.paused = false; showPage(dom.startPage); displayHighScore(); });
    dom.btnPause.addEventListener('click', () => state.paused ? resumeGame() : pauseGame());
    dom.btnRestartGame.addEventListener('click', restartGame);
    dom.btnQuit.addEventListener('click', quitToHome);
    dom.btnResume.addEventListener('click', resumeGame);
    dom.btnPauseRestart.addEventListener('click', restartGame);
    dom.btnPauseQuit.addEventListener('click', quitToHome);
    dom.btnEncyclopedia.addEventListener('click', showEncyclopedia);
    dom.btnCloseEncy.addEventListener('click', hideEncyclopedia);
    dom.btnAchievements.addEventListener('click', showAchievements);
    dom.btnCloseAch.addEventListener('click', hideAchievements);
    dom.btnLeaderboard.addEventListener('click', showLeaderboard);
    dom.btnCloseLb.addEventListener('click', hideLeaderboard);
    dom.btnClearLb.addEventListener('click', clearLeaderboard);
    dom.btnResetAll.addEventListener('click', resetAllData);
    dom.btnTutSkip.addEventListener('click', hideTutorial);

    // 图鉴 tab 切换
    dom.encyTabs.addEventListener('click', (e) => {
      if (e.target.classList.contains('ency-tab')) switchEncyTab(e.target.dataset.cat);
    });

    // 关闭弹窗的遮罩点击
    dom.encyclopediaOverlay.addEventListener('click', (e) => { if (e.target === dom.encyclopediaOverlay) hideEncyclopedia(); });
    dom.achievementsOverlay.addEventListener('click', (e) => { if (e.target === dom.achievementsOverlay) hideAchievements(); });
    dom.leaderboardOverlay.addEventListener('click', (e) => { if (e.target === dom.leaderboardOverlay) hideLeaderboard(); });

    // 排行榜 tab 切换
    const lbTabs = document.querySelectorAll('.lb-tab');
    lbTabs.forEach(tab => tab.addEventListener('click', () => switchLbTab(tab.dataset.mode)));

    // 模式切换
    dom.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        dom.modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.mode = card.dataset.mode;
        const cfg = modeConfig[state.mode];
        dom.rulesList.innerHTML = cfg.rules.map(r => '<li>' + r + '</li>').join('');
        dom.btnStart.querySelector('.btn-text').textContent = state.mode === 'learn' ? '开始学习' : '开始挑战';
        displayHighScore();
      });
    });

    // 拖拽
    const card = dom.garbageCard;
    card.addEventListener('dragstart', e => { if (!state.isPlaying) return; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'garbage'); });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    dom.binBodies.forEach(bin => {
      bin.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; bin.classList.add('highlight'); });
      bin.addEventListener('dragleave', () => bin.classList.remove('highlight'));
      bin.addEventListener('drop', e => { e.preventDefault(); bin.classList.remove('highlight'); AudioEngine.sfxDrop(); handleDrop(bin.closest('.bin-wrapper').dataset.category, e.clientX, e.clientY); });
    });
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());

    // 触摸
    let activeBin = null, isTouching = false;
    card.addEventListener('touchstart', e => {
      if (!state.isPlaying) return; isTouching = true; AudioEngine.init();
      dom.touchClone.textContent = state.currentItem ? state.currentItem.emoji : '';
      dom.touchClone.style.display = 'block'; dom.touchClone.style.left = e.touches[0].clientX + 'px';
      dom.touchClone.style.top = e.touches[0].clientY + 'px'; card.classList.add('dragging'); e.preventDefault();
    }, { passive: false });
    card.addEventListener('touchmove', e => {
      if (!isTouching) return; const t = e.touches[0];
      dom.touchClone.style.left = t.clientX + 'px'; dom.touchClone.style.top = t.clientY + 'px';
      let found = false;
      dom.binBodies.forEach(bin => {
        const r = bin.getBoundingClientRect();
        if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
          if (activeBin !== bin) { if (activeBin) activeBin.classList.remove('highlight'); bin.classList.add('highlight'); activeBin = bin; } found = true;
        }
      });
      if (!found && activeBin) { activeBin.classList.remove('highlight'); activeBin = null; }
      e.preventDefault();
    }, { passive: false });
    card.addEventListener('touchend', e => {
      if (!isTouching) return; isTouching = false; dom.touchClone.style.display = 'none'; card.classList.remove('dragging');
      if (activeBin) { activeBin.classList.remove('highlight'); AudioEngine.sfxDrop(); handleDrop(activeBin.closest('.bin-wrapper').dataset.category, e.changedTouches[0].clientX, e.changedTouches[0].clientY); activeBin = null; }
    });

    // 键盘
    const keyMap = { Digit1: 'recyclable', Digit2: 'hazardous', Digit3: 'kitchen', Digit4: 'other' };
    document.addEventListener('keydown', e => {
      if (!state.isPlaying) return;
      if (e.code === 'Space') { e.preventDefault(); state.paused ? resumeGame() : pauseGame(); return; }
      if (state.paused) return;
      const cat = keyMap[e.code];
      if (cat) { e.preventDefault(); const bin = document.querySelector(`.bin-wrapper[data-category="${cat}"]`); if (bin) { const r = bin.getBoundingClientRect(); AudioEngine.sfxDrop(); handleDrop(cat, r.left + r.width / 2, r.top + r.height / 2); } }
    });

    // 点击垃圾桶
    dom.binBodies.forEach(bin => {
      bin.addEventListener('click', () => { if (!state.isPlaying) return; const cat = bin.closest('.bin-wrapper').dataset.category; const r = bin.getBoundingClientRect(); AudioEngine.sfxDrop(); handleDrop(cat, r.left + r.width / 2, r.top + r.height / 2); });
    });
  }

  function init() {
    initDom();
    displayHighScore();
    bindEvents();
    showPage(dom.startPage);
    showTutorial();
    // 如果看过图鉴/成就，解锁成就
    try { const cum = getCumulative(); if (localStorage.getItem('garbage_ency_viewed')) cum.unlocked.push('encyclopedia'); saveCumulative(cum); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
