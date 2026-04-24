// ============================================================
// 🎰 MEGA SLOTS - COMPLETE JAVASCRIPT
// ============================================================

const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let playerData = {
    userId: '',
    username: '',
    coins: 5000,
    gems: 100,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalSpins: 0,
    totalWins: 0,
    totalWinnings: 0,
    biggestWin: 0,
    winStreak: 0,
    bestStreak: 0,
    currentBet: 100,
    friends: [],
    friendRequests: [],
    cosmetics: { machines: ['machine-classic'], reels: ['reel-classic'], buttons: ['btn-golden'], effects: ['effect-none'] },
    selectedCosmetics: { machine: 'machine-classic', reel: 'reel-classic', button: 'btn-golden', effect: 'effect-none' },
    upgrades: {},
    achievements: [],
};

// SYMBOL DATA - COMPLETE RARITY SYSTEM
const SYMBOLS = {
    '🍎': { name: 'Apple', weight: 20, rarity: 'common', payout: 2 },
    '🍊': { name: 'Orange', weight: 20, rarity: 'common', payout: 2 },
    '🍋': { name: 'Lemon', weight: 20, rarity: 'common', payout: 2 },
    '🍇': { name: 'Grapes', weight: 18, rarity: 'common', payout: 2.5 },
    '🍓': { name: 'Strawberry', weight: 18, rarity: 'common', payout: 2.5 },
    '💎': { name: 'Diamond', weight: 12, rarity: 'uncommon', payout: 5 },
    '👑': { name: 'Crown', weight: 12, rarity: 'uncommon', payout: 5 },
    '🔥': { name: 'Fire', weight: 12, rarity: 'uncommon', payout: 5 },
    '⭐': { name: 'Star', weight: 10, rarity: 'uncommon', payout: 6 },
    '🌙': { name: 'Moon', weight: 10, rarity: 'uncommon', payout: 6 },
    '🌟': { name: 'Sparkle', weight: 6, rarity: 'rare', payout: 15 },
    '🦄': { name: 'Unicorn', weight: 6, rarity: 'rare', payout: 15 },
    '🏆': { name: 'Trophy', weight: 4, rarity: 'epic', payout: 50 },
    '💰': { name: 'Money Bag', weight: 4, rarity: 'epic', payout: 50 },
    '🎊': { name: 'Jackpot', weight: 2, rarity: 'legendary', payout: 200 },
    '👑💎': { name: 'Crown Jewel', weight: 1, rarity: 'legendary', payout: 500 },
};

// COSMETICS DATA
const COSMETICS = {
    machines: [
        { id: 'machine-classic', name: 'Classic', icon: '🤖', cost: 0, free: true },
        { id: 'machine-rainbow', name: 'Rainbow', icon: '🌈', cost: 5000 },
        { id: 'machine-neon', name: 'Neon', icon: '💡', cost: 10000 },
        { id: 'machine-space', name: 'Space', icon: '🚀', cost: 15000 },
        { id: 'machine-dragon', name: 'Dragon', icon: '🐉', cost: 20000 },
        { id: 'machine-volcano', name: 'Volcano', icon: '🌋', cost: 25000 },
        { id: 'machine-ocean', name: 'Ocean', icon: '🌊', cost: 30000 },
        { id: 'machine-crypto', name: 'Crypto', icon: '₿', cost: 35000 },
    ],
    reels: [
        { id: 'reel-classic', name: 'Classic', icon: '⚫', cost: 0, free: true },
        { id: 'reel-starfield', name: 'Starfield', icon: '⭐', cost: 3000 },
        { id: 'reel-matrix', name: 'Matrix', icon: '💻', cost: 5000 },
        { id: 'reel-fire', name: 'Fire', icon: '🔥', cost: 7000 },
        { id: 'reel-ice', name: 'Ice', icon: '❄️', cost: 7000 },
        { id: 'reel-galaxy', name: 'Galaxy', icon: '🌀', cost: 10000 },
    ],
    buttons: [
        { id: 'btn-golden', name: 'Golden', icon: '🟡', cost: 0, free: true },
        { id: 'btn-diamond', name: 'Diamond', icon: '💎', cost: 2000 },
        { id: 'btn-neon', name: 'Neon', icon: '⚡', cost: 3000 },
        { id: 'btn-crystal', name: 'Crystal', icon: '🔷', cost: 4000 },
    ],
    effects: [
        { id: 'effect-none', name: 'None', icon: '○', cost: 0, free: true },
        { id: 'effect-rainbow', name: 'Rainbow', icon: '🌈', cost: 5000 },
        { id: 'effect-fire', name: 'Fire', icon: '🔥', cost: 8000 },
        { id: 'effect-cosmic', name: 'Cosmic', icon: '💫', cost: 12000 },
    ],
    themes: [
        { id: 'theme-day', name: 'Day', icon: '☀️', cost: 0, free: true },
        { id: 'theme-night', name: 'Night', icon: '🌙', cost: 4000 },
        { id: 'theme-neon', name: 'Neon', icon: '🌃', cost: 6000 },
    ],
};

// UPGRADES DATA
const UPGRADES = {
    odds1: { name: 'Better Odds I', icon: '🎲', category: 'odds', cost: 500, benefit: '+2% win chance', level: 0 },
    odds2: { name: 'Better Odds II', icon: '🎲', category: 'odds', cost: 2000, benefit: '+5% win chance', level: 0 },
    odds3: { name: 'Better Odds III', icon: '🎲', category: 'odds', cost: 5000, benefit: '+10% win chance', level: 0 },
    lucky1: { name: 'Lucky Charm I', icon: '🧿', category: 'odds', cost: 1000, benefit: '+3% rare symbols', level: 0 },
    lucky2: { name: 'Lucky Charm II', icon: '🧿', category: 'odds', cost: 3000, benefit: '+7% rare symbols', level: 0 },
    payout1: { name: 'Golden Touch I', icon: '✨', category: 'payout', cost: 2000, benefit: '+5% payouts', level: 0 },
    payout2: { name: 'Golden Touch II', icon: '✨', category: 'payout', cost: 5000, benefit: '+12% payouts', level: 0 },
    payout3: { name: 'Golden Touch III', icon: '✨', category: 'payout', cost: 10000, benefit: '+25% payouts', level: 0 },
    multi1: { name: 'Mega Multiplier I', icon: '🎯', category: 'payout', cost: 5000, benefit: '+0.1x multiplier', level: 0 },
    multi2: { name: 'Mega Multiplier II', icon: '🎯', category: 'payout', cost: 12000, benefit: '+0.25x multiplier', level: 0 },
    jackpot1: { name: 'Jackpot Magnet I', icon: '💥', category: 'special', cost: 10000, benefit: '+5% epic chance', level: 0 },
    jackpot2: { name: 'Jackpot Magnet II', icon: '💥', category: 'special', cost: 25000, benefit: '+15% epic chance', level: 0 },
    diamond1: { name: 'Diamond Reels I', icon: '💎', category: 'special', cost: 20000, benefit: '+2% legendary chance', level: 0 },
    diamond2: { name: 'Diamond Reels II', icon: '💎', category: 'special', cost: 50000, benefit: '+8% legendary chance', level: 0 },
    cosmic: { name: 'Cosmic Luck', icon: '🌌', category: 'special', cost: 100000, benefit: '2x ALL stats!', level: 0 },
};

// ACHIEVEMENTS
const ACHIEVEMENTS = [
    { id: 'firstWin', name: 'First Win', icon: '🎉', desc: 'Get your first win', reward: { coins: 500, gems: 50 } },
    { id: 'millionaire', name: 'Millionaire', icon: '💰', desc: 'Reach 1M coins', reward: { coins: 50000, gems: 500 } },
    { id: 'jackpot', name: 'JACKPOT!', icon: '💥', desc: 'Hit 3 legendary symbols', reward: { coins: 10000, gems: 200 } },
    { id: 'streak5', name: 'Hot Streak', icon: '🔥', desc: 'Win 5 times in a row', reward: { coins: 2000, gems: 100 } },
    { id: 'streak10', name: 'Inferno', icon: '🌟', desc: 'Win 10 times in a row', reward: { coins: 5000, gems: 250 } },
    { id: 'spins100', name: 'Spinner', icon: '🎯', desc: '100 spins', reward: { coins: 2000, gems: 100 } },
    { id: 'spins1000', name: 'Mega Spinner', icon: '🚀', desc: '1000 spins', reward: { coins: 20000, gems: 1000 } },
    { id: 'level50', name: 'Half Century', icon: '5️⃣', desc: 'Reach level 50', reward: { coins: 10000, gems: 500 } },
    { id: 'billionaire', name: 'BILLIONAIRE', icon: '👑', desc: 'Reach 1B coins', reward: { coins: 1000000, gems: 10000 } },
];

// ============================================================
// AUTH FUNCTIONS
// ============================================================

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadPlayerData();
        showScreen('game');
    } else {
        showScreen('login');
    }
});

function showScreen(screen) {
    document.getElementById('login-screen').style.display = screen === 'login' ? 'flex' : 'none';
    document.getElementById('game-screen').style.display = screen === 'game' ? 'block' : 'none';
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('error-message').textContent = '';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'flex';
    document.getElementById('error-message').textContent = '';
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        })
        .catch(error => showError(error.message));
}

function signup() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (!username || !email || !password || !confirm) {
        showError('Please fill in all fields');
        return;
    }

    if (username.length < 3) {
        showError('Username must be 3+ characters');
        return;
    }

    if (password.length < 6) {
        showError('Password must be 6+ characters');
        return;
    }

    if (password !== confirm) {
        showError('Passwords do not match');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
            const uid = result.user.uid;
            
            // Create user profile
            const newPlayer = {
                ...playerData,
                userId: uid,
                username: username,
            };

            db.ref(`users/${uid}`).set(newPlayer)
                .then(() => {
                    document.getElementById('username').value = '';
                    document.getElementById('signup-email').value = '';
                    document.getElementById('signup-password').value = '';
                    document.getElementById('confirm-password').value = '';
                    showLogin();
                });
        })
        .catch(error => showError(error.message));
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut();
    }
}

function showError(msg) {
    document.getElementById('error-message').textContent = '❌ ' + msg;
}

// ============================================================
// GAME FUNCTIONS
// ============================================================

function loadPlayerData() {
    const ref = db.ref(`users/${currentUser.uid}`);
    ref.on('value', (snapshot) => {
        if (snapshot.exists()) {
            playerData = snapshot.val();
            updateAllUI();
        }
    });
}

function savePlayerData() {
    db.ref(`users/${currentUser.uid}`).update(playerData);
}

function updateAllUI() {
    updateDisplay();
    updateGameStats();
}

function updateDisplay() {
    document.getElementById('coins-display').textContent = formatNumber(playerData.coins);
    document.getElementById('gems-display').textContent = formatNumber(playerData.gems);
    document.getElementById('level-display').textContent = playerData.level;
    document.getElementById('streak-display').textContent = playerData.winStreak;
    updateMultiplier();
}

function updateMultiplier() {
    let mult = 1.0;
    if (playerData.winStreak >= 5) mult += 0.1;
    if (playerData.winStreak >= 10) mult += 0.2;
    document.getElementById('multiplier-display').textContent = mult.toFixed(1) + 'x';
    return mult;
}

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

function goToPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (page === 'leaderboard') renderLeaderboard();
    if (page === 'cosmetics') renderCosmetics();
    if (page === 'upgrades') renderUpgrades();
    if (page === 'friends') renderFriends();
    if (page === 'messages') renderMessages();
    if (page === 'profile') renderProfile();
}

// ============================================================
// SPIN LOGIC
// ============================================================

function getRandomSymbol() {
    const totalWeight = Object.values(SYMBOLS).reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [symbol, data] of Object.entries(SYMBOLS)) {
        random -= data.weight;
        if (random <= 0) return symbol;
    }
    return '🍎';
}

function calculatePayout(reels) {
    // Check if all 3 match
    if (reels[0] !== reels[1] || reels[1] !== reels[2]) {
        return 0;
    }

    const symbol = reels[0];
    const symbolData = SYMBOLS[symbol];
    let payout = playerData.currentBet * symbolData.payout;

    // Rarity multiplier
    const rarityMult = {
        'common': 1,
        'uncommon': 2,
        'rare': 4,
        'epic': 8,
        'legendary': 20,
    };
    payout *= rarityMult[symbolData.rarity] || 1;

    // Upgrade bonuses
    if (playerData.upgrades.payout1) payout *= 1.05;
    if (playerData.upgrades.payout2) payout *= 1.12;
    if (playerData.upgrades.payout3) payout *= 1.25;

    // Multiplier
    const mult = updateMultiplier();
    payout *= mult;

    return Math.floor(payout);
}

function spin() {
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn.disabled) return;

    if (playerData.coins < playerData.currentBet) {
        alert('Not enough coins!');
        return;
    }

    spinBtn.disabled = true;
    playerData.coins -= playerData.currentBet;
    playerData.totalSpins++;
    addXP(1);

    const reels = ['reel1', 'reel2', 'reel3'];
    reels.forEach(id => document.getElementById(id).classList.add('spinning'));

    setTimeout(() => {
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        results.forEach((symbol, i) => {
            document.getElementById(reels[i]).querySelector('.symbol').textContent = symbol;
        });

        reels.forEach(id => document.getElementById(id).classList.remove('spinning'));

        const payout = calculatePayout(results);
        const resultDiv = document.getElementById('result');
        const resultText = document.getElementById('result-text');

        if (payout > 0) {
            playerData.coins += payout;
            playerData.totalWins++;
            playerData.totalWinnings += payout;
            if (payout > playerData.biggestWin) playerData.biggestWin = payout;
            playerData.winStreak++;
            if (playerData.winStreak > playerData.bestStreak) playerData.bestStreak = playerData.winStreak;

            resultDiv.classList.add('win');
            resultDiv.classList.remove('loss');
            resultText.textContent = `🎉 WIN! +${formatNumber(payout)} coins!`;
            createConfetti();
            checkAchievements();
        } else {
            playerData.winStreak = 0;
            resultDiv.classList.add('loss');
            resultDiv.classList.remove('win');
            resultText.textContent = '❌ Try again!';
        }

        updateAllUI();
        savePlayerData();
        spinBtn.disabled = false;
    }, 600);
}

function setBet(amount) {
    playerData.currentBet = amount;
    document.getElementById('custom-bet').value = amount;
}

function setCustomBet() {
    const bet = parseInt(document.getElementById('custom-bet').value);
    if (bet > 0 && bet <= 100000) {
        playerData.currentBet = bet;
    }
}

function updateGameStats() {
    document.getElementById('today-spins').textContent = playerData.totalSpins;
    document.getElementById('today-wins').textContent = playerData.totalWins;
    document.getElementById('today-winnings').textContent = formatNumber(playerData.totalWinnings);
    document.getElementById('today-best').textContent = formatNumber(playerData.biggestWin);
}

function addXP(amount) {
    playerData.xp += amount;
    if (playerData.xp >= playerData.xpToNextLevel) {
        playerData.level++;
        playerData.xp = 0;
        playerData.xpToNextLevel = Math.floor(playerData.xpToNextLevel * 1.15);
        alert(`⬆️ LEVEL UP! You're now level ${playerData.level}!`);
        checkAchievements();
    }
    savePlayerData();
}

function createConfetti() {
    const confetti = document.getElementById('confetti');
    for (let i = 0; i < 30; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9D4EDD'][Math.floor(Math.random() * 4)];
        confetti.appendChild(piece);
        setTimeout(() => piece.remove(), 3000);
    }
}

// ============================================================
// COSMETICS
// ============================================================

function renderCosmetics() {
    const grid = document.getElementById('cosmetics-grid');
    grid.innerHTML = '';
    
    let tab = 'machines';
    if (event && event.target.textContent.includes('Reels')) tab = 'reels';
    if (event && event.target.textContent.includes('Buttons')) tab = 'buttons';
    if (event && event.target.textContent.includes('Effects')) tab = 'effects';
    if (event && event.target.textContent.includes('Themes')) tab = 'themes';

    const items = COSMETICS[tab];
    const selectKey = tab === 'machines' ? 'machine' : tab === 'reels' ? 'reel' : tab === 'buttons' ? 'button' : 'effect';

    items.forEach(item => {
        const owned = playerData.cosmetics[tab].includes(item.id);
        const selected = playerData.selectedCosmetics[selectKey] === item.id;

        const div = document.createElement('div');
        div.className = `cosmetic-item ${owned ? 'owned' : ''} ${selected ? 'selected' : ''}`;
        
        const priceText = item.free ? 'FREE' : `${formatNumber(item.cost)} 💰`;

        div.innerHTML = `
            <div class="cosmetic-icon">${item.icon}</div>
            <div class="cosmetic-name">${item.name}</div>
            <div class="cosmetic-price">${priceText}</div>
            <button class="cosmetic-btn ${selected ? 'selected' : ''}" 
                onclick="buyCosmetic('${tab}', '${item.id}', ${item.cost}, '${selectKey}')">
                ${owned ? (selected ? '✓' : 'Select') : 'Buy'}
            </button>
        `;
        
        grid.appendChild(div);
    });
}

function buyCosmetic(tab, id, cost, selectKey) {
    if (playerData.cosmetics[tab].includes(id)) {
        playerData.selectedCosmetics[selectKey] = id;
        alert('✨ Selected!');
    } else {
        if (playerData.coins < cost) {
            alert('Not enough coins!');
            return;
        }
        playerData.coins -= cost;
        playerData.cosmetics[tab].push(id);
        playerData.selectedCosmetics[selectKey] = id;
        alert('✨ Purchased!');
    }
    savePlayerData();
    updateDisplay();
    renderCosmetics();
}

function openTab(event, tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderCosmetics();
}

// ============================================================
// UPGRADES
// ============================================================

function renderUpgrades() {
    const grid = document.getElementById('upgrades-grid');
    grid.innerHTML = '';

    Object.entries(UPGRADES).forEach(([key, upgrade]) => {
        const owned = playerData.upgrades[key] || false;

        const div = document.createElement('div');
        div.className = 'upgrade-card';
        
        div.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${owned ? '✓ OWNED' : 'Not Owned'}</div>
            <div class="upgrade-benefit">${upgrade.benefit}</div>
            <div class="upgrade-cost">${formatNumber(upgrade.cost)} 💰</div>
            <button class="upgrade-btn" 
                onclick="buyUpgrade('${key}', ${upgrade.cost})"
                ${owned || playerData.coins < upgrade.cost ? 'disabled' : ''}>
                ${owned ? 'OWNED' : 'BUY'}
            </button>
        `;
        
        grid.appendChild(div);
    });
}

function buyUpgrade(key, cost) {
    if (playerData.upgrades[key]) {
        alert('Already owned!');
        return;
    }

    if (playerData.coins < cost) {
        alert('Not enough coins!');
        return;
    }

    playerData.coins -= cost;
    playerData.upgrades[key] = true;
    alert('✨ Upgrade purchased!');
    savePlayerData();
    updateDisplay();
    renderUpgrades();
}

function filterUpgrades(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const grid = document.getElementById('upgrades-grid');
    grid.innerHTML = '';

    Object.entries(UPGRADES).forEach(([key, upgrade]) => {
        if (category !== 'all' && upgrade.category !== category) return;

        const owned = playerData.upgrades[key] || false;

        const div = document.createElement('div');
        div.className = 'upgrade-card';
        
        div.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${owned ? '✓ OWNED' : 'Not Owned'}</div>
            <div class="upgrade-benefit">${upgrade.benefit}</div>
            <div class="upgrade-cost">${formatNumber(upgrade.cost)} 💰</div>
            <button class="upgrade-btn" 
                onclick="buyUpgrade('${key}', ${upgrade.cost})"
                ${owned || playerData.coins < upgrade.cost ? 'disabled' : ''}>
                ${owned ? 'OWNED' : 'BUY'}
            </button>
        `;
        
        grid.appendChild(div);
    });
}

// ============================================================
// LEADERBOARD
// ============================================================

function renderLeaderboard() {
    const tbody = document.getElementById('lb-tbody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading...</td></tr>';

    db.ref('users').orderByChild('coins').limitToLast(100).once('value', (snapshot) => {
        const users = [];
        snapshot.forEach((child) => {
            users.push({
                id: child.key,
                ...child.val()
            });
        });

        users.reverse();
        tbody.innerHTML = '';

        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            const isCurrent = user.id === currentUser.uid;
            
            if (isCurrent) tr.classList.add('user-row');
            if (index < 3) tr.classList.add(`rank-${index + 1}`);

            tr.innerHTML = `
                <td class="rank-badge">${index + 1}</td>
                <td>${user.username}</td>
                <td>${formatNumber(user.coins)}</td>
                <td>${user.level}</td>
                <td>${formatNumber(user.biggestWin)}</td>
                <td>
                    <button class="action-btn" onclick="addFriend('${user.id}', '${user.username}')">
                        👥 Add
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    });
}

function switchLB(type) {
    document.querySelectorAll('.lb-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderLeaderboard(); // For now, just rerender
}

// ============================================================
// FRIENDS & MESSAGES
// ============================================================

function renderFriends() {
    const friendsList = document.getElementById('friends-list');
    const requestsList = document.getElementById('requests-list');

    friendsList.innerHTML = '';
    requestsList.innerHTML = '';

    if (playerData.friends.length === 0) {
        friendsList.innerHTML = '<div class="list-item">No friends yet</div>';
    } else {
        playerData.friends.forEach(friendId => {
            db.ref(`users/${friendId}`).once('value', (snapshot) => {
                const friend = snapshot.val();
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <div class="list-item-info">
                        <h4>${friend.username}</h4>
                        <p>Level ${friend.level} • ${formatNumber(friend.coins)} coins</p>
                    </div>
                    <div class="list-item-btns">
                        <button class="list-item-btn" onclick="openChat('${friendId}')">💬</button>
                        <button class="list-item-btn danger" onclick="removeFriend('${friendId}')">✕</button>
                    </div>
                `;
                friendsList.appendChild(div);
            });
        });
    }

    if (playerData.friendRequests.length === 0) {
        requestsList.innerHTML = '<div class="list-item">No pending requests</div>';
    } else {
        playerData.friendRequests.forEach(requesterId => {
            db.ref(`users/${requesterId}`).once('value', (snapshot) => {
                const requester = snapshot.val();
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <div class="list-item-info">
                        <h4>${requester.username}</h4>
                        <p>Wants to be your friend</p>
                    </div>
                    <div class="list-item-btns">
                        <button class="list-item-btn" onclick="acceptFriend('${requesterId}')">✓</button>
                        <button class="list-item-btn danger" onclick="declineFriend('${requesterId}')">✕</button>
                    </div>
                `;
                requestsList.appendChild(div);
            });
        });
    }
}

function searchPlayers() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const results = document.getElementById('search-results');
    results.innerHTML = '';

    if (query.length < 2) return;

    db.ref('users').once('value', (snapshot) => {
        snapshot.forEach((child) => {
            const user = child.val();
            const userId = child.key;
            
            if (user.username.toLowerCase().includes(query) && userId !== currentUser.uid) {
                const isFriend = playerData.friends.includes(userId);
                const hasRequest = playerData.friendRequests.includes(userId);

                const div = document.createElement('div');
                div.className = 'search-result';
                div.innerHTML = `
                    <div>
                        <strong>${user.username}</strong>
                        <p>Level ${user.level}</p>
                    </div>
                    <button class="action-btn" onclick="addFriend('${userId}', '${user.username}')" 
                        ${isFriend || hasRequest ? 'disabled' : ''}>
                        ${isFriend ? '✓ Friend' : hasRequest ? 'Pending' : '+ Add'}
                    </button>
                `;
                results.appendChild(div);
            }
        });
    });
}

function addFriend(userId, username) {
    if (playerData.friendRequests.includes(userId)) {
        acceptFriend(userId);
        return;
    }

    db.ref(`users/${userId}/friendRequests`).once('value', (snap) => {
        const requests = snap.val() || [];
        if (!requests.includes(currentUser.uid)) {
            requests.push(currentUser.uid);
            db.ref(`users/${userId}/friendRequests`).set(requests);
        }
    });

    alert(`📨 Friend request sent to ${username}!`);
}

function acceptFriend(userId) {
    if (!playerData.friends.includes(userId)) {
        playerData.friends.push(userId);
    }
    playerData.friendRequests = playerData.friendRequests.filter(id => id !== userId);

    db.ref(`users/${userId}/friends`).once('value', (snap) => {
        const friends = snap.val() || [];
        if (!friends.includes(currentUser.uid)) {
            friends.push(currentUser.uid);
            db.ref(`users/${userId}/friends`).set(friends);
        }
    });

    db.ref(`users/${userId}/friendRequests`).once('value', (snap) => {
        const requests = snap.val() || [];
        db.ref(`users/${userId}/friendRequests`).set(requests.filter(id => id !== currentUser.uid));
    });

    savePlayerData();
    renderFriends();
    alert('✨ Friend request accepted!');
}

function declineFriend(userId) {
    playerData.friendRequests = playerData.friendRequests.filter(id => id !== userId);
    savePlayerData();
    renderFriends();
}

function removeFriend(userId) {
    playerData.friends = playerData.friends.filter(id => id !== userId);
    savePlayerData();
    renderFriends();
}

let currentChatFriend = null;

function renderMessages() {
    const list = document.getElementById('messages-list');
    list.innerHTML = '';

    playerData.friends.forEach(friendId => {
        db.ref(`users/${friendId}`).once('value', (snap) => {
            const friend = snap.val();
            const div = document.createElement('div');
            div.className = `message-preview ${currentChatFriend === friendId ? 'active' : ''}`;
            div.onclick = () => openChat(friendId);
            div.innerHTML = `
                <div class="message-preview-name">${friend.username}</div>
                <div class="message-preview-text">Click to chat...</div>
            `;
            list.appendChild(div);
        });
    });
}

function openChat(friendId) {
    currentChatFriend = friendId;
    db.ref(`users/${friendId}`).once('value', (snap) => {
        const friend = snap.val();
        document.getElementById('chat-header').textContent = friend.username;
    });
    renderMessages();
    loadMessages(friendId);
}

function loadMessages(friendId) {
    const chatDiv = document.getElementById('chat-messages');
    chatDiv.innerHTML = '';

    const convId = [currentUser.uid, friendId].sort().join('_');
    db.ref(`messages/${convId}`).on('value', (snap) => {
        chatDiv.innerHTML = '';
        snap.forEach((child) => {
            const msg = child.val();
            const div = document.createElement('div');
            div.className = `chat-message ${msg.from === currentUser.uid ? 'sent' : 'received'}`;
            div.textContent = msg.text;
            chatDiv.appendChild(div);
        });
        chatDiv.scrollTop = chatDiv.scrollHeight;
    });
}

function sendMessage() {
    if (!currentChatFriend) return;
    const text = document.getElementById('message-input').value.trim();
    if (!text) return;

    const convId = [currentUser.uid, currentChatFriend].sort().join('_');
    db.ref(`messages/${convId}`).push({
        from: currentUser.uid,
        text: text,
        timestamp: new Date().toISOString(),
    });

    document.getElementById('message-input').value = '';
}

function handleMessageKey(event) {
    if (event.key === 'Enter') sendMessage();
}

// ============================================================
// PROFILE
// ============================================================

function renderProfile() {
    document.getElementById('profile-name').textContent = playerData.username;
    document.getElementById('profile-uid').textContent = `UID: ${currentUser.uid.substring(0, 12)}...`;
    document.getElementById('p-coins').textContent = formatNumber(playerData.coins);
    document.getElementById('p-gems').textContent = formatNumber(playerData.gems);
    document.getElementById('p-level').textContent = playerData.level;
    document.getElementById('p-spins').textContent = playerData.totalSpins;
    document.getElementById('p-wins').textContent = playerData.totalWins;
    document.getElementById('p-winnings').textContent = formatNumber(playerData.totalWinnings);
    document.getElementById('p-streak').textContent = playerData.bestStreak;
    document.getElementById('p-bigwin').textContent = formatNumber(playerData.biggestWin);

    const badgesDiv = document.getElementById('profile-badges');
    badgesDiv.innerHTML = '';
    if (playerData.coins >= 1000000) badgesDiv.innerHTML += '<span class="badge">💰 Millionaire</span>';
    if (playerData.level >= 50) badgesDiv.innerHTML += '<span class="badge">⭐ Level 50</span>';
    if (playerData.bestStreak >= 10) badgesDiv.innerHTML += '<span class="badge">🔥 Inferno</span>';

    const achDiv = document.getElementById('achievements-display');
    achDiv.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = playerData.achievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = `achievement ${unlocked ? 'unlocked' : ''}`;
        div.innerHTML = `<div class="achievement-icon">${ach.icon}</div><div class="achievement-name">${ach.name}</div>`;
        achDiv.appendChild(div);
    });
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (playerData.achievements.includes(ach.id)) return;

        let let shouldUnlock = false;
        if (ach.id === 'firstWin' && playerData.totalWins === 1) shouldUnlock = true;
        if (ach.id === 'millionaire' && playerData.coins >= 1000000) shouldUnlock = true;
        if (ach.id === 'jackpot' && playerData.biggestWin >= 10000) shouldUnlock = true;
        if (ach.id === 'streak5' && playerData.winStreak === 5) shouldUnlock = true;
        if (ach.id === 'streak10' && playerData.winStreak === 10) shouldUnlock = true;
        if (ach.id === 'spins100' && playerData.totalSpins === 100) shouldUnlock = true;
        if (ach.id === 'spins1000' && playerData.totalSpins === 1000) shouldUnlock = true;
        if (ach.id === 'level50' && playerData.level >= 50) shouldUnlock = true;
        if (ach.id === 'billionaire' && playerData.coins >= 1000000000) shouldUnlock = true;

        if (shouldUnlock) {
            playerData.achievements.push(ach.id);
            playerData.coins += ach.reward.coins;
            playerData.gems += ach.reward.gems;
            alert(`🎖️ ${ach.name}! +${ach.reward.coins} coins + ${ach.reward.gems} gems`);
        }
    });
}
