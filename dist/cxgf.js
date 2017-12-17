(function(window){

    window.cxgf = {};

})(window);
(function(window){
    window.cxgf.Utils = {
        generateID: generateID,
        deleteID: deleteID
    };

    var _allIDs = [];

    function generateID (prepend) {
        var id;
        prepend = prepend || 'gobj';

        while (id === undefined || _allIDs.indexOf(id) >= 0) {
            id = prepend + '-' + (Math.random() * (parseInt(Math.random().toString().replace(/[.]/g,'')))).toString().replace(/[.]/g,'-');
        }

        _allIDs.push(id);
        return id;
    }

    function deleteID (id) {
        _allIDs.splice(_allIDs.indexOf(id), 1);
    }

})(window);
(function(window){

    window.cxgf.Ticker = {
        onTick: onTick,
        startTick: startTick,
        stopTick: stopTick
    };

    var _tickRunning = false;
    var _tickListener = [];
    var _tickCounter = 0;
    var _tickResetUpperLimit = 27000000;    //27000000 ticks = 125 hours, given 60 ticks/sec


    /*
    * Add callback function to Ticker
    * skipTick: number of ticks to skip before the function is called again
    */
    function onTick (callbackFn, obj, skipTick) {
        var tickListenerID = cxgf.Utils.generateID('ticker');
        _tickListener.push({
            id: tickListenerID,
            fn: callbackFn,
            obj: obj || window,
            skipTick: (skipTick === undefined || skipTick < 0) ? 1 : skipTick
        });

        //start the tick
        startTick();

        return tickListenerID;
    }

    function _gerenateUniqueID () {
        var tickID = (Math.random() * Math.random() * 999999999).toString().replace(/[.]/g, '-');

    }

    function startTick () {
        if(!_tickRunning) {
            _tickRunning = true;
            _tick();
        }        
    }

    function stopTick () {
        _tickRunning = false;
    }

    function _tick () {
        if(!_tickRunning || _tickListener.length <= 0) {
            return;
        }
        _tickCounter++;

        for(var i in _tickListener) {
            if(_tickCounter % _tickListener[i].skipTick === 0) {
                _tickListener[i].fn.apply(_tickListener[i].obj);
            }            
        }

        //reset the counter if a certain upper limit is reached
        // to prevent integer overflow kind of mess
        if(_tickCounter === _tickResetUpperLimit) {
            _tickCounter = 0;
        }

        setTimeout(_tick, 1000/60);
    }
    


})(window);
(function(window){

    window.cxgf.KeyEvent = {
        onKeyPress: onKeyPress,

        keys: {
            "LEFT": 37,
            "UP": 38,
            "RIGHT": 39,
            "DOWN": 40,
            "SPACE": 32
        }
    };

    var _keyPressListeners = {};

    init();

    function init () {
        bindKeyPressEvent();
    }

    function onKeyPress (key, callbackFn, obj) {
        if(_keyPressListeners[key] == undefined) {
            _keyPressListeners[key] = [];
        }
        _keyPressListeners[key].push({
            fn: callbackFn,
            obj: obj
        });
    }


    function bindKeyPressEvent(){
        $(document).on('keydown', function(ev){
            //loop thru all listener object 
            //and call all listening callback functions
            for(var key in _keyPressListeners) {
                if(ev.keyCode == key) {
                    for(var i in _keyPressListeners[key]) {
                        _keyPressListeners[key][i].fn.apply(_keyPressListeners[key][i].obj);
                    }
                }
            }
        })
    }


})(window);
(function(window){

    window.cxgf.Collision = {
        watch: watchCollision,
        isColliding: isColliding
    };

    /*
    * _collisionPairs will contain collision group pairs, e.g.
        [
            {
                group1: [StarA, StarB, StarC],
                group2: [RocketA, RocketB, RocketC]
            },
            {
                group1: [Enemy1, Enemy2, Enemy3, Enemy4, Enemy5],
                group2: [Bullet1]
            }
        ]
    */
    var _collisionPairs = [];
    //var collisionDetectionOn = false;

    init();

    function init () {
        cxgf.Ticker.onTick(_detectCollision);
    }

    /*
    * This function will add a pair of 2 collision groups into _collisionPairs
    */
    function watchCollision (objArr1, objArr2) {
        _collisionPairs.push({
            group1: $.isArray(objArr1) ? objArr1 : [objArr1],
            group2: $.isArray(objArr2) ? objArr2 : [objArr2]
        }); 
    }


    /*
    * This function will keep in running in a loop,
    * Detecting all the collisions between the object pairs present in
    * _collisionPairs
    */
    function startWatching () {
        // if(!collisionDetectionOn) {
        //     collisionDetectionOn = true;
        //     _detectCollision();
        // }
    }

    function stopWatching () {
        //collisionDetectionOn = false;
    }

    /*
    * This function will loop thru all the collision pairs
    * to see if there is any collision.
    * If there is any collision, 
    * then "onCollision" function on that object is called
    */
    function _detectCollision () {
        // if(!collisionDetectionOn || _collisionPairs.length <= 0) {
        //     return;
        // }

        var pair;
        for (var i in _collisionPairs) {
            pair = _collisionPairs[i];
            
            for(var j in pair.group1) {
                for (var k in pair.group2) {
                    if(isColliding(pair.group1[j], pair.group2[k])) {
                        if(pair.group1[j].onCollision !== undefined) {
                            pair.group1[j].onCollision(pair.group2[k]);
                        }

                        if(pair.group2[k].onCollision !== undefined) {
                            pair.group2[k].onCollision(pair.group1[j]);
                        }
                    }
                }
            }
        }

        //setTimeout(_detectCollision, 1000/60);
    }

    function isColliding (objA, objB) {

        if (objA._objID === objB._objID
            || (objA.x + objA.width) < objB.x
            || objA.x > (objB.x + objB.width)
            || (objA.y + objA.height) < objB.y
            || objA.y > (objB.y + objB.height)
            ) 
        {
            //no collision
            return false;
        }
        else {
            return true;
        }
    }

})(window);
/*
*   GameObjectConfig = {
        x: position_X
        y: position_Y
        speed:
        speedX: speedX || speed
        speedY: speedY || speed
        htmlId:

            // The property holdDirectionNTurns will be used for
            // random moves only. It indicates after how many turns or ticks
            // the direction should be randomized again
            // default is 10
        holdDirectionNTurns: 




*   }
*/


(function(window){

    window.cxgf.GameObject = {
        create: createObject,
        getAll: getAll
    };

    var _gameObjects = [];
    //var _objIDCounter = 0;

    init();

    /*
    * Create a Game Object
    * Must Pass the gameObjectConfig
        GameObjectConfig:
            x: position_X
            y: position_Y
            speed:
            speedX: speedX || speed
            speedY: speedY || speed
            htmlId:

                // The property holdDirectionNTurns will be used for
                // random moves only. It indicates after how many turns or ticks
                // the direction should be randomized again
                // default is 10
            holdDirectionNTurns:

    *
    */
    function createObject (gameObjectConfig) {
        var newGameObj = new _GameObject(gameObjectConfig);
        _gameObjects.push(newGameObj);
        return newGameObj;
    }


    /*
        Get All Game Objects that meet a certain criteria
        If no identifier is passed, return all the ojects
    */
    function getAll (identifier) {
        if(identifier === undefined) {
            return _gameObjects;
        }
    }


    function _GameObject (gameObjectConfig) {
        //Blindly copy all the properties
        for(var key in gameObjectConfig) {
            this[key] = gameObjectConfig[key];
        }

        //Now set some defaults
        //this._objID = "cxgfgo-" + _objIDCounter++;
        this._objID = cxgf.Utils.generateID('gobj');
        this.x = this.x || 0;
        this.y = this.y || 0;
        this.speed = this.speed || 1;
        this.speedX = this.speedX || this.speed;
        this.speedY = this.speedY || this.speed;
        this.directionSense = this.directionSense || 4;
        this.holdDirectionNTurns = this.holdDirectionNTurns || 9;

        //_gameObjects.push(this);

        this.render();
    }
    
    function init () {
        _initGameObjectCommonMethods();
    }

    function _initGameObjectCommonMethods () {
        _GameObject.prototype.render = function () {
            $('#'+this.htmlId).css({
                top: this.y + 'px',
                left: this.x + 'px'
            });
        };

        _GameObject.prototype.moveLeft = function () {
            this.x -= (this.speedX || this.speed);
            this.direction = "W";
            this.render();
        };

        _GameObject.prototype.moveRight = function () {
            this.x += (this.speedX || this.speed);
            this.direction = "E";
            this.render();
        };

        _GameObject.prototype.moveUp = function () {
            this.direction = "N";
            this.y -= (this.speedY || this.speed);
            this.render();
        };

        _GameObject.prototype.moveDown = function () {
            this.direction = "S";
            this.y += (this.speedY || this.speed);
            this.render();
        };

        _GameObject.prototype.move = function (direction) {
            if (direction === 'LEFT' || direction === 'W') {
                this.moveLeft();
            }
            else if (direction === 'RIGHT' || direction === 'E') {
                this.moveRight();
            }
            else if (direction === 'UP' || direction === 'N') {
                this.moveUp();
            }
            else if (direction === 'DOWN' || direction === 'S') {
                this.moveDown();
            }
            else if (direction === 'RANDOM-4' || direction === undefined) {
                 
                if(!this._holdDirectionCounter || this._holdDirectionCounter > this.holdDirectionNTurns) {
                    //First, calculate the possible directions
                    //Then randomly pick 1 among the possibilities
                    //to stop shaking behavior, restrict movement direction
                    if (this.prevDirection === 'N') {
                      this.direction = ['N','E','W'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'E') {
                      this.direction = ['N','E','S'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'S') {
                      this.direction = ['E','S','W'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'W') {
                      this.direction = ['N','S','W'][Math.floor(Math.random() * 3)];  
                    }
                    //1st time this.prevDirection will be undefined
                    else {
                      this.direction = ['E','W','N','S'][Math.floor(Math.random() * 4)];
                    }
                    
                    this.prevDirection = this.direction;
                    this._holdDirectionCounter = 0;
                }
                
                this._holdDirectionCounter++;                
                this.move(this.direction);
            }
        };

        _GameObject.prototype.turnAround = function () {
            var oppositeDirections = {
                'E': 'W',
                'W': 'E',
                'N': 'S',
                'S': 'N'
            };

            this.direction = oppositeDirections[this.direction];
            this.move(this.direction);
        }

        _GameObject.prototype.onCollision = function (collidingObj) {
            //console.log(this);
            //console.log(" is in collision with ");
            //console.log(collidingObj);
        };
    }


})(window);









/*

(function(window){
    window.cxgf.GameObject = (function () {
        var _objIDCounter = 0;

        function GameObject(gameObjectConfig) {

            //Blindly copy all the properties
            for(var key in gameObjectConfig) {
                this[key] = gameObjectConfig[key];
            }

            //Now set some defaults
            this._objID = "cxgfgo-" + _objIDCounter;
            this.x = this.x || 0;
            this.y = this.y || 0;
            this.speed = this.speed || 1;
            this.speedX = this.speedX || this.speed;
            this.speedY = this.speedY || this.speed;
            this.directionSense = this.directionSense || 4;
            this.holdDirectionNTurns = this.holdDirectionNTurns || 9;

            //_gameObjects.push(this);

            this.render();
        }

        GameObject.prototype.render = function () {
            $('#'+this.htmlId).css({
                top: this.y + 'px',
                left: this.x + 'px'
            });
        };

        GameObject.prototype.moveLeft = function () {
            this.x -= (this.speedX || this.speed);
            this.render();
        };

        GameObject.prototype.moveRight = function () {
            this.x += (this.speedX || this.speed);
            this.render();
        };

        GameObject.prototype.moveUp = function () {
            this.y -= (this.speedY || this.speed);
            this.render();
        };

        GameObject.prototype.moveDown = function () {
            this.y += (this.speedY || this.speed);
            this.render();
        };

        GameObject.prototype.move = function (direction) {
            if (direction === 'LEFT' || direction === 'W') {
                this.moveLeft();
            }
            else if (direction === 'RIGHT' || direction === 'E') {
                this.moveRight();
            }
            else if (direction === 'UP' || direction === 'N') {
                this.moveUp();
            }
            else if (direction === 'down' || direction === 'S') {
                this.moveDown();
            }
            else if (direction === 'RANDOM-4' || direction === undefined) {
                 
                if(!this._holdDirectionCounter || this._holdDirectionCounter > this.holdDirectionNTurns) {
                    //First, calculate the possible directions
                    //Then randomly pick 1 among the possibilities
                    //to stop shaking behavior, restrict movement direction
                    if (this.prevDirection === 'N') {
                      this.direction = ['N','E','W'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'E') {
                      this.direction = ['N','E','S'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'S') {
                      this.direction = ['E','S','W'][Math.floor(Math.random() * 3)];  
                    }
                    else if (this.prevDirection === 'W') {
                      this.direction = ['N','S','W'][Math.floor(Math.random() * 3)];  
                    }
                    //1st time this.prevDirection will be undefined
                    else {
                      this.direction = ['E','W','N','S'][Math.floor(Math.random() * 4)];
                    }
                    
                    this.prevDirection = this.direction;
                    this._holdDirectionCounter = 0;
                }
                
                this._holdDirectionCounter++;                
                this.move(this.direction);
            }
        };

        GameObject.prototype.turnAround = function () {
            var oppositeDirections = {
                'E': 'W',
                'W': 'E',
                'N': 'S',
                'S': 'N'
            };

            this.direction = oppositeDirections[this.direction];
            this.move(this.direction);
        }

        GameObject.prototype.onCollision = function (collidingObj) {
            //console.log(this);
            //console.log(" is in collision with ");
            //console.log(collidingObj);
        };

        return GameObject;
    }());

})(window);

*/