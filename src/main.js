import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import Stats from 'stats';

console.log("Create the scene");
var scene = new THREE.Scene();

console.log("Create the camera");
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.x = 0;
camera.position.y = -200;
camera.position.z = 100;

console.log("Create the renderer");
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

console.log("Create the camera controller");
var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();


const stats = new Stats();
document.body.appendChild(stats.dom);

console.log("Define animation function");
function animate() 
{
    requestAnimationFrame(animate);
    stats.update();
    renderer.render(scene, camera);

}
animate();


