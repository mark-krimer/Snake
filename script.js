// Importing HTML Elements
const canvasElem = document.getElementById("canvas");
const canvas = canvasElem.getContext("2d");

const body = document.querySelector("body");

// Variables
const scale = 50; // 18 * 50 = 900px
const speed = 100; // ms delay between frames
let score = 0;
let highscore;
if (localStorage.snakeHighscore) {
	highscore = localStorage.snakeHighscore;
} else {
	highscore = 0;
}

let removeTail = true;
let pixels = [];

// Game state variables
const gameStates = {
	loading: "loading",
	title: "title",
	play: "play",
	lose: "lose",
};
let currentGameState = gameStates.loading;

let loadingProgress = 0;

// Functions
function setupCanvas() {
	canvasElem.width = 18 * scale;
	canvasElem.height = 18 * scale;

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
	drawPixel(1, 1, 18, 3, borderColour, "wall");
	drawPixel(1, 4, 1, 15, borderColour, "wall");
	drawPixel(18, 4, 1, 15, borderColour, "wall");
	drawPixel(2, 18, 16, 1, borderColour, "wall");
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
		return 1;
	}
	if (direction == "left" && nextDirection == "right") {
		return 1;
	}
	if (direction == "up" && nextDirection == "down") {
		return 1;
	}
	if (direction == "down" && nextDirection == "up") {
		return 1;
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

function drawTitleScreen() {
	drawPixel(2, 4, 16, 14, "black", "board");

	drawText(8, 6, "SNAKE", "white");

	drawText(5, 11, "PRESS START", "white");
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
			new Pixel(7, 5, 1, 1, "green", "snake", false), // head
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
		if (checkMovementCompatibility(this.direction, this.nextDirection) == 1) {
			this.nextDirection = this.direction;
		}

		this.direction = this.nextDirection;

		// Remove tail
		if (!removeTailFunc) {
			removeTail = true;
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

		this.segments.splice(0, 0, new Pixel(newHeadX, newHeadY, 1, 1, "green", "snake"));

		// Check collision
		this.checkCollisions();
	};

	checkCollisions = function () {
		// Finding head location
		let headX = this.segments[0].x;
		let headY = this.segments[0].y;

		// Checking self collision
		for (let i = this.segments.length - 1; i > 0; i--) {
			if (this.segments[i].x == headX && this.segments[i].y == headY) {
				alert("lose");
			}
		}

		// Determining contact pixel
		let contactPixel = findPixel(headX, headY);

		if (contactPixel == undefined) {
			return;
		}

		// Wall
		if (contactPixel.type == "wall") {
			alert("lose");
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

setInterval(() => {
	// Title screen game state
	if (currentGameState === gameStates.title) {
		drawTitleScreen();
		return;
	}

	// Playing game state
	if (currentGameState === gameStates.play) {
		// Clear canvas
		canvas.clearRect(0, 0, canvasElem.width, canvasElem.height);
		pixels = [];

		// Draw border
		drawBoardStatics("darkslategrey", "greenyellow", "darkseagreen");

		apple.draw();
		player.move(removeTail);
		player.draw();
	}
}, speed);

// Event Listeners
window.onload = function () {
	setupCanvas();
};

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

	if (directions[e.keyCode] != undefined) {
		player.nextDirection = directions[e.keyCode];
	}
});

//todo		Fundementals
//todo//		 - Get snake moving
//todo//		 - Collisions (wall, self)
//todo//		 	- Track snake segment positions
//todo//		 	- Detect head position overlap
//todo//		 - Apple eating
//todo//		 	- Pick random unocupied apple position
//todo//		 	- Detect snake eating
//todo//		 - Track score
//todo//		 - Locally store highscore
//todo		 - Add art
//todo		 	- Lose screen
//todo		 	- Win screen
//todo		 	- Snake art
//todo		 	- Apple art
//todo		 - Fix game eating inputs

//todo		Additional
//todo		 - Speed increases during play
//todo		 - Add highscore that updates during play

//* Drawing pixel
// const pixel = new Pixel(posx, posy, 1, 1, colour, type);
// 			pixel.drawSquare();
// 			created.push(pixel);
