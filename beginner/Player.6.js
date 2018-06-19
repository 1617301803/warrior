const State = {
  walk: 'walk',
  rest: 'rest',
  rescue: 'rescue',
  attack: 'attack',
  escape: 'escape'
};

const Action = {
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

    this.healths = [];

    this.over = false;

    this.direction = 'backward';

    // 动作，表示一个阶段要干的事
    this.action = null;

    // 状态，上一次的行为
    this.state = State.walk;
  }

  playTurn(warrior) {
    this.initPlay(warrior);

    this.beforePlay(warrior);

    this.afterPlay();
  }

  initPlay(warrior) {
    if (this.init === false) {
      this.health = warrior.health();
      this.maxHealth = this.health;
      this.init = true;
    }
  }

  beforePlay(warrior) {
    this.warrior = warrior;
    this.healths.push(warrior.health());
    this.over = false;

    //判断状态，决定下一步干嘛
    if (this.state === State.walk) {
      if (this.isWall()) {
        this.pivot();
        this.walk();
      } else if (this.isBound()) {
        this.rescue();
      } else if (this.isEnemy()) {
        this.attack();
      } else if (!this.isMaxHealth()) {
        this.rest()
      } else {
        this.walk();
      }
    } else if (this.state === State.rest) {
      if (this.isDemage()) {
        this.walk();
      } else if (!this.isMaxHealth()) {
        this.rest();
      } else {
        if (this.action === Action.escape) {
          this.pivot();
          this.action = Action.walk;
        }
        this.walk();
      }
    } else if (this.state === State.rescue) {
      this.walk();
    } else if (this.state === State.attack) {
      if (this.isJustKillEnemy()) {
        this.escape();
        this.action = Action.escape;
      } else {
        if (this.isNeedAddHealth()) {
          this.escape();
          this.action = Action.escape;
        } else {
          this.attack();
        }
      }
    } else if (this.state === State.escape) {
      if (this.isDemage()) {
        this.walk();
      } else {
        this.rest();
      }
    }
  }

  afterPlay() {
    this.health = this.warrior.health()
  }

  //region -- 判断 --

  isDemage() {
    return this.health > this.warrior.health();
  }

  isJustKillEnemy() {
    if (this.healths.length < 3) {
      return false;
    }

    var len = this.healths.length;
    return this.healths[len - 1] === this.healths[len - 2]
      && this.healths[len - 1] !== this.healths[len - 3];
  }

  isNeedAddHealth() {
    return this.warrior.health() / this.maxHealth < 0.25;
  }

  isMaxHealth() {
    //return this.warrior.health() === this.maxHealth;
    return this.warrior.health() > 13;
  }

  isEmpty() {
    return this.warrior.feel(this.direction).isEmpty() === true;
  }

  isWall() {
    return this.warrior.feel(this.direction).isWall();
  }

  isBound() {
    if (!this.isEmpty() && !this.isWall()) {
      let unit = this.warrior.feel(this.direction).getUnit();
      if (unit.isBound()) {
        return true;
      }
    }
  }

  isEnemy() {
    if (!this.isEmpty() && !this.isWall()) {
      let unit = this.warrior.feel(this.direction).getUnit();
      if (unit.isEnemy()) {
        return true;
      }
    }
  }

  // endregion

  pivot() {
    if (this.direction === undefined) {
      this.direction = 'backward';
    } else {
      this.direction = undefined;
    }
  }

  //region -- 行为的封装 --

  escape() {
    this.pivot();
    this.warrior.walk(this.direction);
    this.state = State.escape;
  }

  rescue() {
    this.warrior.rescue(this.direction);
    this.state = State.rescue;
  }

  attack() {
    this.warrior.attack(this.direction);
    this.state = State.attack;
  }

  walk() {
    this.warrior.walk(this.direction);
    this.state = State.walk;
  }

  rest() {
    this.warrior.rest();
    this.state = State.rest;
  }
  //endregion
}
