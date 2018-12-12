let camera, scene, renderer, water, fog, audio, lights, sky, sunSphere, timeDiff, fastTimeDiff, autoTime, controls, sceneObjects, modifier, effectController, stats;
var mixers = [];


var clock = new THREE.Clock();

window.onload = init;

function init() {
    let container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 6000 );
    camera.position.set( 0, 0, 2000 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.4,0.4,0.4);
    
    lights = new Lighting(scene);
    
    modifier = new THREE.SimplifyModifier();
    /*let count = Math.floor( cube.geometry.attributes.position.count * 0.12 ); // number of vertices to remove
    cube.geometry = modifier.modify( cube.geometry, count );*/
    
    sceneObjects = new SceneObjects(scene);
    
    var gui = new dat.GUI();

    effectController  = {
        vertex_modifier: 0,
        thruster_speed: 0.05,
        rotate_thruster: ! true
    };
    function guiChanged() {
        sceneObjects.thrusterobj.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                    let count = Math.floor( child.geometry.attributes.position.count * effectController.vertex_modifier ); // number of vertices to remove
                    child.geometry = modifier.modify( child.geometry, count );
                }
            });
    }
    
    gui.add( effectController, "vertex_modifier", 0.0, 0.16, 0.01 ).onChange( guiChanged );
    gui.add( effectController, "thruster_speed", 0.0, 2.0, 0.01 );
    gui.add( effectController, "rotate_thruster" );
				
    
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
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1500;
    controls.maxDistance = 2000;
    controls.minPolarAngle = Math.PI/2;
    controls.maxPolarAngle = Math.PI/2;
    
    controls.enablePan = false;
    
    controls.target.set(0,0,-00);
    controls.update();
    
    var updateFcts	= [];
    
    stats	= new Stats();
	stats.domElement.style.position	= 'absolute'
	stats.domElement.style.right	= '0px'
	stats.domElement.style.bottom	= '0px'
	document.body.appendChild( stats.domElement )
    
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
var lastTimeMsec= null
function render(nowMsec) {
    var delta = clock.getDelta();
    for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[ i ].update( delta );
    }
    if(sceneObjects.object_ready && effectController.rotate_thruster){
       sceneObjects.rotor.rotation.x += effectController.thruster_speed;
    }
    lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    stats.update(deltaMsec/1000, nowMsec/1000)
    renderer.render( scene, camera );
}

