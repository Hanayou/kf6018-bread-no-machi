import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import Stats from 'stats';
import { GLTFLoader } from 'GLTFLoader';
import { RenderPass } from 'RenderPass';
import {UnrealBloomPass} from 'UnrealBloomPass';
import {EffectComposer} from 'EffectComposer'
import { Water } from 'Water';

// Scene Initialisation
console.log("Create the scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x3333 );

// Camera Initialisation
console.log("Create the camera");
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 25);

// Renderer Initialisation
console.log("Create the renderer");
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
// Renderer Lighting Config
renderer.physicallyCorrectLights = true;
// Renderer Shadow Config
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Renderer Tone Mapping

// Controls Initialisation
console.log("Create the camera controller");
const controls = new PointerLockControls(camera, renderer.domElement);
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let cameraForwardVector = new THREE.Vector3();
let cameraRightVector = new THREE.Vector3();
let movementSpeed = 10.0;

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions.addEventListener( 'click', function () {

    controls.lock();

} );

controls.addEventListener( 'lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

} );

controls.addEventListener( 'unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

} );

const onKeyDown = function ( event ) {
    switch ( event.code ) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'KeyE':
            moveUp = true;
            break;
        case 'KeyQ':
            moveDown = true;
            break;
    }
};
const onKeyUp = function ( event ) {
    switch ( event.code ) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'KeyE':
            moveUp = false;
            break;
        case 'KeyQ':
            moveDown = false;
            break;
    }
};
document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );
document.addEventListener('wheel', event => {
    if (movementSpeed >= 1) movementSpeed += Math.sign(-event.deltaY);
    if (movementSpeed <= 0) movementSpeed = 1;
});

// Clock Initialisation
var clock = new THREE.Clock();

// Stats Initialisation
const stats = new Stats();
document.body.appendChild(stats.dom);

// ** LIGHTING **
// Ambient Light
const ambientLight = new THREE.AmbientLight(0x00ffff, 0.1);
scene.add(ambientLight);
// Sun Light
const moonLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(moonLight);
moonLight.position.set(10, 10, 10);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 512;
moonLight.shadow.mapSize.height = 512;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 500;
moonLight.shadow.bias = -0.00001;

// AxesHelper (ADD TO DEBUG MENU)
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// Handle window resizing
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
}

// Updates position of the camera based on keyboard input, in regards to delta time.
let globalUpVector = new THREE.Vector3(0, 1, 0);
let GlobalUpMovement = new THREE.Vector3(0, 0, 0);
function updateMovement(deltaTime) {
    if (controls.isLocked === true) {
        camera.getWorldDirection(cameraForwardVector);
        cameraRightVector.crossVectors(cameraForwardVector.normalize(), globalUpVector);
        cameraForwardVector = cameraForwardVector.normalize().multiplyScalar(movementSpeed).multiplyScalar(deltaTime);
        cameraRightVector = cameraRightVector.normalize().multiplyScalar(movementSpeed).multiplyScalar(deltaTime);
        GlobalUpMovement = globalUpVector.normalize().multiplyScalar(movementSpeed).multiplyScalar(deltaTime);

        if (moveForward) camera.position.add(cameraForwardVector);
        if (moveBackward) camera.position.sub(cameraForwardVector);
        if (moveRight) camera.position.add(cameraRightVector);
        if (moveLeft) camera.position.sub(cameraRightVector);
        if (moveUp) camera.position.add(GlobalUpMovement);
        if (moveDown) camera.position.sub(GlobalUpMovement);
    }
}



// POST PROCESSING
const renderScene = new RenderPass(scene, camera);
// Add bloom
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, innerHeight), 2, 1, 0.8);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// MODEL / TEXTURE LOADING
const loader = new GLTFLoader();
loader.load(
    './src/assets/models/landscape.glb', // Load Landscape
    function(gltf) {
        gltf.scene.traverse( function( child ) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
    }
);
loader.load(
    './src/assets/models/shrine.glb', // Load Shrine
    function(gltf) {
        gltf.scene.traverse( function( child ) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.emissiveIntensity = 10;
            }
        });
        scene.add(gltf.scene);
    }
);
loader.load(
    './src/assets/models/torii.glb', // Load Torii Gate
    function(gltf) {
        gltf.scene.traverse( function( child ) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
    }
);
loader.load(
    './src/assets/models/ishidoro.glb', // Load Ishidoro (lantern)
    function(gltf) {
        gltf.scene.traverse( function( child ) {
            if ( child.isMesh ) { 
                child.castShadow = false;
                child.receiveShadow = true;
                child.material.emissiveIntensity = 5;

                // Add point light
                const light = new THREE.PointLight(0xffd949, 5, 100);
                light.position.set(child.position.x, child.position.y + 2, child.position.z);
                scene.add(light);
                light.castShadow = true;
            }
        });
        scene.add(gltf.scene);
    }
);
loader.load(
    './src/assets/models/steps.glb', // Load Steps
    function(gltf) {
        gltf.scene.traverse( function( child ) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
    }
);

// Lake (with water shader)
const waterGeometry = new THREE.PlaneGeometry(18.6, 50);
let water = new Water(waterGeometry, {
    color: 0xffffff,
    scale: 4.0,
    flowDirection: new THREE.Vector2(1.0, 1.0),
    textureWidth: 1024,
    textureHeight: 1024
});
water.position.y = -4.0;
water.position.z = 15.0;
water.rotation.x = Math.PI * -0.5;
scene.add(water);


// GAME LOOP
console.log("Define animation function");
function animate()
{
    requestAnimationFrame(animate);

    // Set deltaTime
    const deltaTime = clock.getDelta();
    updateMovement(deltaTime);

    stats.update();

    renderer.render(scene, camera);

    composer.render();
}
animate();