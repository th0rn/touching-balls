
var PIXI = require("pixi");
var ASSETS = require("./assets.js");
require('../css/style.css');

var width = 800;
var height = 600;

function clamp(x, low, high) {
    return Math.max(low, Math.min(x, high));
}

function init() {
    var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x1099bb});
    document.getElementById("game-div").appendChild(renderer.view);

    // create the root of the scene graph
    var stage = new PIXI.Container();

    // create a texture from an image path
    var texture = PIXI.Texture.fromImage(ASSETS.bunny);

    // create a new Sprite using the texture
    bunny = new PIXI.Sprite(texture);
    target = new PIXI.Sprite(texture);

    // move the sprite to the center of the screen
    bunny.position.x = width / 2;
    bunny.position.y = height / 2;

    stage.addChild(bunny);
    stage.addChild(target);

    // Maintain a single persistent connection
    var namespace = '/test';
    var socket = io.connect('http://' + document.domain + ':' + 5000 + namespace);

    // The initial state, before receiving first message.
    var state = {x: 0.5, y: 0.5};

    socket.on('response', function(msg) {
        // Derive new state from the message somehow or another
        state = {
            x: Math.min(Math.max(0, (msg.x + 1) * 0.5), 1),
            y: Math.min(Math.max(0, (msg.y + 1) * 0.5), 1),
        };
    });

    var maxVel = 5;
    var acc_factor = 3;
    var x_vel = 0;
    var y_vel = 0;
    var target_x = state.x;
    var target_y = state.y;

    function animate() {
        requestAnimationFrame(animate);
        if (!isFinite(state.x) || !isFinite(state.y)) {
            return;
        }

        target_x = state.x;
        var x_acc = target_x - bunny.position.x / width;
        x_vel = clamp(x_vel + x_acc * acc_factor, -maxVel, maxVel);

        target_y = state.y;
        var y_acc = target_y - bunny.position.y / height;
        y_vel = clamp(y_vel + y_acc * acc_factor, -maxVel, maxVel);

        // A closure around the 'state', which reflects the last message
        // The first several updates are all garbage for some reason, so we
        // just keep Mr. Bunny still until the world stabilizes
        if (isFinite(state.x)) {
            bunny.position.x += x_vel;
            target.position.x = state.x * width;
        }
        if (isFinite(state.y)) {
            bunny.position.y += y_vel;
            target.position.y = state.y * height;
        }

        // render the container
        renderer.render(stage);
    }

    // start animating
    animate();

}

document.addEventListener("DOMContentLoaded", init);
