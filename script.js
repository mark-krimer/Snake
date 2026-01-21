// Importing HTML Elements
const canvasElem = document.getElementById("canvas");
const canvas = canvasElem.getContext("2d");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");

const body = document.querySelector("body");

// Sound Effects
const beep = new Audio("assets/error.mp3");
const chomp = new Audio("assets/chomp.wav");

// Variables
const tiles = 18;
let scale = tiles * 50; // tiles * 50 = 900px
const speed = 125; // ms delay between frames
const winCondition = tiles * tiles; // tiles * tiles (board size)\
let score = 0;
let highscore;
if (localStorage.snakeHighscore) {
	highscore = localStorage.snakeHighscore;
} else {
	highscore = 0;
}

let playSound = true;
let removeTail = true;
let pixels = [];
let loseMessage;
let inputBuffer = [];

// Game state variables
const gameStates = {
	loading: "loading",
	title: "title",
	play: "play",
	lose: "lose",
	win: "win",
};
let currentGameState = gameStates.loading;

let loadingProgress = 0;

// Functions
function setupCanvas() {
	calculateScale();

	canvasElem.width = tiles * scale;
	canvasElem.height = tiles * scale;

	// Disable anti-aliasing
	canvas.imageSmoothingEnabled = false;
	canvasElem.style.imageRendering = "pixelated";
}

function drawPixel(x, y, width = 1, height = 1, colour = "black", type = "wall", merge = false) {
	if (merge) {
		const pixel = new Pixel(x, y, width, height, colour, type);
		pixel.drawSquare();
		return [pixel];
	}

	const created = [];
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const px = x + i;
			const py = y + j;
			const pixel = new Pixel(px, py, 1, 1, colour, type);
			pixel.drawSquare();
			created.push(pixel);
		}
	}
	return created;
}

function drawText(startX, y, content, colour = "black") {
	let text = content.split("");

	for (let i = 0; i < text.length; i++) {
		const pixel = new Pixel(startX + i, y, 1, 1, colour);
		pixel.drawText(text[i]);
	}
}

function drawBoardStatics(borderColour = "black", playColour = "grey", scoreColour = "white") {
	drawPixel(1, 1, tiles, 3, borderColour, "wall");
	drawPixel(1, 4, 1, 15, borderColour, "wall");
	drawPixel(tiles, 4, 1, 15, borderColour, "wall");
	drawPixel(2, tiles, 16, 1, borderColour, "wall");
	drawPixel(2, 4, 16, 14, playColour, "board");
	drawPixel(2, 2, 5, 1, scoreColour, "wall");
	drawPixel(13, 2, 5, 1, scoreColour, "wall");

	drawText(2, 2, `S=${padValue(score, 3)}`, "black");
	drawText(13, 2, `H=${padValue(highscore, 3)}`, "black");
}

function padValue(value, padAmount = 3) {
	let paddedValue = String(value).split("");

	while (paddedValue.length < padAmount) {
		paddedValue.unshift("0");
	}

	return paddedValue.join("");
}

function checkMovementCompatibility(direction, nextDirection) {
	if (direction == "right" && nextDirection == "left") {
		return true;
	}
	if (direction == "left" && nextDirection == "right") {
		return true;
	}
	if (direction == "up" && nextDirection == "down") {
		return true;
	}
	if (direction == "down" && nextDirection == "up") {
		return true;
	}
}

function findPixel(x, y) {
	for (let i = 0; i < pixels.length; i++) {
		const pixel = pixels[i];
		if (pixel.x === x && pixel.y === y && pixel.type != "board") {
			return pixel;
		}
	}
	return undefined;
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function drawLoadingScreen() {
	// Background
	drawPixel(2, 4, 16, 14, "black", "board");

	// Title
	drawText(8, 6, "SNAKE", "white");

	// Loading bar outline
	drawPixel(5, 11, 10, 1, "darkslategrey", "wall");

	// Loading bar fill
	const filled = Math.floor((loadingProgress / 100) * 10);
	if (filled > 0) {
		drawPixel(5, 11, filled, 1, "greenyellow", "wall");
	}

	// Loading text
	drawText(5, 12, `LOADING`);
}

function calculateScale() {
	const padding = 32;
	const usableWidth = window.innerWidth - padding;
	const usableHeight = window.innerHeight - padding;

	const maxScaleX = Math.floor(usableWidth / tiles);
	const maxScaleY = Math.floor(usableHeight / tiles);

	// Use the smaller one to keep it square
	scale = Math.max(10, Math.min(maxScaleX, maxScaleY));
}

function drawTitleScreen() {
	drawPixel(2, 4, 16, 14, "black", "board");

	drawText(8, 6, "SNAKE", "white");

	drawText(5, 11, "PRESS START", "white");
}

function reset() {
	player.segments = [
		new Pixel(7, 5, 1, 1, "green", "snake", false), // head
		new Pixel(6, 5, 1, 1, "green", "snake", false),
		new Pixel(5, 5, 1, 1, "green", "snake", false), // tail
	];
	player.direction = "right";
	player.nextDirection = "right";

	apple.spawnNew();

	score = 0;
	playSound = true;
	inputBuffer = [];
}

function showPopup() {
	popupMessage.innerHTML = loseMessage;
	popup.hidden = false;
}

function hidePopup() {
	popup.hidden = true;
	currentGameState = gameStates.title;
}

// Classes
class Pixel {
	constructor(x, y, width = 1, height = 1, colour = "black", type = "wall", addToPixels = true) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.colour = colour;
		this.type = type;

		if (addToPixels) {
			pixels.push(this);
		}
	}

	drawSquare = function () {
		canvas.fillStyle = this.colour;
		canvas.fillRect((this.x - 1) * scale, (this.y - 1) * scale, this.width * scale, this.height * scale);
	};

	drawText = function (content) {
		canvas.textBaseline = "top";
		canvas.textAlign = "left";
		canvas.fillStyle = this.colour;
		canvas.font = `${scale}px Trebuchet MS`;

		canvas.fillText(content, (this.x - 1) * scale, (this.y - 1) * scale);
	};
}

class Snake {
	constructor() {
		this.segments = [
			new Pixel(7, 5, 1, 1, "#148527", "snake", false), // head
			new Pixel(6, 5, 1, 1, "green", "snake", false),
			new Pixel(5, 5, 1, 1, "green", "snake", false), // tail
		];
		this.direction = "right";
		this.nextDirection = "right";
	}

	draw = function () {
		this.segments.forEach((segment) => {
			segment.drawSquare();
		});
	};

	move = function (removeTailFunc = true) {
		let newHeadX = this.segments[0].x;
		let newHeadY = this.segments[0].y;

		// Setting direction
		if (inputBuffer.length > 0) {
			const proposed = inputBuffer.shift();

			// Reject reverse moves here
			console.log(this.direction, proposed);

			if (!checkMovementCompatibility(this.direction, proposed)) {
				this.nextDirection = proposed;
			}
		}

		this.direction = this.nextDirection;

		// Check collision
		this.checkCollisions();

		// Remove tail
		if (!removeTailFunc) {
			removeTail = true;

			// Checking win condition
			if (this.segments.length + 1 == winCondition) {
				currentGameState = gameStates.win;
			}
		} else {
			this.segments.splice(-1, 1);
		}

		// Add head
		if (this.direction == "right") {
			newHeadX++;
		} else if (this.direction == "left") {
			newHeadX--;
		} else if (this.direction == "down") {
			newHeadY++;
		} else if (this.direction == "up") {
			newHeadY--;
		}

		console.log((this.segments[0].colour = "green"));
		this.segments.splice(0, 0, new Pixel(newHeadX, newHeadY, 1, 1, "#0a9740ff", "snake"));
	};

	checkCollisions = function () {
		// Predict next head position
		let headX = this.segments[0].x;
		let headY = this.segments[0].y;

		if (this.direction === "right") {
			headX++;
		} else if (this.direction === "left") {
			headX--;
		} else if (this.direction === "down") {
			headY++;
		} else if (this.direction === "up") {
			headY--;
		}

		// Checking self collision
		for (let i = this.segments.length - 1; i > 0; i--) {
			if (this.segments[i].x == headX && this.segments[i].y == headY) {
				currentGameState = gameStates.lose;
				loseMessage = "You hit yourself!";
			}
		}

		// Determining contact pixel
		let contactPixel = findPixel(headX, headY);

		if (contactPixel == undefined) {
			return;
		}

		// Wall
		if (contactPixel.type == "wall") {
			currentGameState = gameStates.lose;
			loseMessage = "You hit the wall!";
		}

		// Apple
		if (contactPixel.type == "apple") {
			removeTail = false;
			apple.spawnNew();
		}
	};
}

class Apple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	draw = function () {
		const applePixel = new Pixel(this.x, this.y, 1, 1, "red", "apple", true);
		applePixel.drawSquare();
	};

	spawnNew = function () {
		let valid = false;
		let spawnX, spawnY;

		// Invalid Apple spawn
		while (!valid) {
			spawnX = getRandomNumber(2, 17);
			spawnY = getRandomNumber(4, 17);

			valid = true;

			for (const segment of player.segments) {
				if (spawnX === segment.x && spawnY === segment.y) {
					console.log("!!! Attempted to spawn in snake");

					valid = false;
					break;
				}
			}
		}

		// Spawning new Apple
		console.log("Successfully spawned");
		if (currentGameState === gameStates.play) {
			chomp.play();
		}
		apple = null;
		apple = new Apple(spawnX, spawnY);

		// Update score
		score++;
		if (score > highscore) {
			highscore = score;
			localStorage.snakeHighscore = highscore;
		}
		return;
	};
}

// Game Loop
const player = new Snake();

let apple = new Apple(getRandomNumber(2, 17), getRandomNumber(4, 17));

// Intervals
// Loading
const loadingInterval = setInterval(() => {
	canvas.clearRect(0, 0, canvasElem.width, canvasElem.height);
	pixels = [];

	drawBoardStatics("darkslategrey", "black", "darkseagreen");

	loadingProgress += getRandomNumber(5, 15);

	if (loadingProgress >= 100) {
		loadingProgress = 100;
		clearInterval(loadingInterval);
		currentGameState = gameStates.title;
	}

	drawLoadingScreen();
}, 120);

// Main Gameloop
setInterval(() => {
	// Title screen game state
	if (currentGameState === gameStates.title) {
		drawTitleScreen();
		reset();
		return;
	}

	// Playing game state
	if (currentGameState === gameStates.play) {
		player.move(removeTail);

		if (currentGameState === gameStates.lose || currentGameState === gameStates.win) {
			return;
		}

		// Clear canvas
		canvas.clearRect(0, 0, canvasElem.width, canvasElem.height);
		pixels = [];

		// Draw border
		drawBoardStatics("darkslategrey", "greenyellow", "darkseagreen");

		apple.draw();
		player.draw();
	}

	if (currentGameState === gameStates.lose) {
		if (playSound == true) {
			beep.play();
			playSound = false;
		}
		showPopup();
	}

	if (currentGameState === gameStates.win) {
		loseMessage = "You Won!!";
		showPopup();
	}
}, speed);

// Event Listeners
window.onload = function () {
	setupCanvas();
};

document.getElementById("popupOk").onclick = hidePopup;
document.getElementById("popupClose").onclick = hidePopup;

// Player Inputs
const directions = {
	37: "left",
	65: "left",
	38: "up",
	87: "up",
	39: "right",
	68: "right",
	40: "down",
	83: "down",
};

body.addEventListener("keydown", function (e) {
	// Press start
	if (currentGameState === gameStates.title) {
		currentGameState = gameStates.play;
		return;
	}

	if (currentGameState !== gameStates.play) return;

	// Input buffer
	const dir = directions[e.keyCode];
	if (!dir) return;

	// Prevent duplicates flooding the queue
	if (inputBuffer[inputBuffer.length - 1] !== dir) {
		inputBuffer.push(dir);
	}
});
