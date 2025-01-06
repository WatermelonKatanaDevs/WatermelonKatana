const CanvasGame = (function () {
    class AssetLoader {
        constructor() {
            this.assets = {};
        }

        loadImage(key, src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    this.assets[key] = img;
                    resolve(img);
                };
                img.onerror = reject;
            });
        }

        getAsset(key) {
            return this.assets[key];
        }
    }

    class InputManager {
        constructor() {
            this.keys = {};
            this.mouse = { x: 0, y: 0, buttons: {} };

            window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
            window.addEventListener("keyup", (e) => (this.keys[e.key] = false));
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            window.addEventListener("mousedown", (e) => (this.mouse.buttons[e.button] = true));
            window.addEventListener("mouseup", (e) => (this.mouse.buttons[e.button] = false));
        }

        isKeyPressed(key) {
            return !!this.keys[key];
        }

        isMouseButtonDown(button) {
            return !!this.mouse.buttons[button];
        }
    }

    class PhysicsEngine {
        constructor(gravity = 0) {
            this.gravity = gravity;
        }

        applyPhysics(obj, delta) {
            if (obj.velocity) {
                obj.velocity.y += this.gravity * delta;
                obj.x += obj.velocity.x * delta;
                obj.y += obj.velocity.y * delta;

                if (obj.bounce && obj.y > 500) { // Example ground collision
                    obj.y = 500;
                    obj.velocity.y *= -obj.bounce;
                }
            }
        }
    }

    class SoundManager {
        constructor() {
            this.sounds = {};
        }

        loadSound(key, src) {
            const audio = new Audio(src);
            this.sounds[key] = audio;
        }

        play(key) {
            if (this.sounds[key]) {
                this.sounds[key].play();
            }
        }

        stop(key) {
            if (this.sounds[key]) {
                this.sounds[key].pause();
                this.sounds[key].currentTime = 0;
            }
        }
    }

    class GameObject {
        constructor({ x = 0, y = 0, width = 50, height = 50, color = "red" } = {}) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.velocity = { x: 0, y: 0 };
            this.bounce = 0.8;
            this.update = () => {};
            this.draw = (ctx) => {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            };
        }
    }

    class CanvasGame {
        constructor({ width = 800, height = 600, backgroundColor = "black" } = {}) {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = width;
            this.canvas.height = height;
            document.body.appendChild(this.canvas);

            this.backgroundColor = backgroundColor;
            this.objects = [];
            this.lastTime = 0;

            this.input = new InputManager();
            this.assets = new AssetLoader();
            this.physics = new PhysicsEngine();
            this.sounds = new SoundManager();
        }

        addObject(obj) {
            this.objects.push(obj);
        }

        removeObject(obj) {
            this.objects = this.objects.filter((o) => o !== obj);
        }

        start() {
            const gameLoop = (timestamp) => {
                const delta = (timestamp - this.lastTime) / 1000;
                this.lastTime = timestamp;

                this.update(delta);
                this.draw();

                requestAnimationFrame(gameLoop);
            };

            this.lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }

        update(delta) {
            this.objects.forEach((obj) => {
                this.physics.applyPhysics(obj, delta);
                obj.update(delta);
            });
        }

        draw() {
            const { ctx, canvas } = this;
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.objects.forEach((obj) => obj.draw(ctx));
        }
    }

    return {
        CanvasGame,
        AssetLoader,
        InputManager,
        PhysicsEngine,
        SoundManager,
        GameObject,
    };
})();

module.exports = CanvasGame;
