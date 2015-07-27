
function init() {
    var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
    document.getElementById("game-div").appendChild(renderer.view);

    // create the root of the scene graph
    var stage = new PIXI.Container();

    // create a texture from an image path
    var texture = PIXI.Texture.fromImage('https://raw.githubusercontent.com/pixijs/examples/gh-pages/_assets/bunny.png');

    // create a new Sprite using the texture
    bunny = new PIXI.Sprite(texture);

    // center the sprite's anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // move the sprite to the center of the screen
    bunny.position.x = 200;
    bunny.root_y = -30;

    stage.addChild(bunny);

    // start animating
    animate();

    var tick = 0;

    function animate() {
        requestAnimationFrame(animate);
        tick += 0.1;

        bunny.root_y += 1;

        // just for fun, let's rotate mr rabbit a little
        bunny.rotation = Math.cos(tick) / 4;
        bunny.position.x = 200 + 10 * Math.cos(tick);
        bunny.position.y = bunny.root_y + 10 * Math.cos(2 * tick);
        bunny.root_y = bunny.root_y > 630 ? -30 : bunny.root_y;

        // render the container
        renderer.render(stage);
    }

}


document.addEventListener("DOMContentLoaded", init);
