/**
 * Created by ava on 11/3/16.
 */

window.onload = function () {
/*    var loader = new PIXI.loaders.Loader();
    loader.add("delete", 'image/delete.png')
        .add("disable", 'image/disable.png')
        .add("enable", 'image/enable.png').load(main);*/
    main();

};;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

function main() {
    var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
        backgroundColor: 0x1F99bb,
        resolution: window.devicePixelRatio || 1
    });
    //var collision = new Bump(PIXI);
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container(0x50FF0, true);

    // Disable popup menue
    window.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });

    window.addEventListener('resize', function () {
        renderer.resize(window.innerWidth, window.innerHeight);
    });
}
