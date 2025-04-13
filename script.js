
const CONFIG = {
  spawn: {
    soldiersPerWave: 1,
    enemiesPerWave: 4,
    weaponsPerWave: 1
  },
  timing: {
    soldierWave: 1000,
    enemyWave: 5000,
    weaponWave: 12000,
    shootInterval: 50
  }
};

const lanes = [
  document.getElementById('lane0'),
  document.getElementById('lane1'),
  document.getElementById('lane2')
];

const gameContainer = document.getElementById('game');
const player = document.getElementById('player');
let currentLane = 1;
let soldiers = 0;
let soldierElements = [];
let weapons = 0;
let score = 0;
let health = 1000;
let weaponDamage = 2;

function updatePlayerPosition() {
  const laneWidth = gameContainer.offsetWidth / 3;
  player.style.left = `${currentLane * laneWidth + laneWidth / 2}px`;

  const radius = 30;
  soldierElements.forEach((soldier, index) => {
    const angle = (index / soldierElements.length) * 2 * Math.PI;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    soldier.style.left = `${currentLane * laneWidth + laneWidth / 2 + offsetX}px`;
    soldier.style.bottom = `${60 + offsetY}px`;
  });
}
updatePlayerPosition();

function spawnEnemies() {
  for (let i = 0; i < CONFIG.spawn.enemiesPerWave; i++) {
    const block = document.createElement('div');
    block.classList.add('block', 'enemy');
    block.innerHTML = '👾';
    block.dataset.hp = '20';
    block.style.top = '0px';
    lanes[2].appendChild(block);
    addEnemyHealthBar(block);
    animateBlock(block, 2);
  }
}

function spawnSoldiers() {
  for (let i = 0; i < CONFIG.spawn.soldiersPerWave; i++) {
    const block = document.createElement('div');
    block.classList.add('block', 'soldier');
    block.textContent = 'SOLDADO';
    block.style.top = '0px';
    lanes[0].appendChild(block);
    animateBlock(block, 0);
  }
}

function spawnWeapon() {
  for (let i = 0; i < CONFIG.spawn.weaponsPerWave; i++) {
    const block = document.createElement('div');
    block.classList.add('block', 'weapon');
    block.textContent = 'ARMA';
    block.style.top = '0px';
    lanes[1].appendChild(block);
    animateBlock(block, 1);
  }
}

function addEnemyHealthBar(enemy) {
  const bar = document.createElement('div');
  bar.className = 'enemy-health';
  const fill = document.createElement('div');
  fill.className = 'enemy-health-fill';
  bar.appendChild(fill);
  enemy.appendChild(bar);
}

function animateBlock(block, laneIndex) {
  let top = 0;
  function animate() {
    top += 2;
    block.style.top = top + 'px';

    const blockRect = block.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      top >= 750 &&
      laneIndex === currentLane &&
      blockRect.bottom >= playerRect.top &&
      blockRect.top <= playerRect.bottom
    ) {
      if (block.classList.contains('soldier')) {
        soldiers++;
        document.getElementById('soldiers').textContent = soldiers;
        const soldierSprite = document.createElement('div');
        soldierSprite.classList.add('player', 'soldier');
        soldierSprite.innerText = 'S';
        gameContainer.appendChild(soldierSprite);
        soldierElements.push(soldierSprite);
        updatePlayerPosition();
      } else if (block.classList.contains('weapon')) {
        weapons++;
        weaponDamage = 10;
        document.getElementById('weapons').textContent = weapons;
      }
      block.remove();
      return;
    }

    if (block.classList.contains('enemy') && top % 60 === 0 && currentLane === 2) {
      spawnEnemyBullet();
    }

    if (top < 800) requestAnimationFrame(animate);
    else block.remove();
  }
  requestAnimationFrame(animate);
}

function spawnEnemyBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('enemy-bullet');
  bullet.textContent = '•';
  bullet.style.top = '100px';
  bullet.style.left = `${player.offsetLeft + 10}px`;
  gameContainer.appendChild(bullet);

  let top = 100;
  function moveBullet() {
    top += 8;
    bullet.style.top = top + 'px';

    const bulletRect = bullet.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      bulletRect.bottom >= playerRect.top &&
      bulletRect.top <= playerRect.bottom &&
      currentLane === 2
    ) {
      health -= 50;
      document.getElementById('health').style.width = (health / 1000 * 100) + '%';
      bullet.remove();
      return;
    }

    if (top < 800) requestAnimationFrame(moveBullet);
    else bullet.remove();
  }
  requestAnimationFrame(moveBullet);
}

function shootFromSoldiers() {
  if (soldiers === 0 || currentLane !== 2) return;

  soldierElements.forEach(soldier => {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.textContent = '|';
    bullet.style.left = soldier.style.left;
    bullet.style.bottom = soldier.style.bottom;
    lanes[2].appendChild(bullet);

    // efeito de tiro no soldado
    soldier.style.transform = 'scale(1.2)';
    setTimeout(() => soldier.style.transform = 'scale(1)', 100);

    let bottom = parseInt(bullet.style.bottom);
    function animateBullet() {
      bottom += 10;
      bullet.style.bottom = bottom + 'px';

      const enemies = lanes[2].querySelectorAll('.enemy');
      enemies.forEach(enemy => {
        const enemyRect = enemy.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();

        if (bulletRect.top <= enemyRect.bottom && bulletRect.bottom >= enemyRect.top) {
          let hp = parseInt(enemy.dataset.hp);
          hp -= weaponDamage;
          enemy.dataset.hp = hp;

          const fill = enemy.querySelector('.enemy-health-fill');
          if (fill) fill.style.width = (hp / 20 * 100) + '%';

          // sangue
          const blood = document.createElement('div');
          blood.className = 'blood-splash';
          blood.textContent = '*';
          blood.style.left = bullet.style.left;
          blood.style.top = enemy.style.top;
          lanes[2].appendChild(blood);
          setTimeout(() => blood.remove(), 600);

          if (hp <= 0) {
            enemy.remove();
            score += 10;
            document.getElementById('score').textContent = score;
          }
          bullet.remove();
        }
      });

      if (bottom < 800) requestAnimationFrame(animateBullet);
      else bullet.remove();
    }
    requestAnimationFrame(animateBullet);
  });
}

// INTERVALOS
setInterval(spawnEnemies, CONFIG.timing.enemyWave);
setInterval(spawnSoldiers, CONFIG.timing.soldierWave);
setInterval(spawnWeapon, CONFIG.timing.weaponWave);
setInterval(shootFromSoldiers, CONFIG.timing.shootInterval);

// CONTROLE
document.addEventListener('keydown', e => {
  if (e.key === 'a' && currentLane > 0) {
    currentLane--;
    updatePlayerPosition();
  }
  if (e.key === 'd' && currentLane < 2) {
    currentLane++;
    updatePlayerPosition();
  }
});
