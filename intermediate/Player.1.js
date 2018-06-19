class Player {
  playTurn(warrior) {
    let direction = warrior.directionOfStairs();
    warrior.walk(direction);
  }
}
