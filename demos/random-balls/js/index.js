(function() {

    var worldWidth = $('#game-arena').width();
    var worldHeight = $('#game-arena').height();
    
    
    var numberOfBalls = 20;
    var balls = [];
    var boundaries = [];

    var playerInitX = 20;
    var playerInitY = worldHeight/2 - 35;

    //Let's create player ball
    var player = cxgf.GameObject.create({
                    x: playerInitX,
                    y: playerInitY,
                    height: 40,
                    width: 40,
                    speed: 2,
                    htmlId: 'player-ball',
                    type: "PLAYER",
                    onCollision: playerCollision
                });


    //Player can be moved with Arrow Keys
    cxgf.KeyEvent.onKeyPress(cxgf.KeyEvent.keys.LEFT, player.moveLeft, player);
    cxgf.KeyEvent.onKeyPress(cxgf.KeyEvent.keys.RIGHT, player.moveRight, player);
    cxgf.KeyEvent.onKeyPress(cxgf.KeyEvent.keys.UP, player.moveUp, player);
    cxgf.KeyEvent.onKeyPress(cxgf.KeyEvent.keys.DOWN, player.moveDown, player);

    //Let's create player-home where player can rest, a safe zone
    var playerHome = cxgf.GameObject.create({
                    x: 0,
                    y: (worldHeight /2 - 54),
                    height: 80,
                    width: 80,
                    htmlId: 'player-home',
                    type: "PLAYER-HOME"
                });

    //Let's create 20 balls html
    createBallsHtml(numberOfBalls);

    //Let's create ball objects for those balls
    createBallObjects(numberOfBalls);

    //Create Screen Boundaries on 4 sides
    createBoundaryObjects();

    //Let's make them move on tick
    randomMovementOnTick();

    //Start Watching for Collisions between Balls And Walls And Player
    cxgf.Collision.watch(player, boundaries);
    cxgf.Collision.watch(player, balls);
    cxgf.Collision.watch(balls, boundaries);
    cxgf.Collision.watch(balls, playerHome);
    cxgf.Collision.startWatching();

    cxgf.Ticker.stopTick();

    activatePlayPauseFunctionality();

    /*
    * This function is called when player is colliding
    */
    function playerCollision (collidingObj) {
        if (collidingObj.type === "WALL") {
            player.turnAround();
        }
        else {
            alert("Player Hit");
            player.x = playerInitX;
            player.y = playerInitY;
            player.render();
        }
    }

    /*
    * This function create given numberOfBalls html balls 
    * inside #game-arena
    * And ID them ball0, ball1... so on
    */
    function createBallsHtml (numberOfBalls) {
        var ballHtml = '';
        for(var i = 0; i < numberOfBalls; i++) {
            ballHtml += '<div id="ball' + i + '" class="ball"></div>';
        }
        $('#game-arena').append(ballHtml);
    }


    /*
    * This function creates given number of ball objects
    * and stores them in balls array
    * ALSO, we will override the onCollision function
    * So that on collission with boundaries, it will turn around
    */
    function createBallObjects (numberOfBalls) {
        for(var i=0; i<numberOfBalls; i++) {
            balls.push(cxgf.GameObject.create({
                x: (Math.random() * (worldWidth - 150) + 100),
                y: (Math.random() * (worldHeight - 150) + 100),
                height: 30,
                width: 30,
                speed: 2 + (Math.random() * 2),
                htmlId: 'ball' + i,
                type: "ENEMY",
                holdDirectionNTurns: Math.floor(Math.random() * 9 + 5),
                onCollision: function (collidingObj) {
                    //console.log("overrridden collision function called");
                    if(collidingObj.type === "WALL" || collidingObj.type === "PLAYER-HOME") {
                        this.turnAround();
                    }                    
                }
            }));
        }
    }


    /*
    * This function will create 4 Boundaries
    * on each side of the screen
    * So that LATER we can detect collision 
    * [and check which ball is moving outside]
    */
    function createBoundaryObjects () {

        // Left Boundary
        boundaries.push(cxgf.GameObject.create({
            x: 0,
            y: 0,
            height: worldHeight,
            width: 3,
            type: "WALL"
        }));

        // Top Boundary
        boundaries.push(cxgf.GameObject.create({
            x: 0,
            y: 0,
            height: 3,
            width: worldWidth,
            type: "WALL"
        }));

        // Right Boundary
        boundaries.push(cxgf.GameObject.create({
            x: worldWidth-3,
            y: 0,
            height: worldHeight,
            width: 3,
            type: "WALL"
        }));

        // Bottom Boundary
        boundaries.push(cxgf.GameObject.create({
            x: 0,
            y: worldHeight-3,
            height: 3,
            width: worldWidth,
            type: "WALL"
        }));
    }


    /*
    * Bind the random movement of all the ball objects to tick
    */
    function randomMovementOnTick () {
        for (var i in balls) {
            cxgf.Ticker.onTick(balls[i].move, balls[i], 5);
        }
    }


    /*
    */
    function activatePlayPauseFunctionality () {
        $('#control-panel').on('click', '.play', function(ev) {
            $('#control-panel').addClass('playing');
            cxgf.Ticker.startTick();
        });

        $('#control-panel').on('click', '.pause', function(ev) {
            $('#control-panel').removeClass('playing');
            cxgf.Ticker.stopTick();
        });
    }
})();