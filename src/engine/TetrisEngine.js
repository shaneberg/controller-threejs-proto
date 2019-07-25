import TetrisDefinitions from './TetrisDefinitions';

/**
 * Taken from https://github.com/seanhaneberg/react-tetris/
*/

class TetrisEngine {
  constructor() {
    this.minX = 0;
    this.minY = 0;

    this.maxX = this.minX + TetrisDefinitions.boardWidth - 1;
    this.maxY = this.minY + TetrisDefinitions.boardHeight - 1;
    this.activePiece = null;

    this.blocks = [];
    this.listeners = [];
    this.gameOver = false;
  }

  // Assume that listeners have an 'onTetrisEvent(string)' function
  addTetrisListener(listener) {
    this.listeners.push(listener);
  }

  emitTetrisEvent(eventName, data) {
    for (var i = 0; i < this.listeners.length; i++) {
      this.listeners[i](eventName, data);
    }
  }

  createRandomPiece() {
    let defs = TetrisDefinitions.pieces;
    var defIndex = Math.floor(Math.random() * defs.length);

    let initX = TetrisDefinitions.initX;
    let initY = TetrisDefinitions.initY;

    var blocks = [];
    var def = defs[defIndex];

    for (var i = 0; i < def.length; i++) {
      var x = def[i][0] + initX;
      var y = def[i][1] + initY;
      blocks.push(new TetrisBlock(x, y));
    }

    return new TetrisPieceDesc(blocks);
  }

  check(x, y) {
    var available = true;

    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
      // The current position is out of bounds.
      available = false;
    } else {
      for (var i = 0; i < this.blocks.length; i++) {
        var pos = this.blocks[i].getPos();
        if (pos.x === x && pos.y === y) {
          available = false;
          break;
        }
      }
    }

    return available;
  }

  // Check rotation, clockwise by default
  checkRotate(piece, counterClock) {

    if (!piece) {
      return false;
    }

    // What would this piece look like if we did the requested rotation?
    var candidate = piece.copy().rotate(counterClock);
    return this.checkPieceDesc(candidate);
  }

  // TODO: Consider not having this bound to the single active piece
  requestActivePieceMove(xDelta, yDelta) {
    let piece = this.activePiece;
    this.emitTetrisEvent("request move (" + xDelta + ", " + yDelta + ")");
    return this.checkMove(piece, xDelta, yDelta) && piece.move(xDelta, yDelta);
  }

  requestActivePieceRotate(counterClockwise) {
    let piece = this.activePiece;
    var name = counterClockwise ? "CounterClockwise" : "Clockwise";
    this.emitTetrisEvent("request" + name + "Rotation", piece);
    return this.checkRotate(piece, counterClockwise) && piece.rotate(counterClockwise);
  }

  checkMove(piece, xDelta, yDelta) {

    if (!piece) {
      return false;
    }

    // What would this piece look like if we did the requested move?
    var candidate = piece.copy().move(xDelta, yDelta);
    return this.checkPieceDesc(candidate);
  }

  // Is this piece valid on this board?
  checkPieceDesc(piece) {

    if (!piece) {
      return false;
    }

    var available = true;

    for (var i = 0; i < piece.blocks.length; i++) {
      var pos = piece.blocks[i].getPos();

      if (!this.check(pos.x, pos.y)) {
        available = false;
        break;
      }
    }

    // The input describes a piece that would be valid on this board.
    return available;
  }

  findFormedLines() {
    var blocksInRows = [];
    blocksInRows.fill(0, 0, this.boardHeight)

    var formedLines = [];
    for (var i = 0; i < this.blocks.length; i++) {
      var curBlock = this.blocks[i];
      var pos = curBlock.getPos();
      blocksInRows[pos.y]++;

      if (blocksInRows[pos.y] >= this.boardWidth) {
        formedLines.push(pos.y);
      }
    }

    return formedLines;
  }

  addBlocksToBoard(piece) {
    // Could we place it here?
    if (!this.checkMove(piece, 0, 0)) {
      return false;
    }

    for (var i = 0; i < piece.blocks.length; i++) {
      this.blocks.push(piece.blocks[i]);
    }

    return true;
  }

  stepFor(count) {
    var gameContinues = true;
    for (var i = 0; i < count; i++) {
      gameContinues = this.step();
      if (!gameContinues) {
        break;
      }
    }

    return gameContinues;
  }

  step() {
    var gameContinues = true;

    // Find lines to clear
    var formedLines = this.findFormedLines();
    if (formedLines && formedLines.length > 0) {
      this.emitTetrisEvent("linesFormed", formedLines);

      // TODO: Clear out lines
      // Move all blocks above the top line down n lines down
    }

    // Get a copy of the active piece, move it down, and see if it's valid.
    if (!this.activePiece) {
      this.activePiece = this.createRandomPiece();
      this.emitTetrisEvent("activePieceReplaced", this.activePiece);
    } else if (this.checkPieceDesc(this.activePiece.copy().move(0, 1))) {
      // If the active piece can move down, move it down!
      this.activePiece.move(0, 1);
      this.emitTetrisEvent("pieceMoved", this.activePiece);
    } else if (this.addBlocksToBoard(this.activePiece)) {
      // We can't move down, so we've placed the current piece's blocks
      // to the gameboard.
      this.emitTetrisEvent("piecePlaced", this.activePiece);
      this.activePiece = null;
    } else {
      // We failed to place the activePiece
      gameContinues = false;
      this.emitTetrisEvent("gameEndTriggered", this.activePiece);
    }

    return gameContinues;
  }
}

class TetrisBlock {

  constructor(x, y) {
    this.setPos(x, y);
  }

  getPos() {
    return this.pos;
  }

  setPos(x, y) {
    this.pos = { x: x, y: y };
  }

  move(xDelta, yDelta) {
    return this.setPos(this.pos.x + xDelta, this.pos.y + yDelta);
  }
}

// A collection of blocks and transformations that can be applied to them.
class TetrisPieceDesc {

  constructor(blocks) {
    // Ensure that every piece description has its own copy of blocks to
    // work with.
    this.blocks = [];

    // Is there a faster way to do this?
    for (var i = 0; i < blocks.length; i++) {
      this.blocks.push(new TetrisBlock(blocks[i].pos.x, blocks[i].pos.y));
    }
  }

  copy() {
    return new TetrisPieceDesc(this.blocks);
  }

  // shift all the blocks x and y
  move(xDelta, yDelta) {
    for (var i = 0; i < this.blocks.length; i++) {
      this.blocks[i].move(xDelta, yDelta);
    }
    return this;
  }

  // Clockwise rotation (+90 degrees)
  // x' = x * cos(90) - y * (sin(90))
  // y' = x * sin(90) + y * (cos(90))

  // Reduce, given that cos(90) = 0 and sin(90) = 1
  // x' = -y
  // y' = x

  // Counterclockwise rotation (-90 degrees)
  // x' = x * cos(-90) - y * (sin(-90))
  // y' = x * sin(-90) + y * (cos(-90))

  // Reduce, given that cos(-90) = 0 and sin(-90) = -1
  // x' = y
  // y' = -x

  rotate(counterClock) {
    // The first block in the description is always the pivot.
    var basePos = this.blocks[0].getPos();

    for (var i = 0; i < this.blocks.length; i++) {
      var block = this.blocks[i];
      var pos = block.getPos();

      // Convert to a coordinate system where the pivot block is at 0,0
      var xOffset = pos.x - basePos.x;
      var yOffset = pos.y - basePos.y;

      var newX = basePos.x + (counterClock ? yOffset : -yOffset);
      var newY = basePos.y + (counterClock ? -xOffset : xOffset);

      block.setPos({ x: newX, y: newY });
    }
  }
}

export default TetrisEngine;

