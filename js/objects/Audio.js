class Audio {
    constructor(camera) {
        this.init_audio(camera);
    }

    init_audio(camera) {
        // create an AudioListener and add it to the camera
        let listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        this.sound = new THREE.Audio(listener);

        // load a sound and set it as the Audio object's buffer
        let audioLoader = new THREE.AudioLoader();
        audioLoader.load('audio/oceansounds.wav', function (buffer) {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.5);
            this.sound.play();
        });
    }
}