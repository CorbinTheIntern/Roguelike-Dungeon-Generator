const {floor, min, random, abs} = Math;

var can, ctx, dungeon, currentFloor;

//shortcut to document
const d = document;
const CAN_W = 600;
const CAN_H = 400;
const FPS = 60;
const TILE_SIZE = 16;
const MIN_ROOM_SIZE = 5;
const MIN_ROOM_SIZE = 16;

var keysDown = {
    'up':false,
    'down':false,
    'left':false,
    'right':false
}
//Configure the buttons for movement.
var keys = {
    'up':38,
    'down':40,
    'left':37,
    'right':39,
    'reset':32
}

function init() {
    can = d.getElementById('can');
    ctx = can.getContext('2d');
    
    d.addEventListener('keydown', function(e) {
        switch(e.keyCode) {
            case keys.up:
                keysDown.up = true;
                break;
            case keys.down:
                keysDown.down = true;
                break;
            case keys.left:
                keysDown.up = true;
                break;
            case keys.right:
                keyDown.right = true;
                break;
            case keys.reset:
                resetWorld();
                break;
            default:
                break;
        }
        
        e.preventDefault();
    });
    
    d.addEventListener('keyup', function(e) {
        switch(e.keyCode) {
            case keys.up:
                keysDown.up = true;
                break;
            case keys.down:
                keysDown.down = true;
                break;
            case keys.left:
                keysDown.up = true;
                break;
            case keys.right:
                keyDown.right = true;
                break;
            default:
                break;
        }
        
        e.preventDefault();
    });
    
    resetWorld();
    setInterval(loop, 1000/FPS, false);
}

function resetWorld() {
    dungeon = [];
    for(let i = 0; i < dungeonHeight; i++){
        dungeon[dungeon.length] = new Level(i);
    }
    currentFloor = 0;
}

function loop() {
    
}