const defaultMinLength = 100;
const defaultMaxDownTime = .5;

class SwipeSystem extends Phaser.Events.EventEmitter {
    /**
     * Constructor for the SwipeSystem, which is attached to a single scene
     * @param {Phaser.Scene} scene 
     */
    constructor(scene, minLength, maxDownTime) {
        // Call parent constructor
        super();
        // Minimum length of a swipe (in pixels)
        this.minLength = minLength || defaultMinLength;
        // Maximum time a pointer can be held down for it to be
        // considered a swipe (in seconds)
        this.maxDownTime = maxDownTime || defaultMaxDownTime;
        // Is the user actively swiping?
        // (Or at least being tested for a swipe)
        this.swiping = false;
        // Location where a swipe began
        this.swipeStart = null;
        // Location where a swipe ends
        this.swipeEnd = null;

        // Listener for when the pointer is put down
        scene.input.on('pointerdown', () => {
            // Set swiping state
            this.swiping = true;
            // Set the swipe starting position
            this.swipeStart = {
                x: scene.input.activePointer.x,
                y: scene.input.activePointer.y,
                t: new Date().getTime() / 1000
            }
        });

        scene.input.on('pointerup', () => {
            // Check if we are still swiping
            if (this.swiping) {
                // Set the end point of the swipe
                this.swipeEnd = {
                    x: scene.input.activePointer.x,
                    y: scene.input.activePointer.y,
                    t: new Date().getTime() / 1000
                }
                // Handle the swipe (fire an event)
                this._handleSwipe();
            }
        })
    };

    setMaxDownTime(x) {
        this.maxDownTime = x;
    }

    _handleSwipe() {
        // Calculations
        const length = Phaser.Math.Distance.BetweenPoints(this.swipeStart, this.swipeEnd);
        const rotation = Phaser.Math.Angle.BetweenPoints(this.swipeStart, this.swipeEnd);
        const time = this.swipeEnd.t - this.swipeStart.t;
        const delta = {
            x: length * Math.cos(rotation),
            y: length * Math.sin(rotation)
        };
        const velocity = {
            x: delta.x / time,
            y: delta.y / time
        }
        // Create a data object for the swipe
        let swipeData = {
            start: this.swipeStart,
            end: this.swipeEnd,
            length: length,
            duration: time,
            rotation: rotation,
            delta: delta,
            velocity: velocity
        }
        // Only fire the event under minimal conditions
        if (length >= this.minLength && time < this.maxDownTime) {
            // Fire an event containing all information
            this.emit('swipe', swipeData);
        }
        // Clear all swiping values
        this.swiping = false;
        this.swipeStart = null;
        this.swipeEnd = null;
    }
}