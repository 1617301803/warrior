const State = {
  begein: 'begin',
  walk: 'walk',
  rest: 'rest',
  rescue: 'rescue',
  attack: 'attack',
  escape: 'escape'
};

class Player {
  constructor() {
    this.init = false;
    this.maxHealth = 0;
    this.health = 0;
    this.state = State.begin;
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
      this.direction = 'forward';
    }
  }

  beforePlay(warrior) {
    this.warrior = warrior;
  }

  play(warrior) {

    let space = warrior.feel();

    if (space.isWall()) {
      warrior.pivot();
    } else if (space.isEmpty()) {
      if (this.state === State.attack) {
        if (this.isDemage()) {
          warrior.walk('backward');
          this.state = State.walk;
        } else {
          if (this.isDanger()) {
            warrior.rest();
          } else {
            warrior.walk();
            this.state = State.walk;
          }
        }
      } else if (this.isDemage()) {
        warrior.walk();
        this.state = State.walk;
      } else if (this.isDanger()) {
        warrior.rest();
        this.state = State.rest;
      } else {
        warrior.walk();
        this.state = State.walk;
      }
    } else {
      let unit = space.getUnit();
      if (unit.isEnemy()) {
        warrior.attack();
        this.state = State.attack;
      } else {
        warrior.rescue();
      }
    }
  }

  afterPlay(warrior) {
    this.health = warrior.health();
  }

  isInjured() {
    return this.warrior.health() < this.maxHealth;
  }

  isDemage() {
    return this.warrior.health() < this.health;
  }

  isDanger() {
    return this.warrior.health() < 13;
  }
}
