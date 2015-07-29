
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

    var interactionManager = new PIXI.interaction.InteractionManager(renderer, {
        intractionFrequency: 1
    });

    // create the root of the scene graph
    var stage = new PIXI.Container();
    stage.interactive = true;

    // create a new Sprite using the texture
    bunny = new PIXI.Sprite.fromImage(ASSETS.bunny);
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
    target = new PIXI.Sprite.fromImage(ASSETS.carrot);
    target.scale.x = 1.5;
    target.scale.y = 1.5;
    target.anchor.x = 0.5;
    target.anchor.y = 0.5;

    // move the sprite to the center of the screen
    bunny.position.x = width / 2;
    bunny.position.y = height / 2;

    stage.addChild(bunny);
    stage.addChild(target);

    // Maintain a single persistent connection
    var namespace = '/test';
    var socket = io.connect('http://' + document.domain + ':' + 5000 + namespace);

    // The initial state, before receiving first message.
    var state = new PIXI.Point(0.5, 0.5);
    var mouse = new PIXI.Point(0.5, 0.5);

    stage.on('mousemove', function(e) {
        var x = e.data.global.x;
        var y = e.data.global.y;
        interactionManager.mapPositionToPoint(mouse, x, y);
        mouse.x /= width;
        mouse.y /= height;
    });

    socket.on('connect', function(msg) {
        console.log('Connected');
    });

    socket.on('state', function(msg) {
        // Rescale from [-1, 1] -> [0, 1]
        var x = Math.min(Math.max(0, (msg.x + 1) * 0.5), 1);
        var y = Math.min(Math.max(0, (msg.y + 1) * 0.5), 1);
        state.set(x, y);
    });

    var acc_factor = 1;
    var x_vel = 0;
    var y_vel = 0;

    // Store times in seconds
    var then = Date.now() / 1000;
    var tick = 0;
    var onTarget = false;

    function animate() {
        requestAnimationFrame(animate);
        if (!isFinite(mouse.x) || !isFinite(mouse.y)) {
            return;
        }

        var x_acc = mouse.x - bunny.position.x / width;
        maxVel = 5 * Math.pow(Math.abs(x_acc), 0.7);
        x_vel = clamp(x_vel + x_acc * acc_factor, -maxVel, maxVel);

        var y_acc = mouse.y - bunny.position.y / height;
        maxVel = 5 * Math.pow(Math.abs(y_acc), 0.7);
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

        var dist = Math.hypot(
            bunny.position.x - target.position.x,
            bunny.position.y - target.position.y
        );
        if (dist < 10) {
            if (!onTarget) {
                console.log("Target acquired");
                onTarget = true;
            }
        } else {
            onTarget = false;
        }

        // render the container
        renderer.render(stage);
        if (now - then > 5) {
            var fps = tick / (now - then);
            console.log(Math.round(fps, 0).toString() + " FPS");
            then = now;
            tick = -1;
        }
        tick += 1;
    }

    // start animating
    animate();

}

document.addEventListener("DOMContentLoaded", init);
