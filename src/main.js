
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
  this.shape = 0.0;
  this.distribution = 0.0;
  this.color = 0.0;
  this.orientation = 0.0;
  this.speed = 0.0;
  this.flapping = 0.0; 
};

// Uniform time to be sent to shader
var totalTime = 0.0; 

// var that stores the points on the spline to put a feather on it
var feathPos = []; 

// constrain the size of the wing : find a length constraint (i.e. 10.0 units)
// when resiing the feather distribution and size, if the feather ends up outside of the 
// constraint then do not display it. 
var lengthConstrain = 20.0;

// animated wing object, to be used later
function animateWing(con1, con2, con3) {
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

        var featherMesh = new THREE.Mesh(featherGeo, featherMaterial);
        featherMesh.name = "feather";
        scene.add(featherMesh);

        // adjust the feather distribution by changing ratio of distance between each
        // todo: make this variable user adjustable
        var featherDistrib = 1 / 4.0; 

        // create a multitude of feathers
        // for (var i = 1; i <= 20; i++) {
        //     var feath = new THREE.Mesh(featherGeo, lambertWhite);
        //     feath.name = "newFeath: " + i;
        //     feath.position.set(0, 0, i * featherDistrib);
        //     scene.add(feath);
        // }
        
        // add feathers based on the spline positions
        for (var i = 0; i < feathPos.length; i ++) {
            var feath = new THREE.Mesh(featherGeo, lambertWhite);
            feath.name = "newFeath: " + i;
            feath.position.set(feathPos[i].x, feathPos[i].y, feathPos[i].z);
        }

    });
//-----------------------------------------------------------------------------
// CREATE BASIC CURVE
var numPoints = 100;

var p1 = new THREE.Vector3(0,0,0);
var p2 = new THREE.Vector3(3,0,15);
var p3 = new THREE.Vector3(12,0,30);

// add these points to the member array
feathPos.push(p1);
feathPos.push(p2);
feathPos.push(p3); 

var spline = new THREE.SplineCurve3([
    p1, p2, p3 
   // new THREE.Vector3(0, 0, 0),
   // new THREE.Vector3(0, 0, 50),
   // new THREE.Vector3(75, 0, 75),

   // new THREE.Vector3(0, 200, 0),
   // new THREE.Vector3(150, 150, 0),
   // new THREE.Vector3(150, 50, 0),
   // new THREE.Vector3(250, 100, 0),
   // new THREE.Vector3(250, 300, 0)
]);

var geometry = new THREE.Geometry();
var splinePoints = spline.getPoints(numPoints);

for(var i = 0; i < splinePoints.length; i++){
    geometry.vertices.push(splinePoints[i]);  
}

var line = new THREE.Line(geometry, lambertWhite);
scene.add(line);
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
    gui.add(items, "distribution", 0.0, 1.0);
    gui.add(items, "color", 0.0, 1.0);
    gui.add(items, "orientation", 0.0, 1.0);
    gui.add(items, "flapping", 0.0, 1.0);
}

// called on frame updates
function onUpdate(framework) {
    var feather = framework.scene.getObjectByName("feather");    
    if (feather !== undefined) {
        // Simply flap wing
        var date = new Date();

        // take out animation temporarily here: 
        // feather.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);        
    }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);

// toolbox functions
function smoothstep(edge0, edge1, x) {
    x = sin((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3 - 2 * x);
}





