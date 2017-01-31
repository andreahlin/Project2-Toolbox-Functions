
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
// Wing speed, curvature of the wing's basic shape, Feather distribution
// Feather size, Feather color, Feather orientation, Flapping speed, Flapping motion
// GUI STUFF
var guiItems = function() {
  this.wind = 0.0;
  this.shape = 1.0;
  this.size = 1.0; 
  this.distribution = 0.0;
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
var featherOrientation = 0; 
var wingFlap = 1.0; 

// animated wing object, to be used later
function animatedWing(con1, con2, con3) {
// use each of the control points to draw spheres on the wing
// manipulate them so that you can change them 
    this.control1 = con1;
    this.control2 = con2;
    this.control3 = con3;
    this.color = 1.0; 
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
    var urlPrefix = '/images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    // take out skybox temporarily here: 
    // scene.background = skymap;

    // load a simple obj mesh
    // FEATHER BODY = 2.0 units long
    var objLoader = new THREE.OBJLoader();
    objLoader.load('/geo/feather.obj', function(obj) {

        // LOOK: This function runs after the obj has finished loading
        var featherGeo = obj.children[0].geometry;

        // initial single feather mesh
        // var featherMesh = new THREE.Mesh(featherGeo, featherMaterial);
        // featherMesh.name = "feather";
        // scene.add(featherMesh);

        // add feathers based on the spline positions
        for (var i = 0; i < 100; i ++) {
            // feather 1 
            var feath = new THREE.Mesh(featherGeo, featherMaterial);
            feath.position.set(splinePoints1[i * featherDistrib].x, 
                               splinePoints1[i * featherDistrib].y, 
                               splinePoints1[i * featherDistrib].z);
            feath.name = "" + i;
            var dSize = (100 - i) / 100.0; 
            feath.scale.set(featherSize * dSize,featherSize,featherSize);
            feath.rotation.set(0 , 0 + featherOrientation , 0.1);
            scene.add(feath);

            // feather 2 
            var feath2 = new THREE.Mesh(featherGeo, featherMaterial);
            feath2.position.set(splinePoints2[i * featherDistrib].x , 
                splinePoints2[i * featherDistrib].y - 0.3, 
                splinePoints2[i * featherDistrib].z);
            feath2.name = "" + (100 + i);
            feath2.scale.set(featherSize * 1.4,featherSize * 1.4, featherSize * 1.4) ;
            feath2.rotation.set(0 , 0 + featherOrientation, 0.1);
            scene.add(feath2);

            // feather 3
            var feath3 = new THREE.Mesh(featherGeo, featherMaterial);
            feath3.position.set(splinePoints3[i * featherDistrib].x , 
                splinePoints3[i * featherDistrib].y - 0.7, 
                splinePoints3[i * featherDistrib].z);
            feath3.name = "" + (200 + i);
            feath3.scale.set(featherSize * 1.4,featherSize * 1.4, featherSize * 1.4) ;
            feath3.rotation.set(0 , 0 + featherOrientation , 0.1);
            scene.add(feath3);
        }
    });

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
var axis = new THREE.AxisHelper(75);
scene.add(axis);     
//-----------------------------------------------------------------------------
    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });

    var items = new guiItems(); 
    gui.add(items, "wind", 0.0, 1.0);
    gui.add(items, "shape", 0.0, 1.0);

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

    // FIX DISTRIBUtiON FUNCTION... 
    gui.add(items, "distribution", 0.0, 2.0).onChange(function(newVal) {
        for (var i = 0; i < 300; i++) {
            var feather = framework.scene.getObjectByName("" + i);
            if (feather !== undefined) {
                feather.position.set(feather.position.x, feather.position.y, feather.position.z * (newVal + 1.0));
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
    // var feather = framework.scene.getObjectByName("feather");    
    // if (feather !== undefined) {
    //     // Simply flap wing
    //    // take out animation temporarily here: 
    //     feather.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);        
    // }
    
    // move the entire wing based on simple animation
            var date = new Date();
            for (var i = 0; i < 300; i++) {
            var feather = framework.scene.getObjectByName("" + i);
            if (feather !== undefined) {
                feather.rotateZ(Math.sin(date.getTime() / 200.0) * -(1 * wingFlap) * Math.PI / 180);        
            } 
        }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);

// toolbox functions
function lerp(a, b, t) {
    return (1- a) * t + b * t; 
}

function smoothstep(a, b, x) {
    x = clamp((x - a) / (b - a), 0.0, 1.0);
    return x * x * (3 - 2 * x);
}

// c = centering
// w = taper length
function cubicPulse(c, w, x) {
    x = abs(x - c);
    if (x > w) { return 0.0; }
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}




