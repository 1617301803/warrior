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

const directions = [
    'forward', 'right', 'backward', 'left'
];


class Player {

    constructor() {
        this.maxHealth = 20;
        this.health = 20;

        this.binds = [];
    }

    playTurn(warrior) {
        this.beforePlay(warrior);

        this.play(warrior);

        this.afterPlay(warrior);
    }

    play(warrior) {
        let direction = warrior.directionOfStairs();

        let allSpaces = directions.map(direction => {
            return new Space(warrior, direction);
        });

        let directionSpace = allSpaces.find(space => {
            return space.getDirection() == direction;
        });

        let otherSpaces = allSpaces.filter(space => {
            return space.getDirection() !== direction;
        });

        let enemySpaces = allSpaces.filter(space => {
            return space.isEnemy() && !this.binds.includes(space.getDirection());
        });

        if (enemySpaces.length > 1) {
            let direction = enemySpaces[0].getDirection()
            warrior.bind(direction);
            this.binds.push(direction);
            return;
        } else if (enemySpaces.length == 1) {
            warrior.attack(enemySpaces[0].getDirection());
            return;
        }

        let space = directionSpace;

        if (space.isEmpty()) {
            warrior.walk(direction);
            this.binds.length = 0;
            return;
        }

        if(space.isBound()){
            warrior.rescue(direction);
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