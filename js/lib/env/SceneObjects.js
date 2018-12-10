class SceneObjects{
    constructor(scene){
        this.scene = scene;
        this.thruster = {MTL_path: 'models/', 
                       MTL_file: undefined,
                       OBJ_path: 'models/', 
                       OBJ_file: 'Thruster.obj',
                      };
        this.load_object(this.thruster, this.add_obj_to_scene.bind(this));
    }
    

    load_object(object_info, callback){
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
                            child.castShadow = true;
                            child.receiveShadow = true; 
                        }   
                    });
                    callback(object);
                }.bind(this));
        }.bind(this) );
    }
    
    add_obj_to_scene(object){
        this.scene.add(object);
        object.rotation.set(200,0,30);
        object.position.set(0,300,0);
        object.scale.set(0.3,0.3,0.3);
    }
}