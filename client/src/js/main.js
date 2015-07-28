
var PIXI = require("pixi");
var ASSETS = require("./assets.js");
require('../css/style.css');

function init() {
    var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
    document.getElementById("game-div").appendChild(renderer.view);

    // create the root of the scene graph
    var stage = new PIXI.Container();

    // create a texture from an image path
    var texture = PIXI.Texture.fromImage(ASSETS.bunny);

    // create a new Sprite using the texture
    bunny = new PIXI.Sprite(texture);

    // center the sprite's anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // move the sprite to the center of the screen
    bunny.position.x = 200;
    bunny.root_y = 200;

    stage.addChild(bunny);

    // Maintain a single persistent connection
    var namespace = '/test';
    var socket = io.connect('http://' + document.domain + ':' + 5000 + namespace);

    // The initial state, before receiving first message.
    var state = {x: 0, y: 0};

    socket.on('response', function(msg) {
        // Derive new state from the message somehow or another
        state = msg;
    });

    function animate() {
        requestAnimationFrame(animate);

        // A closure around the 'state', which reflects the last message
        bunny.position.x = 200 + 100 * state.x;
        bunny.position.y = 200 + 100 * state.y;

        // render the container
        renderer.render(stage);
    }

    // start animating
    animate();


}

document.addEventListener("DOMContentLoaded", init);
