/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/
class Sky{
    constructor(scene, lights){
        this.scene = scene;
        this.lights = lights;
    }
    
    initSky() {

        // Add Sky
        this.sky = new THREE.Sky();
        this.sky.scale.setScalar( 450000 );
        this.scene.add( this.sky );

        // Add Sun Helper
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        this.sunSphere.position.y = - 700000;
        this.sunSphere.visible = false;
        this.lights.init_addSun(this.sunSphere);
        this.scene.add( this.sunSphere );

        /// GUI

        this.effectController  = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: 0, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: true
        };

        this.distance = 6000;
        this.update();
    }
    
    update() {

        let uniforms = this.sky.material.uniforms;
        uniforms.turbidity.value = this.effectController.turbidity;
        uniforms.rayleigh.value = this.effectController.rayleigh;
        uniforms.luminance.value = this.effectController.luminance;
        uniforms.mieCoefficient.value = this.effectController.mieCoefficient;
        uniforms.mieDirectionalG.value = this.effectController.mieDirectionalG;

        var theta = Math.PI * ( this.effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( this.effectController.azimuth - 0.5 );

        this.sunSphere.position.x = this.distance * Math.cos( phi );
        this.sunSphere.position.y = this.distance * Math.sin( phi ) * Math.sin( theta );
        this.sunSphere.position.z = this.distance * Math.sin( phi ) * Math.cos( theta );

        this.sunSphere.visible = this.effectController.sun;

        uniforms.sunPosition.value.copy( this.sunSphere.position );
    }
}




THREE.Sky = function () {

	let shader = THREE.Sky.SkyShader;
    console.log("hello");
	let material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		side: THREE.BackSide
	} );

	THREE.Mesh.call( this, new THREE.BoxBufferGeometry( 1, 1, 1 ), material );
};

THREE.Sky.prototype = Object.create( THREE.Mesh.prototype );

THREE.Sky.SkyShader = {

	uniforms: {
		luminance: { value: 1 },
		turbidity: { value: 10 },
		rayleigh: { value: 2 },
		mieCoefficient: { value: 0.007 },
		mieDirectionalG: { value: 0.8 },
		sunPosition: { value: new THREE.Vector3() }
	},

	vertexShader: [
		'uniform vec3 sunPosition;',
		'uniform float rayleigh;',
		'uniform float turbidity;',
		'uniform float mieCoefficient;',

		'varying vec3 vWorldPosition;',
		'varying vec3 vSunDirection;',
		'varying float vSunfade;',
		'varying vec3 vBetaR;',
		'varying vec3 vBetaM;',
		'varying float vSunE;',

		'const vec3 up = vec3( 0.0, 1.0, 0.0 );',

		// constants for atmospheric scattering
		'const float e = 2.71828182845904523536028747135266249775724709369995957;',
		'const float pi = 3.141592653589793238462643383279502884197169;',

		// wavelength of used primaries, according to preetham
		'const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );',
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		'const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );',

		// mie stuff
		// K coefficient for the primaries
		'const float v = 4.0;',
		'const vec3 K = vec3( 0.686, 0.678, 0.666 );',
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		'const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );',

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		'const float cutoffAngle = 1.6110731556870734;',
		'const float steepness = 1.5;',
		'const float EE = 1000.0;',

		'float sunIntensity( float zenithAngleCos ) {',
		'	zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );',
		'	return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );',
		'}',

		'vec3 totalMie( float T ) {',
		'	float c = ( 0.2 * T ) * 10E-18;',
		'	return 0.434 * c * MieConst;',
		'}',

		'void main() {',

		'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
		'	vWorldPosition = worldPosition.xyz;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'	gl_Position.z = gl_Position.w;', // set z to camera.far

		'	vSunDirection = normalize( sunPosition );',

		'	vSunE = sunIntensity( dot( vSunDirection, up ) );',

		'	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );',

		'	float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );',

		// extinction (absorbtion + out scattering)
		// rayleigh coefficients
		'	vBetaR = totalRayleigh * rayleighCoefficient;',

		// mie coefficients
		'	vBetaM = totalMie( turbidity ) * mieCoefficient;',

		'}'
	].join( '\n' ),

	fragmentShader: [
		'varying vec3 vWorldPosition;',
		'varying vec3 vSunDirection;',
		'varying float vSunfade;',
		'varying vec3 vBetaR;',
		'varying vec3 vBetaM;',
		'varying float vSunE;',

		'uniform float luminance;',
		'uniform float mieDirectionalG;',

		'const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );',

		// constants for atmospheric scattering
		'const float pi = 3.141592653589793238462643383279502884197169;',

		'const float n = 1.0003;', // refractive index of air
		'const float N = 2.545E25;', // number of molecules per unit volume for air at
									// 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		'const float rayleighZenithLength = 8.4E3;',
		'const float mieZenithLength = 1.25E3;',
		'const vec3 up = vec3( 0.0, 1.0, 0.0 );',
		// 66 arc seconds -> degrees, and the cosine of that
		'const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;',

		// 3.0 / ( 16.0 * pi )
		'const float THREE_OVER_SIXTEENPI = 0.05968310365946075;',
		// 1.0 / ( 4.0 * pi )
		'const float ONE_OVER_FOURPI = 0.07957747154594767;',

		'float rayleighPhase( float cosTheta ) {',
		'	return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );',
		'}',

		'float hgPhase( float cosTheta, float g ) {',
		'	float g2 = pow( g, 2.0 );',
		'	float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );',
		'	return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );',
		'}',

		// Filmic ToneMapping http://filmicgames.com/archives/75
		'const float A = 0.15;',
		'const float B = 0.50;',
		'const float C = 0.10;',
		'const float D = 0.20;',
		'const float E = 0.02;',
		'const float F = 0.30;',

		'const float whiteScale = 1.0748724675633854;', // 1.0 / Uncharted2Tonemap(1000.0)

		'vec3 Uncharted2Tonemap( vec3 x ) {',
		'	return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;',
		'}',


		'void main() {',
		// optical length
		// cutoff angle at 90 to avoid singularity in next formula.
		'	float zenithAngle = acos( max( 0.0, dot( up, normalize( vWorldPosition - cameraPos ) ) ) );',
		'	float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );',
		'	float sR = rayleighZenithLength * inverse;',
		'	float sM = mieZenithLength * inverse;',

		// combined extinction factor
		'	vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );',

		// in scattering
		'	float cosTheta = dot( normalize( vWorldPosition - cameraPos ), vSunDirection );',

		'	float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );',
		'	vec3 betaRTheta = vBetaR * rPhase;',

		'	float mPhase = hgPhase( cosTheta, mieDirectionalG );',
		'	vec3 betaMTheta = vBetaM * mPhase;',

		'	vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );',
		'	Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );',

		// nightsky
		'	vec3 direction = normalize( vWorldPosition - cameraPos );',
		'	float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]',
		'	float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]',
		'	vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );',
		'	vec3 L0 = vec3( 0.1 ) * Fex;',

		// composition + solar disc
		'	float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );',
		'	L0 += ( vSunE * 19000.0 * Fex ) * sundisk;',

		'	vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );',

		'	vec3 curr = Uncharted2Tonemap( ( log2( 2.0 / pow( luminance, 4.0 ) ) ) * texColor );',
		'	vec3 color = curr * whiteScale;',

		'	vec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );',

		'	gl_FragColor = vec4( retColor, 1.0 );',

		'}'
	].join( '\n' )

};