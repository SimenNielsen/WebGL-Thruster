class Lighting{
    constructor(scene){
        this.scene = scene;
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        this.hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 10 );
        this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        this.dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 10 );
        this.init_lights();
    }
    init_lights(){
        this.init_hemiLight();
        //this.init_hemiLightHelper();
        this.init_dirLigth();
        //this.init_dirLightHelper();
    }
    init_hemiLight(){
        this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
        this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.hemiLight.position.set( 0, 50, 0 );
        this.scene.add( this.hemiLight );
    }
    init_hemiLightHelper(){
        this.scene.add(this.hemiLightHelper);
    }
    init_dirLigth(){
        this.dirLight.color.setHSL( 0.1, 1, 0.95 );
        this.dirLight.position.set( - 1, 1.75, 1 );
        this.dirLight.position.multiplyScalar( 100 );
        this.scene.add( this.dirLight );

        this.dirLight.castShadow = true;

        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;

        let d = 50;
        this.dirLight.shadow.camera.left = - d*10;
        this.dirLight.shadow.camera.right = d*10;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = - d;

        this.dirLight.shadow.camera.near = 10;
        this.dirLight.shadow.camera.far = 6000*2;
        this.dirLight.shadow.bias = - 0.0000002;
    }
    init_dirLightHelper(){
        this.scene.add(this.dirLightHeper);
    }
    
    init_addSun(parent){
        this.dirLight.position.set(0,0,0);
        parent.add(this.dirLight);
    }
}