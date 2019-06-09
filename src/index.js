import * as THREE from 'three';
import style from './main.css';

import TetrisEngine from './engine/TetrisEngine';

/**
 * Tutorial from https://threejs.org/docs/#manual/en/introduction/Drawing-lines
 */

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

var scene = new THREE.Scene();

//create a blue LineBasicMaterial
var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
geometry.vertices.push(new THREE.Vector3(0, 10, 0));
geometry.vertices.push(new THREE.Vector3(10, 0, 0));

var line = new THREE.Line(geometry, material);
renderer.render(scene, camera);

const tetrisCallback = (event, data) => {
  console.log(event);
  console.log(data);
  switch (event) {
    case 'activePieceReplaced':
      data.blocks.forEach((block) => {
        let rand = Math.floor(Math.random() * colors.length);
        let mat = new THREE.LineBasicMaterial({ color: colors[rand] });
        let renderBlock = new THREE.Line(drawBlock(block), mat);
        scene.add(renderBlock);
        renderBlocks.push({ renderBlock, piece: data, block });
      });
    case 'pieceMoved':
      renderBlocks.forEach((renderBlock) => {
        if (renderBlock.piece === data) {
          const size = 1;
          let geometry = renderBlock.renderBlock.geometry;
          data.blocks.forEach((block) => {
            if (renderBlock.block === block) {
              let pos = block.pos;
              geometry.vertices[0].x = pos.x;
              geometry.vertices[0].y = -pos.y;

              geometry.vertices[1].x = pos.x + size;
              geometry.vertices[1].y = -pos.y;

              geometry.vertices[2].x = pos.x + size;
              geometry.vertices[2].y = -pos.y + size;

              geometry.vertices[3].x = pos.x;
              geometry.vertices[3].y = -pos.y + size;

              geometry.vertices[4].x = pos.x;
              geometry.vertices[4].y = -pos.y;
            }
          });
          geometry.verticesNeedUpdate = true;
        }
      });
  }
};

let engine = new TetrisEngine();
engine.addTetrisListener(tetrisCallback);

const updateTetris = () => {
  let gameContinues = engine.step();
  engine.step();
  if (gameContinues) {
    setTimeout(updateTetris, 1000);
  }
};

let renderBlocks = [];

const drawBlock = (block, mat) => {
  let pos = block.getPos();

  // TODO: Make a more sophisticated block creation policy? 
  let newBlock = new THREE.Geometry();
  const size = 1;
  newBlock.vertices.push(new THREE.Vector3(pos.x, -pos.y, 0));
  newBlock.vertices.push(new THREE.Vector3(pos.x + size, -pos.y, 0));
  newBlock.vertices.push(new THREE.Vector3(pos.x + size, -pos.y + size, 0));
  newBlock.vertices.push(new THREE.Vector3(pos.x, -pos.y + size, 0));
  newBlock.vertices.push(new THREE.Vector3(pos.x, -pos.y, 0));
  return newBlock;
}

const colors = [
  0x0000ff,
  0x00ff00
];

var render = () => {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

setTimeout(updateTetris, 1000);
render();
