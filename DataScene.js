class DataScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        // Data shared between game scenes
        this.souls = null;
        this.levels = null;
    }

    /**
     * Saves the game's data
     */
    saveData() {
        const data = {
            souls: this.souls,
            levels: this.levels,
            lastPlayed: this.timeNow()
        };
        saveObjectToLocal(data);
    }

    loadData() {
        const data = loadObjectFromLocal();
        // Check if data was loaded correctly
        if (data) {
            this.souls = data.souls;
            this.levels = data.levels;
            // Determine the time the player has been gone
            let lastPlayed = data.lastPlayed;
            this.progress((this.timeNow() - lastPlayed) / 1000);
        } else {
            this.resetData();
        }
    }

    // Reset stored data variables to default
    resetData() {
        // Start out with no souls
        this.souls = 0;
        // Starting upgrade levels
        this.levels = {
            bolt: 0
        }
        // Save the reset values
        this.saveData();
    }

    /**
     * Runs formulas to grant the player progress based on time they were
     * away from the game.
     * @param {number} elapsed The time (in seconds) for which the player
     * should be granted progress.
     */
    progress(elapsed) {
        // Average monster hp is 15
        let hp = 15;
        // Bolt level corresponds directly with dps
        let damage = this.levels.bolt * elapsed;
        // Add souls based on bolt damage
        this.souls += Math.floor(damage / hp);
    }

    /**
     * @returns The current timestamp in miliseconds
     */
    timeNow() {
        return new Date().getTime();
    }
}