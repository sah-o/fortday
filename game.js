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

const robots = [];
const bullets = [];
const buildings = [];
const weapons = [];
const grenades = [];

const keys = {};

function spawnRobot() {
    robots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 30,
        height: 30,
        speed: 2,
        health: 50,
        shootCooldown: 0
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

function drawRobots() {
    ctx.fillStyle = 'red';
    robots.forEach(robot => {
        ctx.fillRect(robot.x, robot.y, robot.width, robot.height);
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
    ctx.fillStyle = 'black';
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

function moveRobots() {
    robots.forEach(robot => {
        const dx = player.x - robot.x;
        const dy = player.y - robot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        robot.x += (dx / distance) * robot.speed;
        robot.y += (dy / distance) * robot.speed;

        // Robot shooting
        robot.shootCooldown--;
        if (robot.shootCooldown <= 0) {
            const angle = Math.atan2(player.y - robot.y, player.x - robot.x);
            bullets.push({
                x: robot.x + robot.width / 2,
                y: robot.y + robot.height / 2,
                dx: Math.cos(angle) * 7,
                dy: Math.sin(angle) * 7,
                isRobotBullet: true
            });
            robot.shootCooldown = 60; // Shoot every 60 frames
        }
    });
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove bullets that are off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
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
            dy: Math.sin(angle) * 10,
            isRobotBullet: false
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
    robots.forEach((robot, index) => {
        const dx = robot.x - grenade.x;
        const dy = robot.y - grenade.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            robot.health -= 50;
            if (robot.health <= 0) {
                robots.splice(index, 1);
                spawnRobot();
            }
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
        if (!bullet.isRobotBullet) {
            robots.forEach((robot, robotIndex) => {
                if (bullet.x < robot.x + robot.width &&
                    bullet.x + 5 > robot.x &&
                    bullet.y < robot.y + robot.height &&
                    bullet.y + 5 > robot.y) {
                    robot.health -= 10;
                    bullets.splice(bulletIndex, 1);
                    if (robot.health <= 0) {
                        robots.splice(robotIndex, 1);
                        spawnRobot();
                    }
                }
            });
        } else {
            if (bullet.x < player.x + player.width &&
                bullet.x + 5 > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + 5 > player.y) {
                player.health -= 10;
                bullets.splice(bulletIndex, 1);
                if (player.health <= 0) {
                    player.deaths++;
                    if (player.deaths >= 3) {
                        gameOver();
                    } else {
                        resetPlayer();
                    }
                }
            }
        }
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

    robots.forEach(robot => {
        if (player.x < robot.x + robot.width &&
            player.x + player.width > robot.x &&
            player.y < robot.y + robot.height &&
            player.y + player.height > robot.y) {
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
    robots.length = 0;
    bullets.length = 0;
    buildings.length = 0;
    weapons.length = 0;
    grenades.length = 0;
    for (let i = 0; i < 5; i++) {
        spawnRobot();
        spawnWeapon();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveRobots();
    moveBullets();
    moveGrenades();
    checkCollisions();

    drawPlayer();
    drawRobots();
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
    spawnRobot();
    spawnWeapon();
}

gameLoop();