let camera, scene, renderer, water, fog, audio, lights, sky, sunSphere, timeDiff, fastTimeDiff, autoTime, controls, sceneObjects;
var mixers = [];


var clock = new THREE.Clock();

window.onload = init;

function init() {
    let container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 6000 );
    camera.position.set( 0, 0, 2000 );
    
    controls = new THREE.OrbitControls(camera);
    //controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1500;
    controls.maxDistance = 2000;
    controls.minPolarAngle = Math.PI/2;
    controls.maxPolarAngle = Math.PI/2;
    
    controls.enablePan = false;
    
    controls.target.set(0,0,-00);
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.4,0.4,0.4);
    
    lights = new Lighting(scene);
    
    sceneObjects = new SceneObjects(scene);
    
    // RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    
    animate();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onKeyDown( event ) {
    switch ( event.keyCode ) {
        case 72: // h

            lights.hemiLight.visible = ! lights.hemiLight.visible;
            lights.hemiLightHelper.visible = ! lights.hemiLightHelper.visible;
            break;
        case 68: // d
            lights.dirLight.visible = ! lights.dirLight.visible;
            lights.dirLightHeper.visible = ! lights.dirLightHeper.visible;
            break;
    }
}
//
function animate() {
    requestAnimationFrame( animate );
    render();
}
let count = 0;
function render() {
    var delta = clock.getDelta();
    for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[ i ].update( delta );
    }
    sceneObjects.rotor.rotation.x += 0.05;
    renderer.render( scene, camera );
}

