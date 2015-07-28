
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
    bunny.position.y = 200;

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

    // Totally arbitrary. Bunny's velocity will be proportional to distance
    // from point. Play with this and see.
    var speed = 0.04;

    function animate() {
        requestAnimationFrame(animate);

        var target_x = 200 + 400 * state.x;
        var target_y = 200 + 400 * state.y;

        // A closure around the 'state', which reflects the last message
        // The first several updates are all garbage for some reason, so we
        // just keep Mr. Bunny still until the world stabilizes
        if (isFinite(bunny.position.x)) {
            bunny.position.x += (target_x - bunny.position.x) * speed;
        } else {
            bunny.position.x = 200;
        }
        if (isFinite(bunny.position.y)) {
            bunny.position.y += (target_y - bunny.position.y) * speed;
        } else {
            bunny.position.y = 200;
        }

        // render the container
        renderer.render(stage);
    }

    // start animating
    animate();


}

document.addEventListener("DOMContentLoaded", init);
