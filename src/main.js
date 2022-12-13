import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import Stats from 'stats';

// Scene Initialisation
console.log("Create the scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

// Camera Initialisation
console.log("Create the camera");
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 10;

// Renderer Initialisation
console.log("Create the renderer");
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
// Renderer Shadow Config
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls Initialisation
console.log("Create the camera controller");
const controls = new PointerLockControls(camera, renderer.domElement);
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
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
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);
// Sun Light
const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(sunLight);
sunLight.position.set(1, 1, 1)

// ** GEOMETRY **
// Test Plane Geo
const testPlaneGeo = new THREE.PlaneGeometry(20, 20, 32, 32);
const testPlaneMat = new THREE.MeshPhongMaterial({color: 0xffffff});
const testPlaneMesh = new THREE.Mesh(testPlaneGeo, testPlaneMat);
scene.add(testPlaneMesh);
testPlaneMesh.rotation.x = -Math.PI/2;

// AxesHelper (ADD TO DEBUG MENU)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Handle window resizing
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / window.innerHeight);
}

let globalUpVector = new THREE.Vector3(0, 1, 0);
function updateMovement(deltaTime) {
    if (controls.isLocked === true) {
        camera.getWorldDirection(cameraForwardVector);
        cameraRightVector.crossVectors(cameraForwardVector.normalize(), globalUpVector);
        cameraForwardVector = cameraForwardVector.normalize().multiplyScalar(movementSpeed).multiplyScalar(deltaTime);
        cameraRightVector = cameraRightVector.normalize().multiplyScalar(movementSpeed).multiplyScalar(deltaTime);
        
        if (moveForward) camera.position.add(cameraForwardVector);
        if (moveBackward) camera.position.sub(cameraForwardVector);
        if (moveRight) camera.position.add(cameraRightVector);
        if (moveLeft) camera.position.sub(cameraRightVector);
    }
}

// GAME LOOP
console.log("Define animation function");
function animate()
{
    requestAnimationFrame(animate);

    // Set deltaTime
    let deltaTime = clock.getDelta();
    updateMovement(deltaTime);

    stats.update();
    renderer.render(scene, camera);
}
animate();