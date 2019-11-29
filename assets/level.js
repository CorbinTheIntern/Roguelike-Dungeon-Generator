var Level = function (floorId) {
    let rando = (random() > 0.5) ? 6 : 5;
    let numberOfRooms = min(20, rando + floor(floorId * 10 / 3));
    
    this.grid = [];
    for(let x = 0; x < GRID_W; x++) for(let y = 0; y < GRID_H; y++){
        grid[x][y] = new Room();
    }
}