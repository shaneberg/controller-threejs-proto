class TetrisDefinitions {

  static boardWidth = 10;
  static boardHeight = 20;

  static initX = 4;
  static initY = 0;

  static pieces = [
      [
          [1, 1],
          [1, 0],
          [1, 2],
          [1, 3]
      ], // [0] I
      [
          [1, 1],
          [1, 0],
          [1, 2],
          [2, 2]
      ], // [1] L
      [
          [1, 0],
          [0, 0],
          [0, 1],
          [0, 2]
      ], // [2] R (mirror of L)
      [
          [1, 0],
          [0, 0],
          [1, 1],
          [2, 1]
      ], // [3] Z
      [
          [0, 1],
          [0, 0],
          [1, 1],
          [1, 2]
      ], // [4] S (mirror of Z)
      [
          [0, 1],
          [0, 0],
          [1, 0],
          [1, 1]
      ], // [5] X
      [
          [1, 1],
          [1, 0],
          [1, 2],
          [0, 1]
      ] // [6] T
  ];
}

export default TetrisDefinitions;

