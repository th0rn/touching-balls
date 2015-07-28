
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

    // start animating
    animate();

    // var tick = 0;

    function animate() {
        namespace = '/test';
        var socket = io.connect('http://' + document.domain + ':' + 5000 + namespace);
        socket.on('response', function(msg) {
            requestAnimationFrame(animate);
            // tick += 0.1;

            // bunny.root_y += 0.6;

            bunny.position.x = 200 + 100 * msg.x;
            bunny.position.y = 200 + 100 * msg.y;
            // bunny.root_y = bunny.root_y > 630 ? -30 : bunny.root_y;

            // render the container
            renderer.render(stage);
            });
    }

}

document.addEventListener("DOMContentLoaded", init);
