class SeaFloor{
    constructor(scene, sceneObjects){
        this.scene = scene;
        this.init_floor();
        this.sceneObjects = sceneObjects;
        this.numPerCoral = 20;
        this.init_coral();
    }
    
    init_floor(){
        // GROUND

        this.floorGeo = new THREE.PlaneGeometry( 6000, 6000, 100, 100);
        let count = 0;
        for (let j = 0; j < this.floorGeo.vertices.length; j++) {
            this.floorGeo.vertices[j].x = this.floorGeo.vertices[j].x + Math.random() * Math.random() * 30;
            this.floorGeo.vertices[j].y = this.floorGeo.vertices[j].y + Math.random() * Math.random() * 20;
            this.floorGeo.vertices[j].z = Math.random()*40;
        }
        this.floorMat = new THREE.MeshPhongMaterial({
          color: 0xfcda50,
          emissive: 0x6d5700,
          flatShading: THREE.FlatShading,
          shininess: 0,
          specular: 0,
        });

        this.floor = new THREE.Mesh( this.floorGeo, this.floorMat );
        this.floor.rotation.x = - Math.PI / 2;
        this.floor.position.y = - 200;
        this.scene.add( this.floor );
        this.floor.castShadow = true;
        this.floor.receiveShadow = true;
    }
    
    init_coral(){
        this.coral_1_info = {
            OBJ_path : "models/coral/",
            OBJ_file : "Coral1.obj",
            MTL_path : "models/coral/",
            MTL_file : "Coral1.mtl",
        }
        this.coral_2_info = {
            OBJ_path : "models/coral/",
            OBJ_file : "Coral2.obj",
            MTL_path : "models/coral/",
            MTL_file : "Coral2.mtl",
        }
        this.sceneObjects.load_object(this.coral_1_info, this.on_coral_1_loaded.bind(this));
        this.sceneObjects.load_object(this.coral_2_info, this.on_coral_2_loaded.bind(this));
    }
    
    on_coral_1_loaded(object){
        for(let i = 0; i < this.numPerCoral; i++){
            let tmp = object.clone();
            this.floor.add(tmp);
            let vertex = getRandomInt(0,this.floorGeo.vertices.length);
            tmp.position.set(
                this.floorGeo.vertices[vertex].x,
                this.floorGeo.vertices[vertex].y,
                this.floorGeo.vertices[vertex].z
            );
        }
    }
    on_coral_2_loaded(object){
        for(let i = 0; i < this.numPerCoral; i++){
            let tmp = object.clone();
            this.floor.add(tmp);
            let vertex = getRandomInt(0,this.floorGeo.vertices.length);
            tmp.position.set(
                this.floorGeo.vertices[vertex].x,
                this.floorGeo.vertices[vertex].y,
                this.floorGeo.vertices[vertex].z
            );
            tmp.scale.set(4,4,4);
        }
    }
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}