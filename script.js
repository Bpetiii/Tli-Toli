
const GRID_SIZE = 5;
const TILE_SIZE = 400 / GRID_SIZE; // Assuming the puzzle container is 400x400 pixels (referring to the size of nagyi.jpg)

// Selectors
const puzzleGrid = document.querySelector(".puzzle-grid");

// Load a random image from the images/ folder
async function getRandomImage() {
    const images = ["kep.jpg","nagyi.jpg","tf2.jpg","othertf2.jpg"];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return `images/${randomImage}`;
}

async function initPuzzle() {
    const imageSrc = await getRandomImage();

    // Create tiles
    let tiles = [];
    let blankTile = null; // Track the blank tile
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tileIndex = row * GRID_SIZE + col;
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.style.width = `${TILE_SIZE}px`;
            tile.style.height = `${TILE_SIZE}px`;
            tile.style.backgroundImage = `url(${imageSrc})`;
            tile.style.backgroundSize = "500px 500px";
            tile.style.backgroundPosition = `${-col * TILE_SIZE}px ${-row * TILE_SIZE}px`;

            // Bottom-right corner is the blank tile
            if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) {
                tile.classList.add("blank");
                tile.style.backgroundImage = "none";
                blankTile = tile;
            } else {
                tile.dataset.index = tileIndex;
            }

            tiles.push(tile);
        }
    }

    // Append tiles to grid
    tiles.forEach((tile) => puzzleGrid.appendChild(tile));

    // Shuffle tiles using valid random moves
    if (blankTile) {
        shuffleTilesByValidMoves(blankTile);
    }

    // Add movement logic
    addTileListeners();
}

// Shuffle tiles with 10000 valid random moves (this ensures solvability)
function shuffleTilesByValidMoves(blankTile) {
    let blankIndex = Array.from(puzzleGrid.children).indexOf(blankTile);

    for (let i = 0; i < 10000; i++) {
        // Get the row and column of the blank tile
        const blankRow = Math.floor(blankIndex / GRID_SIZE);
        const blankCol = blankIndex % GRID_SIZE;

        // Determine valid directions, where the blank tile can move
        const validMoves = [];
        if (blankRow > 0) validMoves.push(-GRID_SIZE); // Move up
        if (blankRow < GRID_SIZE - 1) validMoves.push(GRID_SIZE); // Move down
        if (blankCol > 0) validMoves.push(-1);  // Move left
        if (blankCol < GRID_SIZE - 1) validMoves.push(1); // Move right

        // Choose a random valid move
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

        // Calculate the index of the tile to swap with the blank tile
        const swapIndex = blankIndex + randomMove;

        // Swap the blank tile and the chosen tile
        const tileToSwap = puzzleGrid.children[swapIndex];
        puzzleGrid.insertBefore(blankTile, puzzleGrid.children[swapIndex]); // Move blank to the new position
        puzzleGrid.insertBefore(tileToSwap, puzzleGrid.children[blankIndex]); // Move the swapped tile to the old blank position

        // Update blankIndex to the new position
        blankIndex = swapIndex;
    }
}

// Add event listeners for tile interaction
function addTileListeners() {
    const tiles = Array.from(document.querySelectorAll(".tile"));
    tiles.forEach((tile) => {
        tile.addEventListener("click", () => moveTile(tile));
    });
}

// Move tile into the blank position if adjacent
function moveTile(tile) {
    if (!tile || tile.classList.contains("blank")) return;

    const blankTile = document.querySelector(".tile.blank");
    const blankIndex = Array.from(puzzleGrid.children).indexOf(blankTile);
    const tileIndex = Array.from(puzzleGrid.children).indexOf(tile);

    // Calculate row and column for blank and clicked tile
    const blankRow = Math.floor(blankIndex / GRID_SIZE);
    const blankCol = blankIndex % GRID_SIZE;
    const tileRow = Math.floor(tileIndex / GRID_SIZE);
    const tileCol = tileIndex % GRID_SIZE;

    // Check if the tile is adjasent to the blank tile
    const isAdjacent =
        (blankRow === tileRow && Math.abs(blankCol - tileCol) === 1) || // Left/right
        (blankCol === tileCol && Math.abs(blankRow - tileRow) === 1); // Up/down

    if (isAdjacent) {
        // Swap the blank tile and the clicked tile
        puzzleGrid.replaceChild(tile.cloneNode(true), blankTile);
        puzzleGrid.replaceChild(blankTile.cloneNode(true), puzzleGrid.children[tileIndex]);

        // Re-assign event listeners after replacing elements
        addTileListeners();
    }
}

// Inetialize puzzle on loading
document.addEventListener("DOMContentLoaded", initPuzzle);