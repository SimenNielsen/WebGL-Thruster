class SceneObjects{
    constructor(scene, callback){
        this.scene = scene;
        this.thruster = {MTL_path: 'models/', 
                       MTL_file: undefined,
                       OBJ_path: 'models/', 
                       OBJ_file: 'Thruster.obj',
                      };
        this.load_object(this.thruster);
        this.callback = callback;
        this.parts = [];
    }
    

    load_object(object_info){
        new THREE.MTLLoader()
        .setPath( object_info.MTL_path )
        .load( object_info.MTL_file, function ( materials ) {

            materials.preload();
            
            new THREE.OBJLoader()
                .setMaterials( materials )
                .setPath(object_info.OBJ_path)
                .load(object_info.OBJ_file, function ( object ) {
                    object.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            console.log(child.name);
                            child.material = new THREE.MeshPhongMaterial({flatShading:true});
                            this.parts.push(child);
                            if(child.name === "Part__Feature182"){
                                console.log("child found");
                                child.material.color = new THREE.Color(0xffff00);
                                child.geometry.center();
                                child.scale.set(0.95,0.95,0.95);
                                child.position.z = -1100;
                                child.position.x = 655;
                                this.rotor = child;
                                return;
                            }
                        }   
                    }.bind(this));
                    this.add_obj_to_scene(object)
                }.bind(this));
        }.bind(this) );
    }
    
    add_obj_to_scene(object){
        this.thrusterobj = object;
        this.scene.add(object);
        object.position.x = 0;
        object.position.z = -200;
        object.position.y = 600;
        object.rotation.x = -Math.PI / 2;
        object.rotation.z = -Math.PI / 2;;
        object.scale.set(0.6,0.6,0.6);
        this.object_ready = true;
    }
}