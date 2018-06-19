const directions = [
    'forward', 'right', 'backward', 'left'
];

class Space {

    constructor(warrior, direction) {
        let space = warrior.feel(direction);

        this._direction = direction;
        this._location = space.getLocation();
        this._unit = space.getUnit();
        this._isEmpty = space.isEmpty();
        this._isStairs = space.isStairs();
        this._isUnit = space.isUnit();
        this._isWall = space.isWall();
    }

    getDirection() {
        return this._direction;
    }

    getUnit() {
        return this._unit;
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

    isUnderEffect() {
        if (this._isUnit) {
            return this._unit.isUnderEffect();
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

class Surround {
    constructor(warrior) {
        this.spaces = directions.map(direction => {
            return new Space(warrior, direction);
        });
    }

    isEmpty() {
        return this.spaces.every(space => {
            return space.isEmpty();
        });
    };

    hasUnit() {
        return this.spaces.some(space => {
            return space.isEnemy() || space.isBound();
        });
    }

    hasEnemy() {
        return this.spaces.some(space => {
            return space.isEnemy();
        });
    }

    hasBound() {
        return this.spaces.some(space => {
            return space.isBound();
        });
    }

    getEnemyDirections() {
        return this.spaces.filter(space => {
            return space.isEnemy();
        }).map(space => {
            return space.getDirection();
        })
    }

    getBoundDirections() {
        return this.spaces.filter(space => {
            return space.isBound();
        }).map(space => {
            return space.getDirection();
        })
    }
}


class Player {

    constructor() {
        this.maxHealth = 20;
        this.health = 20;

        this.bindDirections = [];
    }

    playTurn(warrior) {
        this.beforePlay(warrior);

        this.play(warrior);

        this.afterPlay(warrior);
    }

    play(warrior) {
        let surround = new Surround(warrior);

        if (!surround.hasUnit()) {



            let units = warrior.listen();
            if (units.length > 0) {
                if (this.warrior.health() < this.maxHealth) {
                    if (this.rest()) {
                        return;
                    }
                }

                let direction = warrior.directionOf(units[0]);
                this.walk(direction);
            } else {
                let direction = warrior.directionOfStairs();
                this.walk(direction);
            }
        } else {
            if (surround.hasEnemy()) {
                let enemyDirections = surround.getEnemyDirections();

                let unBindEnemys = enemyDirections.filter(direction => {
                    return !this.bindDirections.includes(direction);
                });

                if (unBindEnemys.length > 1) {
                    this.bind(unBindEnemys[0]);
                } else {
                    this.attack(enemyDirections[0]);
                }

                return;
            }

            if (surround.hasBound()) {
                let boundDirections = surround.getBoundDirections();
                this.rescue(boundDirections[0]);
                return;
            }
        }
    }

    beforePlay(warrior) {
        this.warrior = warrior;
    }

    afterPlay(warrior) {
        this.health = warrior.health();
    }

    isDemage() {
        return this.health > this.warrior.health();
    }



    //region -- 行为的封装 --

    think(sth) {
        this.warrior.think(sth);
    }

    walk(direction) {
        this.warrior.walk(direction);
    }

    bind(direction) {
        this.warrior.bind(direction);
        this.bindDirections, push(direction);
    }

    rest() {
        if (this.isDemage()) {
            return false;
        } else {
            this.warrior.rest();
            return true;
        }
    }

    pivot() {
        this.warrior.pivot();
    }

    attack(direction) {
        this.warrior.attack(direction);
    }

    shoot(direction) {
        this.warrior.shoot(direction);
    }

    rescue(direction) {
        this.warrior.rescue(direction);
    }

    //endregion
}