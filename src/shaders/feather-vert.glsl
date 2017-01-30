varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos; 
varying float vNoiseValue; 
uniform float time;
uniform float u_persistance;

varying float facingRatio;

void main() {

	// iradescence
	// vec3 N = gl_NormalMatrix * gl_Normal;				//vertex normal vector
	// vec3 V = gl_ModelViewMatrix * gl_Vertex;			//eye to vertex vector
	// vec3 E = normalize(-V);						//normalized vertex to eye vector
	// facingRatio = dot(N, E);							//facing ratio

    vUv = uv;
    vNormal = normal;
    vPos = position;

    // alter positions based on noise function
    float timeMod = time / 300.0; 
    // float noiseHeight = fbm(
    // 	float(position.x) + timeMod, 
    // 	float(position.y) + timeMod, 
    // 	float(position.z) + timeMod);
    // vec3 noisyPosition = (vec3(
    // 	position.x + noiseHeight / 100.0 + normal.x * noiseHeight , 
    // 	position.y + noiseHeight / 100.0 + normal.y * noiseHeight , 
    // 	position.z + noiseHeight / 100.0 + normal.z * noiseHeight)); 
    // vNoiseValue = noiseHeight;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4( noisyPosition, 1.0 );

    // display the regular position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}