document.addEventListener('DOMContentLoaded', () => {
    // Game State
    const state = {
        round: 1,
        maxRounds: 5,
        score: 0,
        targetColor: { r: 0, g: 0, b: 0 },
        targetPos: { x: 0, y: 0 }, // Store target position relative to canvas center
        selectedColor: null,
        selectedPos: { x: 0, y: 0 },
        isGameActive: true,
        timer: null,
        timeLeft: 60,
        tutorialOrigin: null,
        isPaused: false
    };

    // DOM Elements
    const elements = {
        roundDisplay: document.getElementById('round-display'),
        scoreDisplay: document.getElementById('score-display'),
        timerDisplay: document.getElementById('timer-display'),
        targetColor: document.getElementById('target-color'),
        canvas: document.getElementById('color-wheel'),
        selectionIndicator: document.getElementById('selection-indicator'),
        targetIndicator: document.getElementById('target-indicator'),
        lineConnector: document.getElementById('line-connector'),
        guessBtn: document.getElementById('guess-btn'),
        // Sidebar Elements
        resultPanel: document.getElementById('result-panel'),
        placeholderPanel: document.getElementById('placeholder-panel'),
        resultTitle: document.getElementById('result-title'),
        resultTarget: document.getElementById('result-target'),
        resultGuess: document.getElementById('result-guess'),
        resultDistance: document.getElementById('result-distance'),
        resultPoints: document.getElementById('result-points'),
        nextRoundBtn: document.getElementById('next-round-btn'),
        // Game Over Overlay
        gameOverOverlay: document.getElementById('game-over-overlay'),
        restartBtn: document.getElementById('restart-btn'),
        restartBtn: document.getElementById('restart-btn'),
        finalScore: document.getElementById('final-score'),
        // Start Overlay
        startGameOverlay: document.getElementById('start-game-overlay'),
        startGameBtn: document.getElementById('start-game-btn'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        // Tutorial Overlay
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        // Tutorial Overlay
        howToPlayOverlay: document.getElementById('how-to-play-overlay'),
        closeTutorialBtn: document.getElementById('close-tutorial-btn'),
        ingameHelpBtn: document.getElementById('ingame-help-btn')
    };

    const ctx = elements.canvas.getContext('2d');

    // Initialize Game
    initGame();

    function initGame() {
        drawColorWheel();
        setupEventListeners();
        // Don't start game automatically
    }

    function startNewGame() {
        state.round = 1;
        state.score = 0;
        state.isGameActive = true;
        updateUI();
        startRound();
        elements.gameOverOverlay.classList.add('hidden');
        elements.startGameOverlay.classList.add('hidden');
    }

    function startTimer() {
        clearInterval(state.timer);
        state.timeLeft = 60;
        elements.timerDisplay.textContent = state.timeLeft;

        state.timer = setInterval(() => {
            if (state.isPaused) return;

            state.timeLeft--;
            elements.timerDisplay.textContent = state.timeLeft;

            if (state.timeLeft <= 0) {
                handleTimeUp();
            }
        }, 1000);
    }

    function handleTimeUp() {
        clearInterval(state.timer);
        state.isGameActive = false; // Prevent clicks

        // Auto-select a dummy position (center) or just show result with 0 points
        // We'll just show the result panel directly

        const points = 0;
        const distance = 0; // Or max distance? Let's say 0 distance but 0 points to indicate fail

        // We need to show where the target was
        // We can simulate a "guess" at the center or just not show a guess indicator
        // Let's show the target indicator at least

        showCorrectLocationForTimeout();

        elements.resultTarget.style.backgroundColor = `rgb(${state.targetColor.r}, ${state.targetColor.g}, ${state.targetColor.b})`;
        elements.resultGuess.style.backgroundColor = 'transparent'; // No guess

        elements.resultDistance.textContent = "N/A";
        elements.resultPoints.textContent = points;
        elements.resultTitle.textContent = "Acabou o Tempo!";

        elements.placeholderPanel.classList.add('hidden');
        elements.resultPanel.classList.remove('hidden');
    }

    function showCorrectLocationForTimeout() {
        // Calculate target position in CSS pixels
        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = rect.width / elements.canvas.width;
        const scaleY = rect.height / elements.canvas.height;

        const targetCssX = state.targetPos.x * scaleX;
        const targetCssY = state.targetPos.y * scaleY;

        elements.targetIndicator.style.display = 'block';
        elements.targetIndicator.style.left = `${targetCssX}px`;
        elements.targetIndicator.style.top = `${targetCssY}px`;

        // No line connector since no guess
    }

    function startRound() {
        state.selectedColor = null;
        elements.selectionIndicator.style.display = 'none';
        elements.targetIndicator.style.display = 'none';
        elements.lineConnector.style.display = 'none';
        elements.guessBtn.disabled = true;

        // Reset Sidebar
        elements.resultPanel.classList.add('hidden');
        elements.placeholderPanel.classList.remove('hidden');

        // Generate random target color
        const targetData = generateRandomColor();
        state.targetColor = targetData.rgb;
        state.targetPos = targetData.pos;

        elements.targetColor.style.backgroundColor = `rgb(${state.targetColor.r}, ${state.targetColor.g}, ${state.targetColor.b})`;

        updateUI();
        startTimer();
    }

    function drawColorWheel() {
        const width = elements.canvas.width;
        const height = elements.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2;

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    const angle = Math.atan2(dy, dx);
                    const hue = (angle + Math.PI) / (Math.PI * 2); // 0 to 1
                    const saturation = distance / radius;

                    const [r, g, b] = hsvToRgb(hue, saturation, 1);

                    const index = (y * width + x) * 4;
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function setupEventListeners() {
        elements.canvas.addEventListener('click', handleCanvasClick);
        elements.guessBtn.addEventListener('click', handleGuess);
        elements.nextRoundBtn.addEventListener('click', nextRound);
        elements.nextRoundBtn.addEventListener('click', nextRound);
        elements.restartBtn.addEventListener('click', startNewGame);
        elements.startGameBtn.addEventListener('click', startNewGame);

        elements.startGameBtn.addEventListener('click', startNewGame);

        elements.howToPlayBtn.addEventListener('click', () => showTutorial('start'));
        elements.ingameHelpBtn.addEventListener('click', () => showTutorial('game'));
        elements.closeTutorialBtn.addEventListener('click', hideTutorial);
    }

    function showTutorial(origin) {
        state.tutorialOrigin = origin;
        elements.howToPlayOverlay.classList.remove('hidden');

        if (origin === 'start') {
            elements.startGameOverlay.classList.add('hidden');
        } else if (origin === 'game') {
            state.isPaused = true;
        }
    }

    function hideTutorial() {
        elements.howToPlayOverlay.classList.add('hidden');

        if (state.tutorialOrigin === 'start') {
            elements.startGameOverlay.classList.remove('hidden');
        } else if (state.tutorialOrigin === 'game') {
            state.isPaused = false;
        }
    }

    function handleCanvasClick(e) {
        if (!state.isGameActive) return;

        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = elements.canvas.width / rect.width;
        const scaleY = elements.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Check if click is within circle
        const centerX = elements.canvas.width / 2;
        const centerY = elements.canvas.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance <= elements.canvas.width / 2) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            state.selectedColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
            state.selectedPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            // Update indicator
            elements.selectionIndicator.style.display = 'block';
            elements.selectionIndicator.style.left = `${state.selectedPos.x}px`;
            elements.selectionIndicator.style.top = `${state.selectedPos.y}px`;

            elements.guessBtn.disabled = false;
        }
    }

    function handleGuess() {
        if (!state.selectedColor) return;

        clearInterval(state.timer);

        const distance = calculateColorDistance(state.targetColor, state.selectedColor);
        const points = calculatePoints(distance);

        state.score += points;

        showRoundResult(distance, points);
        showCorrectLocation();
    }

    function showCorrectLocation() {
        // Calculate target position in CSS pixels
        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = rect.width / elements.canvas.width;
        const scaleY = rect.height / elements.canvas.height;

        // We need to convert the stored targetPos (which should be canvas coords) to CSS coords
        const targetCssX = state.targetPos.x * scaleX;
        const targetCssY = state.targetPos.y * scaleY;

        elements.targetIndicator.style.display = 'block';
        elements.targetIndicator.style.left = `${targetCssX}px`;
        elements.targetIndicator.style.top = `${targetCssY}px`;

        // Draw line
        const startX = state.selectedPos.x;
        const startY = state.selectedPos.y;
        const endX = targetCssX;
        const endY = targetCssY;

        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        elements.lineConnector.style.width = `${length}px`;
        elements.lineConnector.style.left = `${startX}px`;
        elements.lineConnector.style.top = `${startY}px`;
        elements.lineConnector.style.transform = `rotate(${angle}deg)`;
        elements.lineConnector.style.display = 'block';
    }

    function showRoundResult(distance, points) {
        elements.resultTarget.style.backgroundColor = `rgb(${state.targetColor.r}, ${state.targetColor.g}, ${state.targetColor.b})`;
        elements.resultGuess.style.backgroundColor = `rgb(${state.selectedColor.r}, ${state.selectedColor.g}, ${state.selectedColor.b})`;

        elements.resultDistance.textContent = distance.toFixed(1);
        elements.resultPoints.textContent = points;

        // Dynamic title based on score
        if (points >= 4500) elements.resultTitle.textContent = "Perfeito!";
        else if (points >= 3000) elements.resultTitle.textContent = "Ótimo!";
        else if (points >= 1000) elements.resultTitle.textContent = "Bom";
        else elements.resultTitle.textContent = "Errou feio";

        // Toggle Sidebar Panels
        elements.placeholderPanel.classList.add('hidden');
        elements.resultPanel.classList.remove('hidden');
    }

    function nextRound() {
        if (state.round >= state.maxRounds) {
            endGame();
        } else {
            state.round++;
            startRound();
        }
    }

    function endGame() {
        state.isGameActive = false;
        elements.finalScore.textContent = state.score;
        elements.gameOverOverlay.classList.remove('hidden');
    }

    // Helpers
    function generateRandomColor() {
        // Generate HSV
        const h = Math.random(); // 0 to 1
        const s = Math.random(); // 0 to 1 (full range now to match wheel)
        const v = 1; // Always 1 to match wheel surface

        const [r, g, b] = hsvToRgb(h, s, v);

        // Calculate position on canvas
        const width = elements.canvas.width;
        const height = elements.canvas.height;
        const radius = width / 2;
        const centerX = width / 2;
        const centerY = height / 2;

        // Angle from hue
        // hue = (angle + Math.PI) / (Math.PI * 2)
        // angle = hue * 2PI - PI
        const angle = h * Math.PI * 2 - Math.PI;

        // Distance from saturation
        // saturation = distance / radius
        const distance = s * radius;

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        return {
            rgb: { r, g, b },
            pos: { x, y }
        };
    }

    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function calculateColorDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2)
        );
    }

    function calculatePoints(distance) {
        // Max distance is roughly 441 (sqrt(255^2 * 3))
        // We want 5000 points for distance 0
        // Exponential drop off
        const score = 5000 * Math.exp(-distance / 50);
        return Math.round(score);
    }

    function updateUI() {
        elements.roundDisplay.textContent = `${state.round}/${state.maxRounds}`;
        elements.scoreDisplay.textContent = state.score;
    }
});
