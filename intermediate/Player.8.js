const directions = [
    'forward', 'right', 'backward', 'left'
];

let WARRIOR;

class Space {

    constructor(space, direction) {
        this._direction = direction;
        //this._location = space.getLocation();
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

    isUnderEffect(effect) {
        if (this._isUnit) {
            return this._unit.isUnderEffect(effect);
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

class Spaces {
    constructor(spaces) {
        this.spaces = spaces;
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

    getEmptyDirections(direction) {
        let spaces = this.spaces.filter(space => {
            return space.isEmpty()
                && space.getDirection() !== 'backward'
                && space.getDirection() !== direction;
        });

        let directions = spaces.map(space => {
            return space.getDirection();
        });
        //directions.push('backward');

        return directions;
    }

    getEnemyDirections() {
        return this.getEnemy().map(space => {
            return space.getDirection();
        });
    }

    getEnemy() {
        return this.spaces.filter(space => {
            return space.isEnemy();
        });
    }

    getCaptiveDirective() {
        return this.getCaptives().map(space => {
            return space.getDirection();
        });
    }

    getCaptives() {
        return this.spaces.filter(space => {
            return space.isBound();
        });
    }

    getSpace(direction) {
        return this.spaces.find(space => {
            return space.getDirection() === direction;
        });
    }
}

class Surround extends Spaces {
    constructor(warrior) {
        let spaces = directions.map(direction => {
            let space = warrior.feel(direction);
            return new Space(space, direction);
        });

        super(spaces);
        this.warrior = warrior;
    }
}

class Look extends Spaces {
    constructor(warrior) {
        let spaces = warrior.listen().map(space => {
            let direction = warrior.directionOf(space);
            return new Space(space, direction);
        });
        super(spaces);
        this.warrior = warrior;
    }
}

class Tower extends Spaces {
    constructor(warrior) {
        let spaces = warrior.listen().map(space => {
            let direction = warrior.directionOf(space);
            return new Space(space, direction);
        });
        super(spaces);
        this.warrior = warrior;
    }

    getDirection(unit) {
        return this.warrior.directionOf(unit);
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

        // 周围有俘虏，则营救
        if (surround.hasBound()) {
            let boundDirections = surround.getCaptiveDirective();
            this.rescue(boundDirections[0]);
            return;
        }

        let tower = new Tower(warrior);

        //有俘虏有危险，则先营救
        let captives = tower.getCaptives();
        let dangerCaptives = captives.filter(captive => {
            return captive.isUnderEffect('ticking');
        });
        if (dangerCaptives.length > 0) {
            let direction = dangerCaptives[0].getDirection();
            let space = surround.getSpace(direction);
            if (space.isEnemy()) {
                let otherEmptyDirections = surround.getEmptyDirections(direction);
                if (otherEmptyDirections.length > 0) {
                    this.walk(otherEmptyDirections[0]);
                } else {
                    let look = new Look(warrior);
                    let forwardEnemys = look.getEnemy();

                    let surroundEnemyDirections = surround.getEnemyDirections();
                    let unBindEnemys = surroundEnemyDirections.filter(direction => {
                        return !this.bindDirections.includes(direction) && direction !== 'forward';
                    });

                    this.think(unBindEnemys);
                    if (unBindEnemys.length > 1) {
                        this.bind(unBindEnemys[0]);
                        return;
                    }

                    if (forwardEnemys.length > 1) {
                        this.detonate();
                    } else {
                        this.attack(direction)
                    }
                }

            } else {
                this.walk(direction);
            }

            return;
        }

        if (!surround.hasUnit()) {
            let units = warrior.listen();
            if (units.length > 0) {
                if (this.warrior.health() < this.maxHealth) {
                    if (this.rest()) {
                        return;
                    }
                }

                let direction = warrior.directionOf(units[0]);
                let space = surround.getSpace(direction);
                if (space.isStairs()) {
                    let otherEmptyDirections = surround.getEmptyDirections(direction);
                    this.walk(otherEmptyDirections[0]);
                } else {
                    this.walk(direction);
                }
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
                } else if (unBindEnemys.length == 1) {
                    this.attack(unBindEnemys[0]);
                } else {
                    if (this.warrior.health() < this.maxHealth) {
                        if (this.rest()) {
                            return;
                        }
                    }
                    this.attack(enemyDirections[0]);
                }

                return;
            }

            if (surround.hasBound()) {
                let boundDirections = surround.getCaptiveDirective();
                this.rescue(boundDirections[0]);
                return;
            }
        }
    }

    beforePlay(warrior) {
        this.warrior = warrior;
        WARRIOR = warrior;
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

    detonate(direction) {
        this.warrior.detonate(direction);
    }

    bind(direction) {
        this.warrior.bind(direction);
        this.bindDirections.push(direction);
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