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
            return !this.isEnemy() && this._unit.isBound();
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

    getEmptyDirections(direction) {
        let spaces = this.spaces.filter(space => {
            return space.isEmpty()
                && space.getDirection() !== 'backward'
                && space.getDirection() !== direction;
        });

        let directions = spaces.map(space => {
            return space.getDirection();
        });

        // 同时排除身后的位置
        //directions.push('backward');

        return directions;
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

    getTickingCaptives() {
        let captives = this.getCaptives();
        return captives.filter(captive => {
            return captive.isUnderEffect('ticking');
        });
    }
}


class Player {

    constructor() {
        this.maxHealth = 20;
        this.health = 20;
        this.fightUnit = null;

        this.bindDirections = [];
    }

    playTurn(warrior) {
        this.beforePlay(warrior);

        this.play(warrior);

        this.afterPlay(warrior);
    }

    play(warrior) {
        let surround = new Surround(warrior);
        let look = new Look(warrior);
        let tower = new Tower(warrior);

        if (surround.hasBound()) {
            // 周围有俘虏，救之
            let boundDirections = surround.getCaptiveDirective();
            this.rescue(boundDirections[0]);
            return;
        }

        let tickingCaptives = tower.getTickingCaptives();
        if (tickingCaptives.length > 0) {
            // 有俘虏有危险，去营救
            let emptyDirections = surround.getEmptyDirections();

            if (emptyDirections.length > 0) {
                // 有空位置，则去空位置 todo 在两个位置走来走去怎么办
                if (this.isInjured()) {
                    if (this.rest()) {
                        return;
                    }
                }
                this.walk(emptyDirections[0]);
                return;
            } else {
                // fight
                let enemyDirections = surround.getEnemyDirections();
                if (enemyDirections.length > 1) {
                    // 周围有两个及以上的敌人，bind，剩下前方的敌人最后处理
                    let unBindEnemys = enemyDirections.filter(direction => {
                        return !this.bindDirections.includes(direction) && direction !== 'forward';
                    });

                    if (unBindEnemys.length > 0) {
                        this.bind(unBindEnemys[0]);
                        return;
                    }

                    let forwardEnemys = look.getEnemy();
                    // 判断前方
                    if (forwardEnemys.length > 1) {
                        this.detonate();
                    } else {
                        this.attack(direction)
                    }
                } else {
                    this.attack(enemyDirections[0]);
                }
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

    isInjured() {
        return this.warrior.health() < this.maxHealth;
    }



    //region -- 行为的封装 --

    think(sth) {
        this.warrior.think(sth);
    }

    walk(direction) {
        this.warrior.walk(direction);
        this.bindDirections.length = 0;
    }

    detonate(direction) {
        this.warrior.detonate(direction);
    }

    bind(direction) {
        this.warrior.bind(direction);
        this.bindDirections.push(direction);
    }

    rest() {
        this.think(this.health);
        this.think(this.warrior.health());
        //if (this.isDemage()) {
        if (false) {
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