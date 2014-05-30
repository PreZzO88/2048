// Game JS

var total = 0;
var grid = getGrid();
var gridSpans = null;
var totalEmptyCells = 16;
var lastScore = 0;
var colorArray = { 	"2": "#74B1C2", "4": "#77B6D1", "8": "#77BED1",	"16": "#77C5D1", "32": "#77D0D1", "64": "#85DCE6", "128": "#8EE4ED", "256": "#A5EAF2", "512": "#B6BBFA", "1024": "#A5A8D6", "2048": "#5B8AE3", "4096": "#F59C4E" }

$(document).ready(function(){
		// Init
		gridSpans = getSpanGrid();	
		// Set 2 random cells.
		setRandCell(get2or4());
		setRandCell(get2or4());
		// Verify if localStorage contains last best score.
		if (localStorage["2048.bestScore"]) {
			$("#lastScore").text(" | Best: " + localStorage["2048.bestScore"]);
		}
		
		// New Game.
		$("#reset").click(function(e) {
			resetGame();
		});
		
		// Gameplay key presses.
		// Verify if game over, if not, move all cells to chosen 
		// direction, check for possible unions, join them if so, and move everything again.
		// Prevent default arrow key handler from triggered so the page doesn't move.
		$(document).keydown(function(e) {
			// Left
			if (e.keyCode == 37) {
				if (isGameOver()) { endGame(); }
				var cellsMoved = moveAllToLeft();
				var cellsMoved2;
				if (checkForJoins(37)) {
					cellsMoved2 = moveAllToLeft();
				}
				if (cellsMoved || cellsMoved2) { setRandCell(get2or4()); }
				e.preventDefault();
			}
			// Up
			else if (e.keyCode == 38) {
				if (isGameOver()) { endGame(); }
				var cellsMoved = moveAllToTop();
				var cellsMoved2;
				if (checkForJoins(38)) {
					cellsMoved2 = moveAllToTop();
				}
				if (cellsMoved || cellsMoved2) { setRandCell(get2or4()); }
				e.preventDefault();
			}
			// Right
			else if (e.keyCode == 39) {
				if (isGameOver()) { endGame(); }
				var cellsMoved = moveAllToRight();
				var cellsMoved2;
				if (checkForJoins(39)) {
					cellsMoved2 = moveAllToRight();
				}
				if (cellsMoved || cellsMoved2) { setRandCell(get2or4()); }
				e.preventDefault();
			}
			// Down
			else if (e.keyCode == 40) {
				if (isGameOver()) { endGame(); }
				var cellsMoved = moveAllToBottom();
				var cellsMoved2;
				if (checkForJoins(40)) {
					cellsMoved2 = moveAllToBottom();
				}
				if (cellsMoved || cellsMoved2) { setRandCell(get2or4()); }
				e.preventDefault();
			}
		});
});

// If new game is pressed, reset the game.
function resetGame() {
	$("#gameOver").fadeOut();
	total = 0;
	updateTotal(0);
	totalEmptyCells = 16;
	grid = getGrid();
	gridSpans = getSpanGrid();
	$(gridSpans).each(function(i,r) { $(r).each(function(i,c) { $(c).parent().css("background-color", "#D1E3EB"); $(c).text(""); }); });
	setRandCell(get2or4());
	setRandCell(get2or4());
}

// When Game is over, show Game Over to user and track score if better than last score.
function endGame() {
	$("#gameOver").fadeIn();
	if (lastScore <= total) { lastScore = total; localStorage["2048.bestScore"] = total;}
	$("#lastScore").text(" | Best: " + lastScore);
}

// Is the cell empty
// * Returns: true or false.
function isCellEmpty(row,col) {
	return (typeof grid[row][col] === "undefined");
}

// Move all the cells to the left of the grid.
// Returns true if cells were moved.
function moveAllToLeft() {
	var moved = false;
	for (var r = 0; r < 4 ; r++ ) {
		var s = 0;
		for (var c = 0; c < 4 ; c++ ) {
			if (!isCellEmpty(r, c)) {
				if (c != s) {
					moved = true;
					setGridNumRC(r, s, grid[r][c]);
					setEmptyCell(r, c);
				}
				s++;
			}
		}
	}
	return moved;
}

// Move all the cells to the right of the grid.
// Returns true if cells were moved.
function moveAllToRight() {
	var moved = false;
	for (var r = 0; r < 4 ; r++ ) {
		var s = 3;
		for (var c = 3; c >= 0 ; c-- ) {
			if (!isCellEmpty(r, c)) {
				if (c != s) {
					moved = true;
					setGridNumRC(r, s, grid[r][c]);
					setEmptyCell(r, c);
				}
				s--;
			}
		}
	}
	return moved;
}

// Move all the cells to the top of the grid.
// Returns true if cells were moved.
function moveAllToTop() {
	var moved = false;
	for (var c = 0; c < 4 ; c++ ) {
		var s = 0;
		for (var r = 0; r < 4 ; r++ ) {
			if (!isCellEmpty(r, c)) {
				if (r != s) {
					moved = true;
					setGridNumRC(s, c, grid[r][c]);
					setEmptyCell(r, c);
				}
				s++;
			}
		}
	}
	return moved;
}

// Move all the cells to the bottom of the grid.
// Returns true if cells were moved.
function moveAllToBottom() {
	var moved = false;
	for (var c = 0; c < 4 ; c++ ) {
		var s = 3;
		for (var r = 3; r >= 0 ; r-- ) {
			if (!isCellEmpty(r, c)) {
				if (r != s) {
					moved = true;
					setGridNumRC(s, c, grid[r][c]);
					setEmptyCell(r, c);
				}
				s--;
			}
		}
	}
	return moved;
}

// Pass thru the grid to check for possible pairs, and join them.
// Returns true if there were any joins made.
function checkForJoins(keyCode) {
	var joined = false;
	// Left
	if (keyCode == 37) {
		for (var r = 0; r < 4 ; r++ ) {
			for (var c = 0; c < 3 ; c++ ) {
				if (grid[r][c] == grid[r][c+1] && !isCellEmpty(r,c)) {
					joined = true;
					var num = grid[r][c];
					setGridNumRC(r,c,num * 2);
					updateTotal(num);
					totalEmptyCells++;
					setEmptyCell(r, c+1)
				}
			}
		}
	}
	// Top
	else if (keyCode == 38) {
		for (var c = 0; c < 4 ; c++ ) {
			for (var r = 0; r < 3 ; r++ ) {
				if (grid[r][c] == grid[r+1][c] && !isCellEmpty(r,c)) {
					joined = true;
					setGridNumRC(r,c,grid[r][c] + grid[r+1][c]);
					updateTotal(grid[r][c]);
					totalEmptyCells++;
					setEmptyCell(r+1, c)
				}
			}
		}
	}
	// Right
	else if (keyCode == 39) {
		for (var r = 0; r < 4 ; r++ ) {
			for (var c = 3; c > 0 ; c-- ) {
				if (grid[r][c] == grid[r][c-1] && !isCellEmpty(r,c)) {
					joined = true;
					setGridNumRC(r,c,grid[r][c] + grid[r][c-1]);
					updateTotal(grid[r][c]);
					totalEmptyCells++;
					setEmptyCell(r, c-1)
				}
			}
		}
	}
	// Bottom
	else if (keyCode == 40) {
		for (var c = 0; c < 4 ; c++ ) {
			for (var r = 3; r > 0 ; r-- ) {
				if (grid[r][c] == grid[r-1][c] && !isCellEmpty(r,c)) {
					joined = true;
					setGridNumRC(r,c,grid[r][c] + grid[r-1][c]);
					updateTotal(grid[r][c]);
					totalEmptyCells++;
					setEmptyCell(r-1, c)
				}
			}
		}
	}
	return joined;
}

// Verify if there are any possible joins left, if not the game is over.
// Returns true or false.
function isGameOver() {
	if (totalEmptyCells == 0) {
		var gameOver = true;
		for (var r = 0 ; r < 4 ; r++) {
			if (grid[r][0] == grid[r][1] || grid[r][1] == grid[r][2] || grid[r][2] == grid[r][3]) {
				gameOver = false;
			}
			if (r < 3) {
				if (grid[r][0] == grid[r+1][0] || grid[r][1] == grid[r+1][1] || grid[r][2] == grid[r+1][2] || grid[r][3] == grid[r+1][3]) {
					gameOver = false;
				}
			}
		}
		return gameOver;
	}
	else {
		return false;
	}
}

// Update score UI.
function updateTotal(addNum) {
	total+=addNum;
	$("#total").text("Score: "+ total);
}

// Picks and sets a random cell with specified value.
// Returns true if successfull.
function setRandCell(value) {
	if (totalEmptyCells > 0) {
		var rand = Math.floor(Math.random() * 16);
		var row = Math.floor(rand * 0.25);
		var col = rand % 4;
		while (!isCellEmpty(row,col)) {
			rand = Math.floor(Math.random() * 16);
			row = Math.floor(rand * 0.25);
			col = rand % 4;
		}
		setGridNumRC(row, col, value);
		totalEmptyCells--;
		return true;
	}
	else {
		return false;
	}
}

// Returns a value of either a 2 or 4.
// 2 or 4 is determined by a random decimal number between 0 and 1, and with a percentage to give more 2's than 4's.
function get2or4() {
	return (Math.random() > 0.80 ? 4: 2);
}

// Create and return Grid 2D Array.
function getGrid() {
	var grid = new Array(4);
	grid[0] = new Array(4);
	grid[1] = new Array(4);
	grid[2] = new Array(4);
	grid[3] = new Array(4);
	return grid;
}

// Create and return 2D Array of <span> elements of cells.
function getSpanGrid() {
	var grid = new Array(4);
	grid[0] = new Array(4);
	grid[1] = new Array(4);
	grid[2] = new Array(4);
	grid[3] = new Array(4);
	var n = 0;
	for (var r = 0; r < 4 ; r++ ) {
		for (var c = 0; c < 4 ; c++ ) {
			grid[r][c] = $("#grid .cell").eq(n).find("span");
			n++;
		}
	}
	return grid;
}

// Set a specific cell with provided value.
// Parameters: row, column, value. (0-based).
function setGridNumRC(row, col, value) {
	grid[row][col] = value;
	$(gridSpans[row][col]).parent().css("opacity",".5");
	$(gridSpans[row][col]).text(value);
	$(gridSpans[row][col]).parent().css("background-color", colorArray[value]);
	$(gridSpans[row][col]).parent().fadeTo("fast",1);
	return true;
}

// Set the specified cell to empty.
// Parameters: row, column. (0-based).
function setEmptyCell(r, c) {
	delete grid[r][c];
	$(gridSpans[r][c]).text("");
	$(gridSpans[r][c]).parent().css("background-color", "#D1E3EB");
}