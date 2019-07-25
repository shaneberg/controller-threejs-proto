import * as THREE from 'three';
import style from './main.css';

import TetrisEngine from './engine/TetrisEngine';
import TetrisDefinitions from './engine/TetrisDefinitions';

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

const pieceSize = 4;

let width = TetrisDefinitions.boardWidth * pieceSize;
let height = TetrisDefinitions.boardHeight * pieceSize;
let left = -width / 2;
let right = width / 2;
let top = height / 2;
let bottom = -height /2;

const onActivePieceReplaced = (data) => {
    data.blocks.forEach((block) => {
        let rand = Math.floor(Math.random() * colors.length);
        let mat = new THREE.LineBasicMaterial({ color: colors[rand] });
        let renderBlock = new THREE.Line(drawBlock(block), mat);
        scene.add(renderBlock);
        renderBlocks.push({ renderBlock, piece: data, block });
    });
};


const onPieceMoved = (data) => {
    renderBlocks.forEach((renderBlock) => {
        if (renderBlock.piece === data) {
            let geometry = renderBlock.renderBlock.geometry;
            data.blocks.forEach((block) => {
                if (renderBlock.block === block) {
                    let pos = block.pos;
                    let minX = left + pos.x * pieceSize;
                    let maxX = minX + pieceSize;
                    let minY = (top - pos.y * pieceSize);
                    let maxY = minY - pieceSize;
                    geometry.vertices[0].x = minX;
                    geometry.vertices[0].y = minY;

                    geometry.vertices[1].x = maxX;
                    geometry.vertices[1].y = minY;

                    geometry.vertices[2].x = maxX;
                    geometry.vertices[2].y = maxY;

                    geometry.vertices[3].x = minX;
                    geometry.vertices[3].y = maxY;

                    geometry.vertices[4].x = minX;
                    geometry.vertices[4].y = minY;
                }
            });
            geometry.verticesNeedUpdate = true;
        }
    });
};

const tetrisCallback = (event, data) => {
    console.log(event);
    console.log(data);
    switch (event) {
        case 'activePieceReplaced':
            onActivePieceReplaced(data);
            break;
        case 'pieceMoved':
            onPieceMoved(data);
            break;
        default:
            break;
    }
};

let engine = new TetrisEngine();
engine.addTetrisListener(tetrisCallback);

const updateTetris = () => {
    let gameContinues = engine.step();
    if (gameContinues) {
        setTimeout(updateTetris, 250);
    }
};

let renderBlocks = [];

const drawBlock = (block, mat) => {
    let pos = block.getPos();

    // TODO: Make a more sophisticated lock creation policy?
    let newBlock = new THREE.Geometry()
    let minX = left + (pos.x * pieceSize);
    let minY = (top -  pos.y * pieceSize);
    let maxX = minX + pieceSize;
    let maxY = minY - pieceSize;
    newBlock.vertices.push(new THREE.Vector3(minX, minY, 0));
    newBlock.vertices.push(new THREE.Vector3(maxX, minY, 0));
    newBlock.vertices.push(new THREE.Vector3(maxX, maxY, 0));
    newBlock.vertices.push(new THREE.Vector3(minX, maxY, 0));
    newBlock.vertices.push(new THREE.Vector3(minX, minY, 0));
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

let drawBoard = () => {
    let board = new THREE.Geometry();

    board.vertices.push(new THREE.Vector3(left, top, 0));
    board.vertices.push(new THREE.Vector3(right, top, 0));
    board.vertices.push(new THREE.Vector3(right, bottom, 0));
    board.vertices.push(new THREE.Vector3(left, bottom, 0));

    board.vertices.push(new THREE.Vector3(left, top, 0));
    return board;
};

let boardMat = new THREE.LineBasicMaterial({ color: 0xffffff });
let board = new THREE.Line(drawBoard(), boardMat);
scene.add(board);

let debugBorder = 1;
let drawDebug = () => {
    let debug = new THREE.Geometry();
    let minX = left - debugBorder;
    let maxX = right + debugBorder;
    let minY = bottom - debugBorder;
    let maxY = top + debugBorder;

    debug.vertices.push(new THREE.Vector3(minX, minY, 0));
    debug.vertices.push(new THREE.Vector3(maxX, minY, 0));
    debug.vertices.push(new THREE.Vector3(maxX, maxY, 0));
    debug.vertices.push(new THREE.Vector3(minX, maxY, 0));

    debug.vertices.push(new THREE.Vector3(minX, minY, 0));
    return debug;
};

let debugMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
let debug = new THREE.Line(drawDebug(), debugMat);
scene.add(debug);

renderer.render(scene, camera);
