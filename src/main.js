
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

// create new feather material 
    var featherMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      u_persistance: { value : 0.7 },
      u_color: {value : 0.0 },
    },
    vertexShader: require('./shaders/feather-vert.glsl'),
    fragmentShader: require('./shaders/feather-frag.glsl')
  });

// GUI FOR:
// Wing speed, curvature of the wing's basic shape, feather size,
// Feather color, Feather orientation, Flapping speed, Flapping motion
var guiItems = function() {
  this.wind = 0.0;
  this.shape = 4.0;
  this.size = 1.0; 
  this.distribution = 2;
  this.color = 0.5;
  this.orientation = 0.0;
  this.speed = 0.0;
  this.flapping = 1.0; 
};

// Uniform time to be sent to shader
var totalTime = 0.0; 

// adjust the feather distribution by changing ratio of distance between each
// todo: make these two variable user adjustable
// var finalFeatherCollection = [];
var featherDistrib = 2.0; 
var featherSize = 3.0; 
var wingFlap = 1.0; 
var windStrength = 0.0; 
var wingShape = 4.0; 
//-----------------------------------------------------------------------------
// toolbox functions
function lerp(a, b, t) {
    return a * (1- t) + b * t; 
}

function smoothstep(a, b, x) {
    x = clamp((x - a) / (b - a), 0.0, 1.0);
    return x * x * (3 - 2 * x);
}

// c = centering
// w = taper length
function cubicPulse(c, w, x) {
    x = Math.abs(x - c);
    if (x > w) { return 0.0; }
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}
//-----------------------------------------------------------------------------
// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert white
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    // take out skybox temporarily here: 
    scene.background = skymap;

    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('geo/feather.obj', function(obj) {
        // Project2-Toolbox-Functions/blob/master/geo/feather.obj

        // LOOK: This function runs after the obj has finished loading
        var featherGeo = obj.children[0].geometry;
        // var featherOrientation = 0.0; 

        // add feathers based on the spline positions
        for (var i = 0; i < 100; i ++) {
            // spline 1 
            var feath = new THREE.Mesh(featherGeo, featherMaterial);
            feath.position.set(splinePoints1[i * featherDistrib].x, 
                               splinePoints1[i * featherDistrib].y, 
                               splinePoints1[i * featherDistrib].z);
            var featherOrientation = lerp(-0.5,-3.0, feath.position.z / 50.0);
            feath.name = "" + i;
            var dSize = (100 - i) / 100.0; 
            feath.scale.set(featherSize * dSize,featherSize,featherSize);
            feath.rotation.set(0, featherOrientation , 0.1);
            scene.add(feath);

            // spline 2 
            var feath2 = new THREE.Mesh(featherGeo, featherMaterial);
            feath2.position.set(splinePoints2[i * featherDistrib].x , 
                splinePoints2[i * featherDistrib].y - 0.3, 
                splinePoints2[i * featherDistrib].z);
            var featherOrientation = lerp(-0.5, -3.0, feath2.position.z / 50.0);
            feath2.name = "" + (100 + i);
            feath2.scale.set(featherSize * 1.4,featherSize * 1.4, featherSize * 1.4) ;
            feath2.rotation.set(0, featherOrientation, 0.1);
            scene.add(feath2);

            // spline 3
            var feath3 = new THREE.Mesh(featherGeo, featherMaterial);
            feath3.position.set(splinePoints3[i * featherDistrib].x , 
                splinePoints3[i * featherDistrib].y - 0.7, 
                splinePoints3[i * featherDistrib].z);
            var featherOrientation = lerp(-0.5,-3.0, feath3.position.z / 50.0);
            feath3.name = "" + (200 + i);
            feath3.scale.set(featherSize * 1.4,featherSize * 1.4, featherSize * 1.4) ;
            feath3.rotation.set(0 , featherOrientation , 0.1);
            scene.add(feath3);
        }
    });
// user data 
//-----------------------------------------------------------------------------
// CREATE BASIC CURVE
var numPoints = 100;

// first spline
var spline1 = new THREE.SplineCurve3([
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(1,0,-2),
    new THREE.Vector3(3,0,-15),
    new THREE.Vector3(12,0,-30)
]);

var geometry = new THREE.Geometry();
var splinePoints1 = spline1.getPoints(numPoints);

for(var i = 0; i < splinePoints1.length; i++){
    geometry.vertices.push(splinePoints1[i]);  
}
// var line = new THREE.Line(geometry, lambertWhite);
// scene.add(line);

// second spline
var spline2 = new THREE.SplineCurve3([
    new THREE.Vector3(0,0,1),
    new THREE.Vector3(4,0,-15),
    new THREE.Vector3(13,0,-30)
]);

var geometry2 = new THREE.Geometry();
var splinePoints2 = spline2.getPoints(numPoints);

for(var i = 0; i < splinePoints2.length; i++){
    geometry2.vertices.push(splinePoints2[i]);  
}
// line = new THREE.Line(geometry2, lambertWhite);
// scene.add(line);

// third spline
var spline3 = new THREE.SplineCurve3([
    new THREE.Vector3(2,0,0),
    new THREE.Vector3(8,0,-22)
]);

var geometry3 = new THREE.Geometry();
var splinePoints3 = spline3.getPoints(numPoints);

for(var i = 0; i < splinePoints3.length; i++){
    geometry3.vertices.push(splinePoints3[i]);  
}
// line = new THREE.Line(geometry3, lambertWhite);
// scene.add(line);

// include an axis for visualization help 
// var axis = new THREE.AxisHelper(75);
// scene.add(axis);     
//-----------------------------------------------------------------------------
    // set camera position
    camera.position.set(1, 10, 10);
    camera.lookAt(new THREE.Vector3(4,0,-5));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });

    // GUI Items 
    var items = new guiItems(); 
    gui.add(items, "wind", 0.0, 3.0).onChange(function(newVal) {
        windStrength = newVal;
    });

    gui.add(items, "shape", 4.0, 10.0).onChange(function(newVal) {
        wingShape = newVal;
    });

    gui.add(items, "color", -1.0, 1.0).onChange(function(newVal) {
        featherMaterial.uniforms.u_color.value = newVal;
    });

    gui.add(items, "size", 1.0, 5.0).onChange(function(newVal) {
        // featherSize = newVal;
        for (var i = 0; i < 300; i++) {
            var feather = framework.scene.getObjectByName("" + i);
            if (feather !== undefined) {
                feather.scale.set(newVal, newVal, newVal);
            } 
        }
    });

    gui.add(items, "orientation", -1.0, 1.0).onChange(function(newVal) {
        for (var i = 0; i < 300; i++) {
            var feather = framework.scene.getObjectByName("" + i);
            if (feather !== undefined) {
                feather.rotation.set(0, newVal,0);   
            } 
        }
    });

    gui.add(items, "flapping", 0.0, 5.0).onChange(function(newVal) {
        wingFlap = newVal;
    });
}

// called on frame updates
function onUpdate(framework) {    
    // move the entire wing based on simple animation
            var date = new Date();
            var x = date.getTime();
            for (var i = 0; i < 300; i++) {
            var feather = framework.scene.getObjectByName("" + i);
            if (feather !== undefined) {
                // set the y positions of the feathers
                if (i < 100) {
                    feather.position.set(feather.position.x, 
                    - Math.cos(feather.position.z / wingShape + 2.0) + 0.1, 
                    feather.position.z);   

                } else if (i < 200) {
                    feather.position.set(feather.position.x, 
                    - Math.cos(feather.position.z / wingShape + 2.0) - 0.2, 
                    feather.position.z);   

                } else {
                    feather.position.set(feather.position.x, 
                    - Math.cos(feather.position.z / wingShape + 2.0) - 0.7, 
                    feather.position.z);   
                }

                // Define animation of the wing: 
                // render without any wind
                if (windStrength < 1.0) {
                    feather.rotateZ(Math.sin(x / 200.0) * - (1.0 * wingFlap) * Math.PI / 180 );        
                }
                // render with wind
                else {
                    var displace = Math.sin(x * windStrength / (i % 100.0) * 200.0) * -(1.0 * 2.0) * Math.PI / 90;
                    feather.rotateY(displace);        
                }
            } 
        }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
//-----------------------------------------------------------------------------
