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
        if (this.isDemage()) {
          warrior.walk();
        } else {
          warrior.rest();
        }
      } else {
        warrior.walk();
      }
    }else{
      if(space.getUnit().isEnemy()){
        warrior.attack();
      }else{
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
