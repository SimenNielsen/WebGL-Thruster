class SceneWater{
	constructor(directionalLight, scene) {
		this.init_water(directionalLight, scene);
	}

    init_water(directionalLight, scene) {
        //===================================================== add water

        let waterGeo = new THREE.PlaneGeometry(6000, 6000, 100, 100);


        for (let j = 0; j < waterGeo.vertices.length; j++) {
          waterGeo.vertices[j].x = waterGeo.vertices[j].x + Math.random() * Math.random() * 30;
          waterGeo.vertices[j].y = waterGeo.vertices[j].y + Math.random() * Math.random() * 20;
        }

        this.waterObj = new THREE.Water(
            waterGeo,
            {
                textureWidth: 512,
                textureHeight: 512,
                alpha: 0.8,
                sunDirection: directionalLight.position.clone().normalize(),
                sunColor: 0xffffff,
                waterColor: 0x00aeff,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        this.waterObj.rotation.x = -Math.PI / 2;
        scene.add(this.waterObj);
        this.waterObj.receiveShadow = true;
        this.waterObj.castShadow = true;
    }
}
