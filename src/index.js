import * as THREE from 'three';

/**
 * Tutorial from: https://www.learnthreejs.com/beginners-tutorial/#more-13
 */
let WIDTH = 640;
let HEIGHT = 360;

let FOV = 75;
let ASPECT = WIDTH / HEIGHT;
let NEAR = 0.1;
let FAR = 2000;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var render = () => {
  requestAnimationFrame(render);

  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;

  renderer.render(scene, camera);
};

render();
