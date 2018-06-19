class Player {
  constructor() {
    this.init = false;
    this.maxHealth = 0;
    this.health = 0;
  }

  playTurn(warrior) {
    this.initPlay(warrior);

    this.beforePlay(warrior);
    this.play(warrior);
    this.afterPlay(warrior);
  }

  initPlay(warrior) {
    if (this.init === false) {
      this.init = true;
      this.maxHealth = warrior.health();
      this.health = warrior.health();
    }
  }

  beforePlay(warrior) {
    this.warrior = warrior;
  }

  play(warrior) {

    let space = warrior.feel();

    if (space.isEmpty()) {
      if (this.isDanger()) {
        warrior.rest();
      } else {
        warrior.walk();
      }
    }
    else {
      warrior.attack();
    }
  }

  afterPlay(warrior) {
    this.health = warrior.health();
  }

  isInjured() {
    return this.warrior.health() < this.maxHealth;
  }

  isDanger() {
    return this.warrior.health() < 7;
  }
}
