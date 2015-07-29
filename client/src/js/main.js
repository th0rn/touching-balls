
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
    bunny.x = width / 2;
    bunny.y = height / 2;
    bunny.unit_y = 0.5;
    bunny.true_y = 0.5;  // true_y is including hopping/walking motion
    bunny.unit_x = 0.5;

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
        // Flip the y axis so that increasing is up
        mouse.y = 1 - mouse.y / height;
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

    var acc_factor = 0.001;
    var x_vel = 0;
    var y_vel = 0;
    var hopVel = 0;
    var hopHeight = 0;
    var hopImpulse = 0.007;
    var gravity = 0.0008;

    // Store times in seconds
    var then = Date.now() / 1000;
    var tick = 0;
    var onTarget = false;

    function animate() {
        requestAnimationFrame(animate);
        if (!isFinite(mouse.x) || !isFinite(mouse.y)) {
            return;
        }

        now = Date.now() / 1000;

        var x_acc = mouse.x - bunny.unit_x;
        maxVel = Math.min(Math.pow(Math.abs(x_acc), 1.4) * width, 2) / width;
        x_vel = clamp(x_vel + x_acc * acc_factor, -maxVel, maxVel);

        // Screen coordinates increase going down the screen
        var y_acc = mouse.y - bunny.unit_y;
        maxVel = Math.min(Math.pow(Math.abs(y_acc), 1.4) * height, 2) / height;
        y_vel = clamp(y_vel + y_acc * acc_factor, -maxVel, maxVel);

        // A closure around the 'state', which reflects the last message
        // The first several updates are all garbage for some reason, so we
        // just keep Mr. Bunny still until the world stabilizes
        if (isFinite(state.x)) {
            bunny.unit_x += x_vel;
            // Actually update position now, make sure to transform back to
            // screen coordinates and remember the y-axis is flipped!
            // [(0, 0), (1, 1)] -> [(width, height), (0, 0)]
            bunny.x = bunny.unit_x * width;
            target.x = state.x * width;
        }
        if (isFinite(state.y)) {
            bunny.unit_y += y_vel;
            bunny.true_y = bunny.unit_y + hopHeight;
            bunny.y = (1 - bunny.true_y) * height;
            target.y = (1 - state.y) * height;
        }

        // Mr bunny should walk and hop when he moves

        // Gravity is always on
        if (hopHeight <= 0) {
            hopHeight = 0;
            hopVel = 0;
        } else {
            hopHeight += hopVel;
            hopVel -= gravity;
        }

        var speed = Math.hypot(x_vel, y_vel);
        // Stop if not moving
        if (speed < 0.0001) {
            bunny.rotation *= 0.8;
        // Walk if slow
        } else if (speed < maxVel) {
            bunny.rotation = Math.cos(7 * Math.PI * now) / 8;
        // Hop if fast
        } else {
            end = Math.sign(x_acc) * Math.PI / 15;
            bunny.rotation += (end - bunny.rotation) * 0.2;
            if (hopHeight === 0) {
                hopHeight = hopVel = hopImpulse;
            }
        }

        // This carrot is so enticing!
        if (onTarget) {
            target.rotation *= 0.8;
        } else {
            target.rotation = Math.sin(2 * Math.PI * now) / 5;
        }


        // This is in absolute terms (pixels)
        var dist = Math.hypot(
            (1 - bunny.unit_x) * width - target.x,
            (1 - bunny.unit_y) * height - target.y
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
