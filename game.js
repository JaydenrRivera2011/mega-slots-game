// ===== GAME STATE =====
const S = {
  coins: 1000,
  gems: 50,
  level: 1,
  xp: 0,
  bet: 10,
  username: '',
  avatar: '🦊',
  color: '#ffd700',
  theme: 'default',
  inventory: {},
  totalSpins: 0,
  totalWon: 0,
  biggestWin: 0,
  todaySpins: 0,
  todayWins: 0,
  todayWon: 0,
  todayJackpots: 0,
  lastDailyKey: 0,
  lastDailySpinKey: 0,
  dailyRewardsShown: false,
  challenges: {},
  achievements: {},
};

// ===== STORE ITEMS =====
const STORE = [
  // ONE ITEM PER CATEGORY
  { id:'lucky_coin', cat:'upgrade', name:'Lucky Coin', icon:'🪙', desc:'Unlock 5000 max bet', cost:{coins:2000}, effect:{maxBet:5000}, max:1 },
  { id:'magic_boost', cat:'luck', name:'Magic Boost', icon:'✨', desc:'+10% win chance for 1h', cost:{coins:1500}, consumable:true, effect:{luckBoost:0.1} },
  { id:'sparkle', cat:'cosmetic', name:'Sparkle Effect', icon:'💫', desc:'Adds sparkles on wins', cost:{gems:10}, effect:{sparkle:true} },
  { id:'theme_neon', cat:'theme', name:'Neon Theme', icon:'🎨', desc:'Neon cyan & magenta vibes', cost:{gems:5}, effect:{theme:'neon'} },
  { id:'avatar_panda', cat:'avatar', name:'Panda Avatar', icon:'🐼', desc:'Be a cute panda!', cost:{coins:500}, effect:{avatar:'🐼'} },
  { id:'coin_boost', cat:'consumable', name:'Coin Booster', icon:'🍀', desc:'2x coin reward 30 mins', cost:{gems:15}, consumable:true, effect:{coinBoost:2} },
];

// ===== CHALLENGES =====
const CHALLENGES = [
  { id:'spin_x',  name:n=>`Spin ${n} times`,    stat:'todaySpins',    base:30,  reward:{coins:500} },
  { id:'win_x',   name:n=>`Win ${n} times`,     stat:'todayWins',     base:8,   reward:{coins:800,gems:5} },
  { id:'earn_x',  name:n=>`Earn ${n} coins`,    stat:'todayWon',      base:1500,reward:{coins:1000,gems:5} },
  { id:'jackpot', name:_=>`Hit a jackpot`,      stat:'todayJackpots', base:1,   reward:{coins:3000,gems:15} },
  { id:'spin_75',   name:n=>`Spin ${n} times`, stat:'todaySpins', base:75, reward:{coins:1200,gems:3} },
  { id:'spin_150',  name:n=>`Spin ${n} times`, stat:'todaySpins', base:150, reward:{coins:2500,gems:5} },
  { id:'win_15',    name:n=>`Win ${n} times`, stat:'todayWins', base:15, reward:{coins:1800,gems:4} },
  { id:'earn_5k',   name:n=>`Earn ${n.toLocaleString()} coins`, stat:'todayWon', base:5000, reward:{coins:2500,gems:4} },
];

// ===== PAYTABLE =====
const PAYTABLE = [
  { sym:'🍎', single:10, pair:30, triple:100 },
  { sym:'🍊', single:15, pair:45, triple:150 },
  { sym:'🍋', single:20, pair:60, triple:200 },
  { sym:'🍇', single:25, pair:75, triple:250 },
  { sym:'🎁', single:30, pair:90, triple:300 },
];

// ===== DAILY REWARDS (7 days) =====
const DAILY_REWARDS = [
  { day: 'Monday',    icon: '🌙', reward: { coins: 100, gems: 5 } },
  { day: 'Tuesday',   icon: '🔥', reward: { coins: 150, gems: 8 } },
  { day: 'Wednesday', icon: '💧', reward: { coins: 200, gems: 10 } },
  { day: 'Thursday',  icon: '⚡', reward: { coins: 250, gems: 12 } },
  { day: 'Friday',    icon: '🌳', reward: { coins: 300, gems: 15 } },
  { day: 'Saturday',  icon: '🌟', reward: { coins: 400, gems: 20 } },
  { day: 'Sunday',    icon: '👑', reward: { coins: 500, gems: 25 } },
];

// ===== UPDATES/ANNOUNCEMENTS =====
const UPDATES = [
  {
    title: 'Welcome to Lucky Spin!',
    date: 'Today',
    content: 'Get started by spinning the wheel and completing daily challenges to earn coins and gems!',
    icon: '🎉'
  },
  {
    title: 'New Daily Rewards System',
    date: 'Latest',
    content: 'Claim different rewards every day of the week. Don\'t miss out on the weekend bonuses!',
    icon: '📅'
  },
];

// ===== FUNCTIONS =====
function load(){
  const data = localStorage.getItem('luckyspin');
  if(data) Object.assign(S, JSON.parse(data));
  if(!S.achievements) S.achievements = {};
  if(!S.challenges) S.challenges = {};
  renderAll();
  checkDailyRewards();
}

function save(){ 
  localStorage.setItem('luckyspin', JSON.stringify(S)); 
}

// ---------- HELPERS ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function toast(msg, type=''){
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  $('#toast-host').appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function xpNeeded(lvl){ return 100 + (lvl-1)*50; }
function ownedCount(id){ return S.inventory[id] || 0; }
function isOwned(id){ return ownedCount(id) > 0; }

// Aggregate effects from owned items
function effects(){
  let eff = { luckBoost: 0, maxBet: 1000, sparkle: false, coinBoost: 1 };
  for(let [id, cnt] of Object.entries(S.inventory)){
    const item = STORE.find(i => i.id === id);
    if(item && item.effect){
      for(let [k, v] of Object.entries(item.effect)){
        if(typeof v === 'number') eff[k] = (eff[k] || 0) + v;
        else eff[k] = v;
      }
    }
  }
  return eff;
}

// ---------- SPIN LOGIC ----------
function pickSymbol(luckBoost=0){
  const luck = Math.random() < luckBoost ? 1 : Math.random();
  if(luck < 0.3) return '🍎';
  if(luck < 0.5) return '🍊';
  if(luck < 0.7) return '🍋';
  if(luck < 0.85) return '🍇';
  return '🎁';
}

function calcPayout(reels, bet){
  const [r0, r1, r2] = reels;
  if(r0 === r1 && r1 === r2){
    const p = PAYTABLE.find(t => t.sym === r0);
    return p.triple * bet;
  }
  if(r0 === r1 || r1 === r2 || r0 === r2){
    const sym = r0 === r1 ? r0 : (r1 === r2 ? r1 : r0);
    const p = PAYTABLE.find(t => t.sym === sym);
    return p.pair * bet;
  }
  if(reels.includes('🎁')){
    const p = PAYTABLE.find(t => t.sym === '🎁');
    return p.single * bet;
  }
  return 0;
}

let spinning = false;
async function spin(isFree=false){
  if(spinning) return;
  const eff = effects();
  if(!isFree && S.coins < S.bet){ toast('Not enough coins!', 'bad'); return; }
  spinning = true;
  $('#spin-btn').disabled = true;
  
  if(!isFree) S.coins -= S.bet;
  else S.coins += 10; // free spin gives 10 coins
  
  S.todaySpins++;
  S.totalSpins++;
  
  const reels = [];
  for(let i = 0; i < 3; i++){
    const r = $(`#reel-${i}`);
    r.classList.add('spinning');
    for(let j = 0; j < 10; j++){
      await new Promise(rs => setTimeout(rs, 50));
      r.textContent = pickSymbol();
    }
    reels.push(r.textContent);
    r.classList.remove('spinning');
  }
  
  const payout = calcPayout(reels, S.bet);
  if(payout > 0){
    S.coins += payout;
    S.totalWon += payout;
    S.todayWon += payout;
    if(payout > S.biggestWin) S.biggestWin = payout;
    
    const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
    if(isJackpot){
      S.todayJackpots++;
      triggerWinFX('jackpot', payout);
      $('#result-msg').textContent = `🎉 JACKPOT! +${payout} 🪙`;
      $('#result-msg').className = 'result jackpot';
    } else {
      S.todayWins++;
      triggerWinFX('win', payout);
      $('#result-msg').textContent = `✓ WIN! +${payout} 🪙`;
      $('#result-msg').className = 'result win';
    }
  } else {
    triggerWinFX('loss', 0);
    $('#result-msg').textContent = `Lost ${S.bet} 🪙`;
    $('#result-msg').className = 'result';
  }
  
  checkAchievements();
  save(); renderAll();
  spinning = false;
  $('#spin-btn').disabled = false;
}

// ---------- WIN FX ----------
function triggerWinFX(type, payout){
  if(type === 'jackpot') burstEmojis(['🎉', '💎', '⭐'], 20);
  else if(type === 'win') burstEmojis(['💰', '✨', '🎊'], 10);
}

function burstEmojis(emojis, n){
  for(let i = 0; i < n; i++){
    const div = document.createElement('div');
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    div.textContent = emoji;
    div.style.cssText = `position:fixed;left:${Math.random()*100}%;top:${Math.random()*100}%;pointer-events:none;font-size:24px;animation:float 2s ease-out forwards;opacity:0`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }
}

// ---------- DAILY REWARDS ----------
function claimDaily(){
  const key = dayKey();
  if(S.lastDailyKey === key){ toast('Already claimed today!'); return; }
  const idx = key % 7;
  const daily = DAILY_REWARDS[idx];
  S.coins += daily.reward.coins;
  S.gems += daily.reward.gems;
  S.lastDailyKey = key;
  save();
  toast(`Claimed ${daily.reward.coins}🪙 + ${daily.reward.gems}💎`);
  renderAll();
}

function dayKey(){ return Math.floor(Date.now()/86400000); }

function checkDailyRewards(){
  const key = dayKey();
  if(!S.dailyRewardsShown){
    showDailyRewardsPopup();
    S.dailyRewardsShown = true;
    save();
  }
}

function showDailyRewardsPopup(){
  const popup = $('#daily-popup');
  const grid = $('#daily-rewards-grid');
  const timer = $('#next-claim-timer');
  grid.innerHTML = '';
  
  const today = new Date();
  const dayIndex = today.getDay();
  const key = dayKey();
  
  for(let i = 0; i < 7; i++){
    const reward = DAILY_REWARDS[i];
    const isClaimed = S.lastDailyKey === key && i === dayIndex;
    const isToday = i === dayIndex;
    
    const div = document.createElement('div');
    div.className = `daily-reward-item ${isToday ? 'available' : ''} ${isClaimed ? 'claimed' : ''}`;
    div.innerHTML = `
      <div class="day">${reward.day}</div>
      <div class="icon">${reward.icon}</div>
      <div class="reward">${reward.reward.coins}🪙 ${reward.reward.gems}💎</div>
    `;
    grid.appendChild(div);
  }
  
  if(S.lastDailyKey === key){
    const nextClaim = new Date(today);
    nextClaim.setDate(nextClaim.getDate() + 1);
    nextClaim.setHours(0, 0, 0, 0);
    timer.textContent = `Next claim in: ${Math.ceil((nextClaim - today) / 60000)} minutes`;
  } else {
    timer.textContent = 'Available to claim now!';
  }
  
  popup.classList.remove('hidden');
}

function closeDailyPopup(){
  $('#daily-popup').classList.add('hidden');
}

// ---------- DAILY SPIN ----------
function useDailySpin(){
  const key = dayKey();
  if(S.lastDailySpinKey === key){ toast('Daily spin already used!'); return; }
  S.lastDailySpinKey = key;
  save();
  spin(true);
  updateDailySpinTimer();
}

function updateDailySpinTimer(){
  const timerEl = $('#daily-spin-timer');
  const key = dayKey();
  if(S.lastDailySpinKey === key){
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    timerEl.textContent = `Next spin in: ${hours}h ${mins}m`;
    $('#daily-spin-btn').disabled = true;
  } else {
    timerEl.textContent = '';
    $('#daily-spin-btn').disabled = false;
  }
}

// ---------- CHALLENGES ----------
function rollChallenges(){
  const key = dayKey();
  if(S.challenges.key !== key){
    S.challenges = { key, active: [] };
    for(let i = 0; i < 3; i++){
      const ch = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      S.challenges.active.push({ ...ch, target: ch.base, progress: 0, claimed: false });
    }
    save();
  }
}

function updateChallenges(){
  rollChallenges();
  for(let ch of S.challenges.active){
    ch.progress = S[ch.stat] || 0;
  }
}

function claimChallenge(idx){
  updateChallenges();
  const c = S.challenges.active[idx];
  if(!c || c.claimed){ toast('Already claimed'); return; }
  if(S[c.stat] < c.target){ toast('Not complete yet'); return; }
  S.coins += c.reward.coins;
  S.gems += (c.reward.gems || 0);
  c.claimed = true;
  toast(`Claimed challenge! +${c.reward.coins}🪙`);
  save(); renderAll();
}

// ---------- ACHIEVEMENTS ----------
function checkAchievements(){
  // Track achievements
  if(S.totalSpins === 100) S.achievements.spin100 = true;
  if(S.totalWon > 10000) S.achievements.won10k = true;
  if(S.todayJackpots >= 5) S.achievements.jp5 = true;
}

// ---------- STORE ----------
function buyItem(id){
  const item = STORE.find(i => i.id === id);
  if(!item) return;
  if(item.cost.coins && S.coins < item.cost.coins){ toast('Not enough coins'); return; }
  if(item.cost.gems && S.gems < item.cost.gems){ toast('Not enough gems'); return; }
  const cnt = ownedCount(id);
  if(item.max && cnt >= item.max){ toast('Max owned'); return; }
  
  if(item.cost.coins) S.coins -= item.cost.coins;
  if(item.cost.gems) S.gems -= item.cost.gems;
  S.inventory[id] = (cnt + 1);
  if(item.effect && item.effect.theme) S.theme = item.effect.theme;
  
  save(); renderAll();
  toast(`Bought ${item.name}!`);
}

// ---------- THEME ----------
function applyTheme(){
  document.body.className = '';
  if(S.theme && S.theme !== 'default') document.body.classList.add('theme-'+S.theme);
}

// ---------- LEADERBOARD ----------
async function fetchLeaderboard(){
  // Mock leaderboard
  return [
    { name: 'ProPlayer', level: 50, total: 500000, biggest: 50000 },
    { name: 'LuckyOne', level: 45, total: 450000, biggest: 45000 },
    { name: S.username || 'You', level: S.level, total: S.totalWon, biggest: S.biggestWin },
  ];
}

function loadLocalLB(){
  try{ return JSON.parse(localStorage.getItem('luckyspin_lb')||'[]'); }catch{ return []; }
}

function saveLocalLB(lb){ localStorage.setItem('luckyspin_lb', JSON.stringify(lb)); }

async function renderLeaderboard(){
  const data = await fetchLeaderboard();
  const tb = $('#lb-table tbody');
  tb.innerHTML = '';
  data.sort((a,b) => b.total - a.total).forEach((p, i) => {
    const tr = document.createElement('tr');
    if(p.name === S.username) tr.className = 'me';
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(p.name)}</td><td>Lv${p.level}</td><td>${p.total.toLocaleString()}</td><td>${p.biggest.toLocaleString()}</td>`;
    tb.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ---------- RENDER ----------
function renderHud(){
  $('#hud-coins').textContent = S.coins.toLocaleString();
  $('#hud-gems').textContent = S.gems.toLocaleString();
  $('#hud-level').textContent = S.level;
  $('#bet-amount').textContent = S.bet;
}

function renderPaytable(){
  const list = $('#paytable-list');
  list.innerHTML = '';
  for(let p of PAYTABLE){
    const row = document.createElement('div');
    row.className = 'pt-row';
    row.innerHTML = `<span class="sym">${p.sym}</span><span>${p.single}× / ${p.pair}× / ${p.triple}×</span>`;
    list.appendChild(row);
  }
}

function renderStore(){
  const grid = $('#store-grid');
  grid.innerHTML = '';
  
  const cat = document.querySelector('.chip.active').dataset.cat;
  const filtered = cat === 'all' ? STORE : STORE.filter(i => i.cat === cat);
  
  for(let item of filtered){
    const owned = ownedCount(item.id);
    const div = document.createElement('div');
    div.className = `item ${owned ? 'owned' : ''}`;
    const costStr = item.cost.coins ? `${item.cost.coins}🪙` : `${item.cost.gems}💎`;
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <h4>${item.name}</h4>
      <p>${item.desc}</p>
      <p class="price">${costStr}</p>
      ${owned ? `<p class="tiny">Owned: ${owned}</p>` : ''}
      <button class="btn primary" data-buy="${item.id}">Buy</button>
    `;
    grid.appendChild(div);
  }
  
  grid.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy));
}

function renderAchievements(){
  const grid = $('#ach-grid');
  grid.innerHTML = '';
  const ach = [
    { id:'spin100', icon:'🎪', name:'Century Spinner', desc:'Spin 100 times' },
    { id:'won10k', icon:'💰', name:'Coin Collector', desc:'Win 10,000 coins' },
    { id:'jp5', icon:'⭐', name:'Jackpot King', desc:'Hit 5 jackpots' },
  ];
  
  for(let a of ach){
    const div = document.createElement('div');
    div.className = `item ${S.achievements[a.id] ? 'owned' : 'locked'}`;
    div.innerHTML = `
      <div class="icon">${a.icon}</div>
      <h4>${a.name}</h4>
      <p>${a.desc}</p>
      ${!S.achievements[a.id] ? '<p class="tiny">Locked</p>' : '<p class="tiny">✓ Unlocked</p>'}
    `;
    grid.appendChild(div);
  }
}

function renderChallenges(){
  updateChallenges();
  const grid = $('#ch-grid');
  grid.innerHTML = '';
  
  if(!S.challenges.active) return;
  
  for(let i = 0; i < S.challenges.active.length; i++){
    const ch = S.challenges.active[i];
    const div = document.createElement('div');
    div.className = `item ${ch.claimed ? 'owned' : ''}`;
    const name = ch.name(ch.target);
    div.innerHTML = `
      <h4>${name}</h4>
      <p class="tiny">Progress: ${ch.progress}/${ch.target}</p>
      <div class="progress"><div style="width:${(ch.progress/ch.target)*100}%"></div></div>
      <p class="price">${ch.reward.coins}🪙 ${ch.reward.gems || 0}💎</p>
      <button class="btn ${ch.claimed ? 'ghost' : 'primary'}" data-claim="${i}" ${ch.claimed ? 'disabled' : ''}>
        ${ch.claimed ? 'Claimed' : 'Claim'}
      </button>
    `;
    grid.appendChild(div);
  }
  
  grid.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>claimChallenge(parseInt(b.dataset.claim)));
}

function renderProfile(){
  $('#pf-avatar').textContent = S.avatar;
  $('#pf-username').value = S.username;
  $('#pf-color').value = S.color;
  $('#pf-spins').textContent = S.totalSpins;
  $('#pf-won').textContent = S.totalWon.toLocaleString();
  $('#pf-big').textContent = S.biggestWin.toLocaleString();
  $('#pf-jp').textContent = S.todayJackpots;
  
  const av = $('#pf-avatars');
  av.innerHTML = '';
  const avatars = ['🦊', '🐼', '🐢', '🦁', '🐯', '🐸'];
  for(let emoji of avatars){
    const btn = document.createElement('button');
    btn.className = `avatar-opt ${S.avatar === emoji ? 'sel' : ''}`;
    btn.textContent = emoji;
    btn.onclick = () => { S.avatar = emoji; save(); renderProfile(); };
    av.appendChild(btn);
  }
  
  const theme = $('#pf-theme');
  theme.innerHTML = '';
  const themes = ['default', 'neon', 'gold', 'candy', 'forest', 'ocean'];
  for(let t of themes){
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    opt.selected = S.theme === t;
    theme.appendChild(opt);
  }
  theme.onchange = () => { S.theme = theme.value; save(); applyTheme(); renderProfile(); };
}

function renderUpdates(){
  const container = $('#updates-container');
  container.innerHTML = '';
  for(let update of UPDATES){
    const div = document.createElement('div');
    div.className = 'update-panel';
    div.innerHTML = `
      <h3>${update.icon} ${update.title}</h3>
      <p class="date">${update.date}</p>
      <p>${update.content}</p>
    `;
    container.appendChild(div);
  }
}

function renderAll(){ 
  renderHud(); 
  renderPaytable(); 
  renderStore(); 
  renderAchievements(); 
  renderChallenges(); 
  renderProfile(); 
  renderUpdates();
  applyTheme(); 
  updateDailySpinTimer();
}

// ---------- MENU SYSTEM ----------
function setupMenu(){
  const toggle = $('#menu-toggle');
  const sidebar = $('#sidebar');
  const overlay = $('#menu-overlay');
  const closeBtn = $('#menu-close');
  
  toggle.onclick = () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  };
  
  closeBtn.onclick = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  };
  
  overlay.onclick = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  };
  
  $$('.menu-item').forEach(item => {
    item.onclick = (e) => {
      e.preventDefault();
      const menu = item.dataset.menu;
      
      // Update active menu item
      $$('.menu-item').forEach(m => m.classList.remove('active'));
      item.classList.add('active');
      
      // Show correct tab
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      const tab = $(`#tab-${menu}`);
      if(tab) tab.classList.add('active');
      
      // Close menu
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      
      // Render content if needed
      if(menu === 'leaderboard') renderLeaderboard();
      else if(menu === 'updates') renderUpdates();
    };
  });
}

// ---------- ONBOARDING ----------
function setupOnboarding(){
  const avatars = ['🦊', '🐼', '🐢', '🦁', '🐯', '🐸'];
  const row = $('#ob-avatars');
  
  for(let emoji of avatars){
    const btn = document.createElement('button');
    btn.className = 'avatar-opt';
    if(emoji === '🦊') btn.classList.add('sel');
    btn.textContent = emoji;
    btn.onclick = () => {
      $$('.avatar-opt').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      S.avatar = emoji;
    };
    row.appendChild(btn);
  }
  
  $('#ob-start').onclick = () => {
    S.username = $('#ob-username').value || 'Player';
    S.color = $('#ob-color').value;
    $('#onboarding').classList.add('hidden');
    $('#app').classList.remove('hidden');
    load();
  };
}

// ---------- TABS ----------
function setupTabs(){
  $$('.chip').forEach(t=>t.onclick=()=>{
    $$('.chip').forEach(c => c.classList.remove('active'));
    t.classList.add('active');
    renderStore();
  });
}

// ---------- BET ----------
function setupBet(){
  const STEPS = [10,25,50,100,250,500,1000,2500,5000];
  const i = ()=> STEPS.indexOf(S.bet);
  $('#bet-down').onclick = ()=>{
    let idx = i(); if(idx<0) idx=1;
    if(idx>0){ S.bet = STEPS[idx-1]; save(); renderHud(); }
  };
  $('#bet-up').onclick = ()=>{
    let idx = i(); if(idx<0) idx=0;
    const eff = effects();
    if(idx<STEPS.length-1 && STEPS[idx+1] <= eff.maxBet){ S.bet = STEPS[idx+1]; save(); renderHud(); }
    else toast('Max bet reached (buy upgrades for more)');
  };
  $('#bet-max').onclick = ()=>{
    const eff = effects();
    for(let j = STEPS.length-1; j >= 0; j--){
      if(STEPS[j] <= eff.maxBet){ S.bet = STEPS[j]; save(); renderHud(); break; }
    }
  };
}

// ---------- INIT ----------
function init(){
  setupOnboarding();
  setupMenu();
  setupTabs();
  setupBet();
  
  $('#spin-btn').onclick = ()=>spin(false);
  $('#daily-btn').onclick = claimDaily;
  $('#daily-spin-btn').onclick = useDailySpin;
  $('#daily-popup-close').onclick = closeDailyPopup;
  $('#lb-refresh').onclick = renderLeaderboard;
  
  $$('.chip').forEach(c=>c.onclick=()=>{
    $$('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    renderStore();
  });
  
  $('#pf-save').onclick = ()=>{
    S.username = $('#pf-username').value;
    S.color = $('#pf-color').value;
    save();
    toast('Profile saved!');
  };
  
  $('#pf-reset').onclick = ()=>{
    if(confirm('Reset all progress?')){
      localStorage.removeItem('luckyspin');
      location.reload();
    }
  };
  
  renderAll();
}

init();
