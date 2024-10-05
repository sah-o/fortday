const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    speed: 5,
    health: 100,
    ammo: 30,
    grenades: 3,
    deaths: 0
};

const bots = [];
const bullets = [];
const buildings = [];
const weapons = [];
const grenades = [];

const keys = {};

function spawnBot() {
    bots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 30,
        height: 30,
        speed: 2,
        health: 100
    });
}

function spawnWeapon() {
    weapons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 20,
        height: 20
    });
}

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBots() {
    ctx.fillStyle = 'red';
    bots.forEach(bot => {
        ctx.fillRect(bot.x, bot.y, bot.width, bot.height);
    });
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
}

function drawBuildings() {
    ctx.fillStyle = 'gray';
    buildings.forEach(building => {
        ctx.fillRect(building.x, building.y, building.width, building.height);
    });
}

function drawWeapons() {
    ctx.fillStyle = 'green';
    weapons.forEach(weapon => {
        ctx.fillRect(weapon.x, weapon.y, weapon.width, weapon.height);
    });
}

function drawGrenades() {
    ctx.fillStyle = 'orange';
    grenades.forEach(grenade => {
        ctx.beginPath();
        ctx.arc(grenade.x, grenade.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Health: ${player.health}`, 10, 30);
    ctx.fillText(`Ammo: ${player.ammo}`, 10, 60);
    ctx.fillText(`Grenades: ${player.grenades}`, 10, 90);
    ctx.fillText(`Deaths: ${player.deaths}`, 10, 120);
}

function movePlayer() {
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
}

function moveBots() {
    bots.forEach(bot => {
        const dx = player.x - bot.x;
        const dy = player.y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        bot.x += (dx / distance) * bot.speed;
        bot.y += (dy / distance) * bot.speed;
    });
}

function moveBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
    });
}

function moveGrenades() {
    grenades.forEach(grenade => {
        grenade.x += grenade.dx;
        grenade.y += grenade.dy;
        grenade.timer--;
        if (grenade.timer <= 0) {
            explodeGrenade(grenade);
        }
    });
}

function shoot() {
    if (player.ammo > 0) {
        const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            dx: Math.cos(angle) * 10,
            dy: Math.sin(angle) * 10
        });
        player.ammo--;
    }
}

function throwGrenade() {
    if (player.grenades > 0) {
        const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
        grenades.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            dx: Math.cos(angle) * 5,
            dy: Math.sin(angle) * 5,
            timer: 60
        });
        player.grenades--;
    }
}

function explodeGrenade(grenade) {
    bots.forEach(bot => {
        const dx = bot.x - grenade.x;
        const dy = bot.y - grenade.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            bot.health -= 50;
        }
    });
    grenades.splice(grenades.indexOf(grenade), 1);
}

function build() {
    buildings.push({
        x: player.x + player.width,
        y: player.y,
        width: 50,
        height: 100
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        bots.forEach((bot, botIndex) => {
            if (bullet.x < bot.x + bot.width &&
                bullet.x + 5 > bot.x &&
                bullet.y < bot.y + bot.height &&
                bullet.y + 5 > bot.y) {
                bot.health -= 10;
                bullets.splice(bulletIndex, 1);
                if (bot.health <= 0) {
                    bots.splice(botIndex, 1);
                    spawnBot();
                }
            }
        });
    });

    weapons.forEach((weapon, index) => {
        if (player.x < weapon.x + weapon.width &&
            player.x + player.width > weapon.x &&
            player.y < weapon.y + weapon.height &&
            player.y + player.height > weapon.y) {
            player.ammo += 30;
            weapons.splice(index, 1);
        }
    });

    bots.forEach(bot => {
        if (player.x < bot.x + bot.width &&
            player.x + player.width > bot.x &&
            player.y < bot.y + bot.height &&
            player.y + player.height > bot.y) {
            player.health -= 1;
            if (player.health <= 0) {
                player.deaths++;
                if (player.deaths >= 3) {
                    gameOver();
                } else {
                    resetPlayer();
                }
            }
        }
    });
}

function resetPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 100;
    player.ammo = 30;
    player.grenades = 3;
}

function gameOver() {
    alert('Game Over! Click OK to play again.');
    player.deaths = 0;
    resetPlayer();
    bots.length = 0;
    bullets.length = 0;
    buildings.length = 0;
    weapons.length = 0;
    grenades.length = 0;
    for (let i = 0; i < 5; i++) {
        spawnBot();
        spawnWeapon();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveBots();
    moveBullets();
    moveGrenades();
    checkCollisions();

    drawPlayer();
    drawBots();
    drawBullets();
    drawBuildings();
    drawWeapons();
    drawGrenades();
    drawHUD();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') build();
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;
});

let mouseX, mouseY;
canvas.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('click', shoot);
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    throwGrenade();
});

for (let i = 0; i < 5; i++) {
    spawnBot();
    spawnWeapon();
}

gameLoop();
