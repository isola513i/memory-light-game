document.addEventListener("DOMContentLoaded", () => {
	let sequence = [];
	let playerSequence = [];
	let count = 0;
	let isStrict = false;
	let isPlayerTurn = false;
	let isGameOn = false;
	const WIN_COUNT = 20;

	const gameBoard = document.getElementById("game-board");
	const pads = document.querySelectorAll(".game-pad");
	const startBtn = document.getElementById("start-btn");
	const strictToggle = document.getElementById("strict-mode");
	const countDisplay = document.getElementById("count-display");
	const statusDisplay = document.getElementById("status-display");

	const soundMap = {
		1: document.getElementById("sound-1"),
		2: document.getElementById("sound-2"),
		3: document.getElementById("sound-3"),
		4: document.getElementById("sound-4"),
		error: document.getElementById("sound-error"),
	};

	startBtn.addEventListener("click", handleStart);
	strictToggle.addEventListener("change", () => {
		isStrict = strictToggle.checked;
	});
	gameBoard.addEventListener("click", handlePlayerInput);

	function handleStart() {
		sequence = [];
		playerSequence = [];
		count = 0;
		isGameOn = true;

		startBtn.textContent = "Restart";
		startBtn.classList.add("btn-secondary");

		statusDisplay.classList.remove("error");

		nextStep();
	}

	function nextStep() {
		isPlayerTurn = false;
		playerSequence = [];
		count++;
		updateCountDisplay();

		const nextInSequence = Math.floor(Math.random() * 4) + 1;
		sequence.push(nextInSequence);

		playSequence();
	}

	async function playSequence() {
		statusDisplay.textContent = "Watching...";
		togglePadInteraction(false);

		await sleep(500);

		for (const id of sequence) {
			await activatePad(id);
			await sleep(300);
		}

		statusDisplay.textContent = "Your Turn!";
		togglePadInteraction(true);
		isPlayerTurn = true;
	}

	function handlePlayerInput(e) {
		if (!isPlayerTurn || !isGameOn || !e.target.dataset.id) return;

		const padId = parseInt(e.target.dataset.id);

		activatePad(padId);
		playerSequence.push(padId);

		checkPlayerMove();
	}

	function checkPlayerMove() {
		const index = playerSequence.length - 1;

		if (playerSequence[index] !== sequence[index]) {
			handleWrongMove();
			return;
		}

		if (playerSequence.length === sequence.length) {
			if (count === WIN_COUNT) {
				handleWin();
				return;
			}

			isPlayerTurn = false;
			statusDisplay.textContent = "Correct! Next level...";
			setTimeout(nextStep, 1500);
		}
	}

	function handleWrongMove() {
		isPlayerTurn = false;
		soundMap.error.play();
		statusDisplay.textContent = "Wrong!";
		statusDisplay.classList.add("error");

		setTimeout(() => {
			statusDisplay.classList.remove("error");

			if (isStrict) {
				statusDisplay.textContent = "Strict Mode! Restarting...";
				setTimeout(handleStart, 1500);
			} else {
				statusDisplay.textContent = "Watch the pattern again...";
				playerSequence = [];
				setTimeout(playSequence, 1500);
			}
		}, 1000);
	}

	function handleWin() {
		statusDisplay.textContent = "You Win! Congratulations!";
		isPlayerTurn = false;
		isGameOn = false;

		startBtn.textContent = "Play Again";
		startBtn.classList.remove("btn-secondary");
	}

	async function activatePad(id) {
		const pad = document.getElementById(`pad-${id}`);
		const sound = soundMap[id];

		pad.classList.add("active");
		sound.currentTime = 0;
		sound.play();

		await sleep(350);
		pad.classList.remove("active");
	}

	function updateCountDisplay() {
		countDisplay.textContent = String(count).padStart(2, "0");
	}

	function togglePadInteraction(allowClick) {
		if (allowClick) {
			pads.forEach((pad) => pad.classList.add("player-turn"));
		} else {
			pads.forEach((pad) => pad.classList.remove("player-turn"));
		}
	}

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
});
