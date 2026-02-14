// Elementos del DOM
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playMusicBtn = document.getElementById("playMusic");
const startScreen = document.getElementById("startScreen");
const finalScreen = document.getElementById("finalScreen");
const gameContainer = document.getElementById("gameContainer");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelMessage = document.getElementById("levelMessage");
const levelNumber = document.getElementById("levelNumber");
const bgMusic = document.getElementById("bgMusic");

// Configuración del canvas
canvas.width = 350;
canvas.height = 500;

// Variables del juego
let currentLevel = 0;
let isDragging = false;
let particles = [];
let trail = [];
let gameRunning = false;
let animationId = null;
let levelChanging = false;

// Jugador
let player = {
    x: 20,
    y: 20,
    radius: 15,
    color: "#ff4e8a"
};

    // Niveles del juego
const levels = [
    {
        name: "Nivel 1 - La Rosa 🌹",
        walls: [
            { x: 0, y: 100, w: 250, h: 20 },
            { x: 100, y: 200, w: 250, h: 20 },
            { x: 0, y: 300, w: 250, h: 20 }
        ],
        goal: { x: 290, y: 430, w: 40, h: 40, emoji: "🌹" }
    },
    {
        name: "Nivel 2 - El Corazón 💖",
        walls: [
            { x: 50, y: 100, w: 300, h: 20 },
            { x: 0, y: 200, w: 250, h: 20 },
            { x: 100, y: 300, w: 250, h: 20 }
        ],
        goal: { x: 290, y: 20, w: 40, h: 40, emoji: "💖" }
    },
    {
        name: "Nivel 3 - El Anillo 💍",
        walls: [
            { x: 0, y: 100, w: 300, h: 20 },
            { x: 50, y: 200, w: 300, h: 20 },
            { x: 0, y: 300, w: 300, h: 20 },
            { x: 50, y: 400, w: 250, h: 20 }
        ],
        goal: { x: 20, y: 430, w: 50, h: 50, emoji: "💍" }
    }
];

// Clase para partículas
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 78, 138, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Función principal de dibujo
function draw() {
    // Verificar que el nivel sea válido
    if (currentLevel >= levels.length || !gameRunning) {
        return;
    }

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = levels[currentLevel];

    // Dibujar trail (estela)
    trail.forEach((point, index) => {
        const alpha = (index / trail.length) * 0.3;
        ctx.fillStyle = `rgba(255, 78, 138, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, player.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });

    // Dibujar paredes con gradiente
    level.walls.forEach(w => {
        const gradient = ctx.createLinearGradient(w.x, w.y, w.x + w.w, w.y + w.h);
        gradient.addColorStop(0, "#ff4e8a");
        gradient.addColorStop(1, "#ff6ba0");
        ctx.fillStyle = gradient;
        ctx.shadowColor = "rgba(255, 78, 138, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.shadowBlur = 0;
    });

    // Dibujar área del objetivo con efecto pulsante (solo borde, sin relleno)
    const pulseSize = Math.sin(Date.now() / 200) * 3;
    ctx.strokeStyle = "rgba(255, 105, 180, 0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        level.goal.x - pulseSize / 2,
        level.goal.y - pulseSize / 2,
        level.goal.w + pulseSize,
        level.goal.h + pulseSize
    );

    // Dibujar emoji del objetivo SIN fondo
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(level.goal.emoji, level.goal.x + level.goal.w / 2, level.goal.y + level.goal.h / 2);

    // Dibujar jugador con efecto de brillo
    const gradient = ctx.createRadialGradient(
        player.x, player.y, 0,
        player.x, player.y, player.radius
    );
    gradient.addColorStop(0, "#ff9ecf");
    gradient.addColorStop(0.4, "#ff4e8a");
    gradient.addColorStop(1, "#cc3e6f");
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(255, 78, 138, 0.8)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Borde del jugador
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Punto brillante en el jugador
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(player.x - 4, player.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar partículas
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

// Actualizar trail
function updateTrail() {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > 15) {
        trail.shift();
    }
}

// Reiniciar jugador
function resetPlayer() {
    player.x = 20;
    player.y = 20;
    trail = [];
    
    // Crear partículas de "impacto"
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(player.x, player.y));
    }
}

// Detección de colisiones círculo-rectángulo
function circleRectCollision(circle, rect) {
    let testX = circle.x;
    let testY = circle.y;

    if (circle.x < rect.x) testX = rect.x;
    else if (circle.x > rect.x + rect.w) testX = rect.x + rect.w;

    if (circle.y < rect.y) testY = rect.y;
    else if (circle.y > rect.y + rect.h) testY = rect.y + rect.h;

    let distX = circle.x - testX;
    let distY = circle.y - testY;

    return (distX * distX + distY * distY) <= circle.radius * circle.radius;
}

// Verificar colisiones
function checkCollisions() {
    // Verificar que el nivel sea válido
    if (currentLevel >= levels.length || !gameRunning || levelChanging) {
        return;
    }

    const level = levels[currentLevel];

    // Colisión con paredes
    for (let w of level.walls) {
        if (circleRectCollision(player, w)) {
            resetPlayer();
            return;
        }
    }

    // Colisión con objetivo
    if (circleRectCollision(player, level.goal)) {
        levelChanging = true;
        nextLevel();
    }
}

// Pasar al siguiente nivel
function nextLevel() {
    // Crear partículas de celebración
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(player.x, player.y));
    }

    // Verificar si es el último nivel
    if (currentLevel === levels.length - 1) {
        setTimeout(endGame, 500);
        return;
    }

    // Pasar al siguiente nivel
    currentLevel++;
    resetPlayer();
    updateLevelInfo();
    showLevelMessage(levels[currentLevel].name);
    
    // Resetear bandera después de un pequeño delay
    setTimeout(() => {
        levelChanging = false;
    }, 100);
}

// Actualizar información del nivel
function updateLevelInfo() {
    levelNumber.textContent = `Nivel ${currentLevel + 1} de ${levels.length}`;
}

// Mostrar mensaje de nivel
function showLevelMessage(text) {
    levelMessage.textContent = text;
    levelMessage.style.opacity = 1;
    setTimeout(() => {
        levelMessage.style.opacity = 0;
    }, 2000);
}

// Finalizar juego
function endGame() {
    gameRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    gameContainer.classList.remove("active");
    finalScreen.classList.add("active");
}

// Obtener posición del mouse/touch
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        // Es un evento touch
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touch que acaba de terminar
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        // Es un evento de mouse
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}


// Iniciar arrastre
function startDrag(e) {
    if (!gameRunning) return;
    
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - player.x;
    const dy = pos.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // En móvil (touch), permitir arrastrar el círculo hacia donde tocas
    // En PC (mouse), solo si haces click sobre el círculo
    if (e.type.includes('touch')) {
        // Touch: siempre permitir arrastre
        isDragging = true;
        canvas.style.cursor = "grabbing";
    } else {
        // Mouse: solo si haces click sobre el círculo
        if (distance <= player.radius + 10) {
            isDragging = true;
            canvas.style.cursor = "grabbing";
        }
    }
}

// Arrastrar
function drag(e) {
    if (!isDragging || !gameRunning) return;
    e.preventDefault();

    const pos = getMousePos(e);

    // Guardar posición anterior
    const oldX = player.x;
    const oldY = player.y;

    // Calcular nueva posición
    const newX = Math.max(player.radius, Math.min(canvas.width - player.radius, pos.x));
    const newY = Math.max(player.radius, Math.min(canvas.height - player.radius, pos.y));

    // Aplicar nueva posición temporalmente
    player.x = newX;
    player.y = newY;

    // Verificar si la nueva posición choca con paredes
    const level = levels[currentLevel];
    for (let w of level.walls) {
        if (circleRectCollision(player, w)) {
            // Si choca, volver a la posición anterior
            player.x = oldX;
            player.y = oldY;
            return;
        }
    }

    // Si no choca, mantener la nueva posición
    updateTrail();
    
    // Crear partículas mientras se mueve
    if (Math.random() < 0.3) {
        particles.push(new Particle(player.x, player.y));
    }

    // Verificar colisión con objetivo
    if (circleRectCollision(player, level.goal)) {
        levelChanging = true;
        nextLevel();
    }
}

// Detener arrastre
function stopDrag() {
    isDragging = false;
    canvas.style.cursor = "pointer";
}

// Loop de animación
function gameLoop() {
    if (gameRunning) {
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Event Listeners para mouse
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

// Event Listeners para touch (móvil)
canvas.addEventListener("touchstart", startDrag, { passive: false });
canvas.addEventListener("touchmove", drag, { passive: false });
canvas.addEventListener("touchend", stopDrag);
canvas.addEventListener("touchcancel", stopDrag);

// Botón de inicio
startBtn.addEventListener("click", () => {
    currentLevel = 0;
    particles = [];
    trail = [];
    gameRunning = true;
    levelChanging = false;
    startScreen.classList.remove("active");
    gameContainer.classList.add("active");
    resetPlayer();
    updateLevelInfo();
    showLevelMessage(levels[currentLevel].name);
    gameLoop();
});

// Botón de reinicio
restartBtn.addEventListener("click", () => {
    currentLevel = 0;
    particles = [];
    trail = [];
    gameRunning = false;
    levelChanging = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    finalScreen.classList.remove("active");
    startScreen.classList.add("active");
});

// Botón de música
let musicPlaying = false;
playMusicBtn.addEventListener("click", () => {
    if (!musicPlaying) {
        bgMusic.play().then(() => {
            musicPlaying = true;
            playMusicBtn.textContent = "Pausar música 🎵";
        }).catch(err => {
            console.log("Error al reproducir música:", err);
        });
    } else {
        bgMusic.pause();
        musicPlaying = false;
        playMusicBtn.textContent = "Activar música 🎶";
    }
});

// Prevenir zoom en móviles al hacer doble tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
