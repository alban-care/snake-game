// Define Html elements
const board = document.querySelector(".board");
const scoreEl = document.querySelector(".panel .score .value");
const instructionEl = document.querySelector(".instructions .text span");
const highScoreEl = document.querySelector(".panel .high-score .value");

// Define game constants
const GRID_SIZE = 20;

// Define game variables
let snake = { body: [{ x: 10, y: 10 }] };
let frog = generateRandomCoord(1, GRID_SIZE);
let direction = "left";
let gameLoopInterval;
let speed = 200;
let started = false;
let paused = false;
let lost = false;
let score = 0;
let highScore = 0;

// Game function
function draw() {
  board.innerHTML = "";
  const ground = drawGround();
  drawSnake(ground);
  drawFrog(ground);
}

function drawGround() {
  const ground = createEl("div", "ground");
  ground.style.display = "grid";
  ground.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1rem)`;
  ground.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1rem)`;
  board.appendChild(ground);

  return ground;
}

function drawSnake(ground) {
  snake.body.forEach((part) => {
    const snakePart = createEl("div", "snake");
    setGridPosition(snakePart, part);
    ground.appendChild(snakePart);
  });
}

function drawFrog(ground) {
  const frogPart = createEl("div", "frog");
  const isOnSnake = preventFrogSpawnOnSnake(frog, snake);

  if (isOnSnake) {
    console.log("frog is on snake");
    frog = generateRandomCoord(1, GRID_SIZE);
    drawFrog(ground);
    return;
  }

  setGridPosition(frogPart, frog);
  ground.appendChild(frogPart);
}

function move(snake, direction) {
  const head = snake.body[0];
  switch (direction) {
    case "left":
      snake.body.unshift({ x: head.x - 1, y: head.y });
      break;
    case "right":
      snake.body.unshift({ x: head.x + 1, y: head.y });
      break;
    case "up":
      snake.body.unshift({ x: head.x, y: head.y - 1 });
      break;
    case "down":
      snake.body.unshift({ x: head.x, y: head.y + 1 });
      break;
  }

  snake.body.pop();
}

function eat(snake, frog) {
  const head = snake.body[0];
  return head.x === frog.x && head.y === frog.y;
}

function grow(snake) {
  const tail = snake.body[snake.body.length - 1];
  snake.body.push(tail);
}

function increaseSpeed() {
  if (score > 0 && score % 5 === 0 && speed > 50) {
    speed -= 10;
  }
}

function updateSpeed() {
  increaseSpeed();

  clearInterval(gameLoopInterval);

  gameLoopInterval = setInterval(() => {
    gameLoop();
  }, speed);
}

function outOfBounds(snake) {
  const head = snake.body[0];
  return head.x < 0 || head.x > GRID_SIZE || head.y < 0 || head.y > GRID_SIZE;
}

function hitSelf(snake) {
  const head = snake.body[0];
  return snake.body
    .slice(1)
    .some((part) => part.x === head.x && part.y === head.y);
}

function gameOver(snake) {
  return outOfBounds(snake) || hitSelf(snake);
}

function initializeGame() {
  snake = { body: [{ x: 10, y: 10 }] };
  frog = generateRandomCoord(1, GRID_SIZE);
  direction = "left";
  gameLoopInterval = null;
  speed = 200;
  started = false;
  paused = false;
  lost = false;
  score = 0;
}

// Game loop
function gameLoop() {
  move(snake, direction);

  if (eat(snake, frog)) {
    grow(snake);
    frog = generateRandomCoord(1, GRID_SIZE);
    updateSpeed();
    score++;
    updateScore();
  } else if (gameOver(snake)) {
    snake.body.pop();
    clearInterval(gameLoopInterval);
    started = false;
    paused = false;
    lost = true;
    updateHighScore();
    score = 0;
    updateScore();
    updateInstructions();
    return;
  }

  draw();
}

// DOM manipulation
function updateScore() {
  scoreEl.textContent = score;
}

function updateInstructions() {
  if (!started && !paused && !lost) {
    instructionEl.textContent = "start";
  } else if (started && !paused && !lost) {
    instructionEl.textContent = "pause";
  } else if (paused && !started && !lost) {
    instructionEl.textContent = "resume";
  } else if (!started && !paused && lost) {
    instructionEl.textContent = "restart";
  }
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
  }
  score = 0;

  highScoreEl.textContent = highScore;
}

// Event listeners
function handleKeyPress(event) {
  if (event.code === "space" || event.key === " ") {
    if (!started && !paused && !lost) {
      startGame();
      started = true;
    } else if (started && !paused && !lost) {
      clearInterval(gameLoopInterval);
      started = false;
      paused = true;
    } else if (paused && !started && !lost) {
      startGame();
      started = true;
      paused = false;
    } else if (!started && !paused && lost) {
      restartGame();
    }
    updateInstructions();
  } else {
    if (started && !paused && !lost && event.code.includes("Arrow")) {
      switch (event.code) {
        case "ArrowLeft":
          if (direction !== "right") direction = "left";
          break;
        case "ArrowRight":
          if (direction !== "left") direction = "right";
          break;
        case "ArrowUp":
          if (direction !== "down") direction = "up";
          break;
        case "ArrowDown":
          if (direction !== "up") direction = "down";
          break;
      }
    }
  }
}

/* Utils */

/**
 * @name createEL
 * @param {string} tag
 * @param {string} className
 * @returns {HTMLElement} element
 */
function createEl(tag, className) {
  const element = document.createElement(tag);
  element.className = className;

  return element;
}

/**
 * @name setGridPosition
 * @param {HTMLElement} element
 * @param {{x: number, y: number}} position
 * @returns {HTMLElement} element
 */
function setGridPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;

  return element;
}

/**
 * @name generateRandomCoord
 * @param {number} min
 * @param {number} max
 * @returns {x: number, y: number} coordonate
 */
function generateRandomCoord(min, max) {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  return {
    x: getRandomInt(min, max),
    y: getRandomInt(min, max),
  };
}

/**
 * @name preventFrogSpawnOnSnake
 * @param {{x: number, y: number}} frog
 * @param {{body: {x: number, y: number}[]}} snake
 * @returns {boolean}
 */
function preventFrogSpawnOnSnake(frog, snake) {
  return snake.body.some((part) => part.x === frog.x && part.y === frog.y);
}

/**
 * @name pressKeysThrottling
 * @description Throttle keypress event to prevent multiple keypresses
 * @param {function} callback
 * @param {number} delay
 * @returns {function} throttled function
 */
function pressKeysThrottling(callback, delay) {
  let isThrottled = false,
    args,
    context;

  function wrapper() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }

    isThrottled = true;
    callback.apply(this, arguments);

    setTimeout(() => {
      isThrottled = false;
      if (args) {
        wrapper.apply(context, args);
        args = context = null;
      }
    }, delay);
  }

  return wrapper;
}

/* Utils End */

/**
 * @name startGame
 * @returns {void}
 */
function startGame() {
  if (!started) {
    gameLoopInterval = setInterval(() => {
      gameLoop();
    }, speed);

    started = true;
  }
}

function restartGame() {
  initializeGame();
  startGame();
}

// Init
draw();

document.addEventListener(
  "keydown",
  pressKeysThrottling(handleKeyPress, speed)
);
