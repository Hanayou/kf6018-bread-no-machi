import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import Stats from 'stats';
import { GLTFLoader } from 'GLTFLoader';
import { RenderPass } from 'RenderPass';
import {UnrealBloomPass} from 'UnrealBloomPass';
import {EffectComposer} from 'EffectComposer'
import { Water } from 'Water';
import { GUI } from 'GUI';

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

let bIsFirstInteraction = true;
let bIsAudioPlaying = false;

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions.addEventListener( 'click', function () {
    controls.lock();
});

controls.addEventListener( 'lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';

    if (bIsFirstInteraction || !bIsAudioPlaying) {
        playAudio();
        bIsFirstInteraction = false;
        bIsAudioPlaying = true;
    }
});

controls.addEventListener( 'unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';

    if (bIsAudioPlaying) {
        pauseAudio();
        bIsAudioPlaying = false;
    }
});

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
const ambientLight = new THREE.AmbientLight(0x00ffff, 0.5);
scene.add(ambientLight);
// Moon Light
let moonScale = 10.0;
const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xffffff,
    emissiveIntensity: 1.0
});
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moonMesh);
moonMesh.position.set(200, 150, -250);
moonMesh.scale.set(moonScale, moonScale, moonScale);
let moonLightIntensity = 3.0;
const moonLight = new THREE.DirectionalLight(0xffffff, moonLightIntensity);
scene.add(moonLight);
moonLight.parent = moonMesh;
moonLight.lookAt(0, 0, 0);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 512;
moonLight.shadow.mapSize.height = 512;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 500;
moonLight.shadow.bias = -0.00001;

var moonOrigin = new THREE.Object3D();
scene.add(moonOrigin);
moonMesh.parent = moonOrigin;

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
        gltf.scene.traverse(function(child) {
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
        gltf.scene.traverse(function(child) {
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
        gltf.scene.traverse(function(child) {
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
        gltf.scene.traverse(function(child) {
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
        gltf.scene.traverse(function(child) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
    }
);
let mixer;
loader.load(
    './src/assets/models/sakura.glb', // Load Sakura Tree
     function(gltf) {
        gltf.scene.traverse(function(child) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.material.emissiveIntensity = 1;
            }
        });
        scene.add(gltf.scene);

        // Get & Play Animation
        mixer = new THREE.AnimationMixer(gltf.scene);
        console.log(gltf.animations[0]);
        mixer.clipAction(gltf.animations[0]).play();
        // TODO: Not a priority, but even though this matches documentation
        // the animation refuses to play properly. Look into later if time.
    }
);
loader.load(
    './src/assets/models/starry.glb', // Load Starry Skybox
     function(gltf) {
        gltf.scene.traverse(function(child) {
            if ( child.isMesh ) { 
                child.castShadow = true;
                child.material.emissiveIntensity = 10;
            }
        });
        scene.add(gltf.scene);
    }
);

// Lake (with water shader)
const waterGeometry = new THREE.PlaneGeometry(18.6, 50);
let water = new Water(waterGeometry, {
    color: 0xffd949,
    scale: 4.0,
    flowDirection: new THREE.Vector2(1.0, 1.0),
    textureWidth: 1024,
    textureHeight: 1024
});
water.position.y = -4.0;
water.position.z = 15.0;
water.rotation.x = Math.PI * -0.5;
scene.add(water);


// Fireflies PARTICLES
const radius = 0.3;
const wSegments = 6;
const hSegments = 6;
const petalParticlesGeometry = new THREE.SphereGeometry(radius, wSegments, hSegments);
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    sizeAttenuation: true,
    color: 0xffff00
});
const petalParticles = new THREE.Points(petalParticlesGeometry, particlesMaterial);
petalParticles.position.set(1.5, -2.5, 11.2);
scene.add(petalParticles);
const sourcePosBuffer = petalParticles.geometry.attributes.position.array;
const bufferSize = sourcePosBuffer.length;
const livePosBuffer = sourcePosBuffer;
const randOffset = [];
for (let i = 0; i < bufferSize; ++i) {
    randOffset[i] = Math.random();
}


// AUDIO
const listener = new THREE.AudioListener();
camera.add(listener);

const waterSound = new THREE.PositionalAudio(listener);
const windSound = new THREE.Audio(listener);
const shakuhachiAmbience = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load(
'./src/assets/sounds/waves.ogg',
function (buffer) {
    waterSound.setBuffer(buffer);
    waterSound.setRefDistance(5);
    waterSound.setMaxDistance(10);
    waterSound.setLoop(true);
    waterSound.setVolume(1.0);
    water.add(waterSound);
});
audioLoader.load(
    './src/assets/sounds/wind.ogg',
    function (buffer) {
        windSound.setBuffer(buffer);
        windSound.setLoop(true);
        windSound.setVolume(1.0);
});
audioLoader.load(
    './src/assets/sounds/shakuhachi.ogg',
    function (buffer) {
        shakuhachiAmbience.setBuffer(buffer);
        shakuhachiAmbience.setLoop(true);
        shakuhachiAmbience.setVolume(1.0);
});
    

function playAudio() {
    console.log("Audio Playing");
    waterSound.play();
    //windSound.play();
    shakuhachiAmbience.play();
}

function pauseAudio() {
    console.log("Audio Paused");
    waterSound.pause();
    //windSound.pause();
    shakuhachiAmbience.pause();
}

let settings;
function createSettingsPanel() {
    const panel = new GUI({width: 310});
    
    // folders/groups
    const folder1 = panel.addFolder('Post-processing');
    const folder2 = panel.addFolder('Lighting');

    settings = {
        'Bloom': bRendersBloomPass,

        'Moon Size': moonScale,
        'Moon Colour': moonMesh.material.emissive,
        'Moon Glow Intensity': moonMesh.material.emissiveIntensity,
        'Moon Lighting Intensity': moonLightIntensity,
        'Moon Rotation': moonOrigin.rotation.y
    };

    folder1.add(settings, 'Bloom').onChange(toggleBloomPass);

    folder2.add(settings, 'Moon Size', 0.0, 100.0, 1.0).listen().onChange(resizeMoon);
    folder2.addColor(settings, 'Moon Colour').listen().onChange(setMoonColour);
    folder2.add(settings, 'Moon Glow Intensity', 0.0, 1.0, 0.1).listen().onChange(setMoonGlowIntensity);
    folder2.add(settings, 'Moon Lighting Intensity', 0.0, 25.0, 1.0).listen().onChange(setMoonLightingIntensity);
    folder2.add(settings, 'Moon Rotation', 0.0, 359.0, 1.0).listen().onChange(rotateMoonAroundOrigin);
}

let bRendersBloomPass = true;

function toggleBloomPass(bool) { bRendersBloomPass = bool; }

function resizeMoon(size) { moonMesh.scale.set(size, size, size); }
function setMoonColour(colour) { moonMesh.material.emissive.set(colour); }
function setMoonGlowIntensity(intensity) { moonMesh.material.emissiveIntensity = intensity; }
function setMoonLightingIntensity(intensity) { moonLight.intensity = intensity; }
function rotateMoonAroundOrigin(rotationDegrees) { moonOrigin.rotation.y = THREE.MathUtils.degToRad(rotationDegrees); }

createSettingsPanel();

// GAME LOOP
console.log("Define animation function");
function animate()
{
    requestAnimationFrame(animate);

    // Set deltaTime
    const deltaTime = clock.getDelta();
    updateMovement(deltaTime);
    
    stats.update();

    if (mixer) {
        mixer.update(deltaTime);
    }

    // Update animation of firefly particles
    for (let i = 0; i < bufferSize; ++i)
    {
        livePosBuffer[i] = sourcePosBuffer[i] + (Math.sin(clock.elapsedTime + randOffset[i]) / 1000);
        livePosBuffer[i+1] = sourcePosBuffer[i+1] + (Math.cos(clock.elapsedTime + randOffset[i+1]) / 1000);
        i += 1;
    }
    petalParticles.rotateY(5 * deltaTime)
    petalParticles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    if (bRendersBloomPass) { composer.render(); }
}
animate();