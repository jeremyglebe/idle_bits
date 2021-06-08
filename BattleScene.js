class BattleScene extends DataScene {

    // This is where we define data members
    constructor() {
        super("BattleScene");
        // Swipe system
        this.swipe = null;
        // Monster variables
        this.monsterImage = null;
        this.hp = 5;
        this.hpText = null;
        this.soulsText = null;
        // Levels in upgrades
        this.levels = {
            bolt: 0
        }
        this.secondTimer = null;
        this.minuteTimer = null;
        // Status of monster
        this.alive = false;
    }

    // Runs before entering the scene, LOAD IMAGES AND SOUND HERE
    preload() {
        // this.load.image('kraken', './assets/kraken.png');
        // Loop through monster configuration and load each image
        for (let i = 0; i < MONSTERS.length; i++) {
            this.load.image(MONSTERS[i].name, `./assets/monsters/${MONSTERS[i].image}`);
        }
        this.load.image('bolt', './assets/bolt.png');
        this.load.image('door', './assets/door.png');
        // Load sound effects
        this.load.audio('hit', './assets/hit_001.wav');
    }

    // Runs when we first enter this scene
    create() {

        new VirtualJoystick(this, 225, 620, 50);

        // Utilize a swipe system in this scene
        this.swipe = new SwipeSystem(this);
        this.swipe.on('swipe', (swipe) => {
            console.log(swipe);
        });
        // Load game data
        this.loadData();

        // Set the starting monster
        let index = Math.floor(Math.random() * MONSTERS.length);
        this.setMonster(MONSTERS[index]);
        // Create hp text
        this.hpText = this.add.text(225, 700, "");
        // Create the souls text
        this.soulsText = this.add.text(50, 50, "Souls: 0", {
            fontSize: '24px',
            color: 'red'
        });

        // Create an upgrade icon for the bolt upgrade
        let bolt = this.add.image(400, 50, 'bolt');
        bolt.setScale(3);
        bolt.setInteractive();
        bolt.on('pointerdown', () => {
            // If we have enough money
            if (this.souls >= 5) {
                // pay the money
                this.souls -= 5;
                // gain a level
                this.levels.bolt++;
            }
        });
        // Create an interval to use bolt damage
        this.secondTimer = setInterval(() => {
            this.damage(this.levels.bolt);
        }, 1000);

        // Save button
        let door = this.add.image(50, 750, 'door');
        door.setScale(3);
        door.setInteractive();
        door.on('pointerdown', () => {
            this.returnToTitleScene();
        });

        // Save every 60s
        this.minuteTimer = setInterval(() => {
            this.saveData();
        }, 60000);
        // Save once on startup, to set the time
        this.saveData();
    }

    // Runs every frame
    update() {
        if (this.hp > 0) {
            this.hpText.setText(`${this.hp}`);
        } else {
            this.hpText.setText("0");
        }
        this.soulsText.setText(`Souls: ${this.souls}`);
    }

    damage(amount) {
        // Lower the hp of the current monster
        this.hp -= amount;
        // Check if monster is dead
        if (this.hp <= 0 && this.alive) {
            // Set monster to no longer be alive
            this.alive = false;
            // Play a death animation
            this.tweens.add({
                // List of things to affect
                targets: [this.monsterImage],
                // Duration of animation in ms
                duration: 750,
                // Alpha is transparency, 0 means invisible
                alpha: 0,
                // Scale the image down during animation
                scale: 0.1,
                // Set the angle
                angle: 359,
                // Runs once the death animation is finsihed
                onComplete:
                    () => {
                        // Choose a random new monster to replace the dead one
                        let index = Math.floor(Math.random() * MONSTERS.length);
                        this.setMonster(MONSTERS[index]);
                        // Gain a soul
                        this.souls++;
                        // Save game (and soul gained)
                        this.saveData();
                    }
            });
        }
    }

    returnToTitleScene() {
        clearInterval(this.secondTimer);
        clearInterval(this.minuteTimer);
        this.saveData();
        this.scene.start("TitleScene");
    }

    setMonster(monsterConfig) {
        // Destroy the old monster's game object
        if (this.monsterImage != null) this.monsterImage.destroy();
        // Reset hp of the monster
        this.hp = monsterConfig.hp;
        this.alive = true;

        // Create a image of monster at position x:225,y:400
        this.monsterImage = this.add.image(225, 400, monsterConfig.name);
        // Set the size of the monster
        this.monsterImage.setScale(16);
        // Make the monster clickable
        this.monsterImage.setInteractive();

        // Handler/callback for the 'pointer down' event
        this.monsterImage.on('pointerdown',
            () => {
                // Play a hit sound
                this.sound.play('hit', {
                    volume: 0.3
                });
                this.damage(1);
            });
    }
}