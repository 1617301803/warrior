class Space {

    constructor(space) {
        this.space = space;

        this._location = space.getLocation();
        this._unit = space.getUnit();
        this._isEmpty = space.isEmpty();
        this._isStairs = space.isStairs();
        this._isUnit = space.isUnit();
        this._isWall = space.isWall();
    }

    isEmpty() {
        return this._isEmpty;
    }

    isBound() {
        if (this._isUnit) {
            return this._unit.isBound();
        }

        return false;
    }

    isEnemy() {
        if (this._isUnit) {
            return this._unit.isEnemy();
        }

        return false;
    }

    isWall() {
        return this._isWall;
    }

    isStairs() {
        return this._isStairs;
    }
}


class Player {

    constructor() {
        this.maxHealth = 20;
        this.health = 20;
    }

    playTurn(warrior) {
        this.beforePlay(warrior);

        this.play(warrior);

        this.afterPlay(warrior);
    }

    play(warrior) {
        let direction = warrior.directionOfStairs();
        let space = new Space(warrior.feel(direction));

        if (space.isEmpty()) {
            warrior.walk(direction);
            return;
        }

        if (space.isEnemy()) {
            warrior.attack(direction);
            return;
        }
    }

    beforePlay(warrior) {
        this.warrior = warrior;
    }

    afterPlay(warrior) {
        this.health = warrior.health();
    }
}