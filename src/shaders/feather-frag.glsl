varying vec2 vUv;
varying vec3 vNormal;
varying float vNoiseValue;
varying float noise;

varying vec3 vPos; 

uniform sampler2D image;
uniform float u_color; 

varying float facingRatio;

float lerp(float a, float b, float t) {
	return a * (1.0 - t) + b * t; 
}

void main() {
	vec3 turq = vec3(0.407, 0.694, 0.972); 
	vec3 coral = vec3(0.980, 0.6, 0.6);
	vec3 navy = vec3(0.019, 0.196, 0.678);
	float x = lerp(navy.x, turq.x, vPos.x);
	// float y = lerp(navy.y, turq.y, vPos.y);
	// float z = lerp(navy.z, turq.z, vPos.z);

	// Pretty blue : 0.607, 0.909, 0.898
	vec4 baseCol = vec4(turq.x + vNormal.x / 10.0 , turq.y + vNormal.y / 10.0, turq.z + vNormal.z / 10.0 , 1.0);

	vec4 lerpCol = vec4(.5 * (1.0 - u_color), x + .2 ,x + .4,1.0);
	
	// Color based on surface normals 
    // vec4 color = vec4(vNormal.x, vNormal.y, vNormal.z, 1.0);
	gl_FragColor = lerpCol * .5 + baseCol * .5;

}