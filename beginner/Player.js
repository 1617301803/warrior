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

class Surroundings {

    constructor(warrior) {

        this._spaces = {};

        let bSurroundings = warrior.look('backward');
        let fSurroundings = warrior.look('forward');

        bSurroundings.forEach(space => {
            let location = space.getLocation();
            this._spaces[location[0]] = space;
        });

        fSurroundings.forEach(space => {
            let location = space.getLocation();
            this._spaces[location[0]] = new Space(space);
        });
    }

    getSpace(index) {
        return this._spaces[index];
    }

    getFrontSpaces() {
        return [
            this.getSpace(1),
            this.getSpace(2),
            this.getSpace(3),
        ];
    }

    getBackSpaces() {
        return [
            this.getSpace(-1),
            this.getSpace(-2),
            this.getSpace(-3),
        ]
    }

}

class Player {

    constructor() {
        this.init = false;
        this.maxHealth = 0;
        this.health = 0;
        this.addHealth = 0;

        // 有没有在游戏开始转身
        this.isBeginPivot = false;
    }

    playTurn(warrior) {
        this.beforePlay(warrior);

        this.play();

        this.afterPlay();
    }

    beforePlay(warrior) {
        if (this.init === false) {
            this.init = true;
            this.health = warrior.health();
            this.maxHealth = this.health;
        }
        this.warrior = warrior;
        this.surroundins = new Surroundings(warrior);
    }

    afterPlay() {
        this.health = this.warrior.health();
    }

    play() {

        // 判断初始是否要转身
        if (this.isNeedBeginPivot()) {
            return;
        }

        if (this.isNeedAddHealth()) {
            return;
        }

        let surroundings = this.surroundins;
        let space1 = surroundings.getSpace(1);

        var isBound = space1.isBound();

        if (space1.isBound()) {
            this.rescue();
            return;
        }

        if (space1.isEnemy()) {
            this.attack();
            return;
        }

        if (space1.isWall()) {
            // 这个判断 应该是不用了
            this.pivot();
            this.isBeginPivot = true;
            return;
        }

        if (space1.isStairs()) {
            // 判断当前有没有走完整个塔
            if (this.isBeginPivot === true) {
                this.walk();
                return;
            } else {
                this.pivot();
                return;
            }
        }

        // 第一个格子为空
        let space2 = surroundings.getSpace(2);
        let space3 = surroundings.getSpace(3);

        if (space2.isBound()) {
            this.walk();
            return;
        }

        if (space2.isEnemy()) {

            if (space3.isEnemy()) {
                // todo
                //this.back();
                this.shoot();
                return;
            }

            if (this.addHealthTo()) {
                return;
            }

            this.walk();
            return;
        }

        if (space2.isStairs()) {
            // 应该从这就判断当前是否走完整个塔然后去转身 todo 优化
            this.walk();
            return;
        }

        if (space2.isWall()) {
            this.pivot();
            this.isBeginPivot = true;
            return;
        }



        // 第一个格子和第二个格子都是空
        if (space3.isEnemy()) {
            this.shoot();
            return;
        }

        this.walk();
    }

    /**
     * 判断是否需要在游戏一开始就转身
     * 实际上这个判断在游戏开始时触发就行了 todo 优化
     */
    isNeedBeginPivot() {
        if (this.isBeginPivot === true) {
            return false;
        }

        let surroundings = this.surroundins;
        let backSpaces = surroundings.getBackSpaces();

        let wallSpace = backSpaces.find(space => {
            return space.isWall();
        });

        if (wallSpace === undefined) {
            return false;
        }

        let index = backSpaces.indexOf(wallSpace);
        if (index === 0) {
            this.isBeginPivot = true;
            return false;
        }

        let notEmptySpace = backSpaces.find((space, i) => {
            return i < index && !space.isEmpty();
        });

        if (notEmptySpace === undefined) {
            this.isBeginPivot = true;
            return false;
        }

        this.isBeginPivot = true;
        this.pivot();
        return true;
    }

    /**
     * 判断是否需要加血
     */
    isNeedAddHealth() {
        if (this.addHealth === 0) {
            return false;
        }

        if (this.isDamage()) {
            this.back();
            return true;
        }

        this.rest();
        this.addHealth--;
        return true;
    }

    /**
     * 是否收到攻击
     */
    isDamage() {
        return this.health > this.warrior.health();
    }

    addHealthTo(health, minHealth) {
        if (health === undefined) {
            health = this.maxHealth;
        }

        if (minHealth !== undefined) {
            if (this.warrior.health() > minHealth) {
                return false;
            }
        }

        if (health <= this.warrior.health()) {
            return false;
        }

        this.addHealth = Math.max(Math.ceil((health - this.warrior.health()) / 2), 0);
        return this.isNeedAddHealth();
    }

    //region -- 行为的封装 --

    think(sth) {
        this.warrior.think(sth);
    }

    back() {
        // 如果后面是墙，则退不了了 todo
        this.warrior.walk('backward');
    }

    walk() {
        this.warrior.walk();
    }

    rest() {
        this.warrior.rest();
    }

    pivot() {
        this.warrior.pivot();
    }

    attack() {
        this.warrior.attack();
    }

    shoot() {
        if (this.addHealthTo(10, 6)) {
            return;
        }

        this.warrior.shoot();
    }

    rescue() {
        this.warrior.rescue();
    }

    //endregion
}