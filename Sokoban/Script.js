
let level = 1;
let currentMap = tileMap01;

var playerPosition = null;
var playerMoves = 0;
var goals = [];
var requiredGoals = 0;
var goalsCompleted = 0;

for (symbol of currentMap.mapGrid.flat()) {
    if (symbol == "G") {
        requiredGoals++;
    }
};


var gameClock = setInterval(setTime, 1000);
var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;

function startClock()
{
  if (gameClock === -1) {
    gameClock = setInterval(setTime, 1000);
  }
}

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = displayTime(totalSeconds % 60);
  minutesLabel.innerHTML = displayTime(parseInt(totalSeconds / 60));
}

function displayTime(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function stopClock()
{
  if (gameClock !== -1) {
    clearInterval(gameClock);
    gameClock = -1; 
  }
}

function resetTime () {
    totalSeconds = 0;
}


function newGame() {
    stopClock();
    resetTime();
    document.getElementById("container").innerHTML = '';
    document.getElementById("minutes").innerHTML = "00";
    document.getElementById("seconds").innerHTML = "00";
    document.getElementById("moves").textContent = "Moves: 0";
    document.getElementById("boxes").textContent = "Boxes: 0 / " + requiredGoals;
    document.getElementById("newGame").textContent = "Level " + level;
    playerPosition= null;
    playerMoves = 0;
    goals = [];
    goalsCompleted = 0;    
    buildSokobanMap();
}

function buildSokobanMap(){
    for (let y = 0; y < currentMap.height; y++) {
        for (let x = 0; x < currentMap.width; x++) {   
            let newElement = document.createElement("div");
            newElement.setAttribute("Id", newId(x, y));
            newElement.classList.add(selectImage(newElement, x, y));
            document.getElementById("container").appendChild(newElement);
        }
    }
}

function newId(x, y){
    return "" + x + "/" + y;
}

function selectImage(newElement, x, y) {
    var image;
    switch (currentMap.mapGrid[y][x].toString()) {
        case 'W':
            image = Tiles.Wall;
            break;
        case "B":
            image = Entities.Block;
            break;
        case "P":
            image = Entities.Character;   
            playerPosition = newElement;       
            break;
        case "G":
            image = Tiles.Goal;
            goals.push(newElement);
            break;
        case " ":
            image = Tiles.Space;
        default:
            break;
    }
    return image;
};


document.addEventListener('keydown', function(e) {
    if (goalsCompleted == goals.length) {
        return handleInputEvent(e);
    }
    switch (e.key) {
        case "ArrowUp": 
            movementDirection(playerPosition, 0, -1);
            return handleInputEvent(e);
        case "ArrowDown": 
            movementDirection(playerPosition, 0, 1);
            return handleInputEvent(e);
        case "ArrowLeft":
            movementDirection(playerPosition, -1, 0);
            return handleInputEvent(e);
        case "ArrowRight": 
            movementDirection(playerPosition, 1, 0);
            return handleInputEvent(e);
        default:
            return false;
    }
});

function movementDirection(entity, x, y) { 
    var coords = getCoordinates(entity.id);  
    var target = getElement(coords[0] + x, coords[1] + y);
    if (checkCollision(entity, target)) {
        return false;
    }    
    if (environmentItem(entity, Entities.Character)) {      
        if (environmentItem(target, Entities.Block, Entities.BlockDone)) {            
            if (!movementDirection(target, x, y)) 
                return false;            
        }        
        target.classList.remove(...target.classList);
        target.classList.toggle(Entities.Character);
        movePlayer(target, coords[0], coords[1]);        
    }
    else {
        target.classList.remove(...target.classList);
        target.classList.toggle(goals.includes(target) ? Entities.BlockDone : Entities.Block);        
    }
    entity.classList.remove(...entity.classList);
    entity.classList.toggle(goals.includes(entity) ? Tiles.Goal : Tiles.Space, true);
    return true;
}

function getCoordinates(str) {
    return Array.from(str.split('/')).map(Number);
}

function getElement(x, y) {
    return document.getElementById(newId(x, y));
}

function environmentItem(element, ...args) {
    for (let i = 0; i < args.length; i++) {
        if (element.classList.contains(args[i]))
            return true;
    }
    return false;
}

function checkCollision(entity, target) {
    return environmentItem(target, Tiles.Wall)
       || (environmentItem(entity, Entities.Block, Entities.BlockDone) 
        && environmentItem(target, Entities.Block, Entities.BlockDone));
}

function movePlayer(playerElement) {
    playerPosition = playerElement;
    playerMoves++;
    goalsCompleted = goals.filter(item => item.classList.contains(Entities.BlockDone)).length;
    if (playerMoves == 1) {
        document.getElementById("newGame").textContent = "New Game";
        resetTime();
        startClock();
    }   
    if (goalsCompleted == goals.length) {
        stopClock();
        document.getElementById("boxes").textContent = "Level " + level + " solved !!!";
    }
    else {
        document.getElementById("moves").textContent = `Moves: ${playerMoves}`;
        document.getElementById("boxes").textContent = `Boxes: ${goalsCompleted} / ${goals.length}`;
    }
}

// The normal effect of those keys should be suppressed, to make sure that the page does not scroll when you press them.
function handleInputEvent(e) {
    e.preventDefault();  // Chrome/Edge
    e.stopPropagation(); // Opera
    return false;        // IE
}


newGame();