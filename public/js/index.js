/* eslint-disable no-console */
//import { create } from '../../node_modules/diffyjs/src/Diffy';
import { create } from '../../dist/diffy.min.js';
import io from 'socket.io-client';

const socket = io(window.location.origin);

const gridCanvas = document.querySelector('#grid-canvas');
const gridCtx = gridCanvas.getContext('2d');
const gridWidth = 900;
const gridHeight = 200;
const resolutionX = 20;
const resolutionY = 15;
const cellWidth = gridWidth / resolutionX;
const cellHeight = gridHeight / resolutionY;
const PI = Math.PI;

let radius = 0;

function drawGrid(matrix) {
  matrix.forEach((row, rowIdx) => {
    row.forEach((column, colIdx) => {
      if (rowIdx < 5 && colIdx === 6) {
        if (255 - column > 150) {
          socket.emit('left');
        }
      }
      if (rowIdx >= 10 && colIdx === 7) {
        if (255 - column > 150) {
          socket.emit('right');
        }
      }
      if (rowIdx >= 5 && rowIdx <= 9 && colIdx === 7) {
        if (255 - column > 200) {
          socket.emit('up');
        }
      }
      radius = 10;
      gridCtx.beginPath();
      gridCtx.fillStyle = `rgb(${column}, ${column}, ${column})`;
      gridCtx.arc(
        rowIdx * cellWidth,
        colIdx * cellHeight,
        radius,
        0,
        2 * PI,
        false
      );
      gridCtx.fill();
      gridCtx.closePath();
    });
  });
}

const diffy = create({
  resolution: { x: resolutionX, y: resolutionY },
  sensitivity: 0.2,
  threshold: 21,
  onFrame: drawGrid
});

window.diffy = diffy;
