class body extends drawable {
    alpha: number = 1;

    center: Vector2 = Vector2.Zero;
    velocity: Vector2 = Vector2.Zero;
    radius: number = 0;
    get collider() {
        return new CircleCollider(this.center, this.radius)
    }
    constructor(center: Vector2, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
    }
    update() {
        this.center.add(this.velocity);
        if ((this.center.x + this.radius > canv.width && this.velocity.x > 0) || (this.center.x - this.radius < 0 && this.velocity.x < 0))
            this.velocity.x = -this.velocity.x * 0.5;
        if ((this.center.y + this.radius > canv.height && this.velocity.y > 0) || (this.center.y - this.radius < 0 && this.velocity.y < 0))
            this.velocity.y = -this.velocity.y * 0.5;
    }
}
class player extends body {
    draw = (ctx: CanvasRenderingContext2D) => {
        drawCircle(ctx, getPlayer().radius, getPlayer().center);
        fillCircle(ctx, getPlayer().radius, getPlayer().center, 'crimson');
    };
    id = 'player';
    score: number = 0;
    private _hp: number = 100;
    public get hp(): number {
        return this._hp;
    }
    public set hp(value: number) {
        if (value <= 0)
            restart();
        this._hp = value;
    }
    get speed() {
        return (3 + this.score / 2) * sizeMult();
    }
    get coinSpawnCooldown() {
        return fps * 3 / Math.sqrt(1 + this.score / 3);
    }
    constructor(center: Vector2, radius: number) {
        super(center, radius);
    }
}
abstract class enemy extends body {
    constructor(center: Vector2, radius: number) {
        super(center, radius);
    }
    onPlayerHit = () => { };
    ai = () => { };
    AI(): void {
        if (!this.isDrawn)
            return;
        if (this.collider.colliding(getPlayer().collider))
            this.onPlayerHit();
        this.ai();
    }
}
class boss1 extends enemy {
    id = 'boss1';
    speed = 2.5 * sizeMult();
    onPlayerHit = () => {
        getPlayer().hp -= 100;
    }
    get attackCooldown(): number {
        return 40 + 80 / (getPlayer().score > 9 ? Math.sqrt(getPlayer().score - 8) : 1);
    }
    attackTimer = 0;
    ai = () => {
        let diff: Vector2 = getPlayer().center.Sub(this.center);
        let dist: number = diff.length;
        if (dist > this.radius * 4 + this.radius * 20 * Math.random())
            this.velocity = getPlayer().center.Sub(this.center).normalized.Mult(this.speed);
        this.attackTimer++;
        if (this.attackTimer >= this.attackCooldown) {
            this.rangedAttack(getPlayer().score > 5 && Math.random() < 0.2);
            this.attackTimer = 0;
        }
    }
    rangedAttack(homing: boolean = false) {
        let bullets = shootEvenlyInACircle(Math.random() < 0.6 ? 6 : 12, (homing ? 10 : 12) * sizeMult(), this.center, (1 + 3 * Math.random()) * sizeMult());
        bullets.forEach(b => {
            b.velocity.add(this.velocity);
            b.draw = (ctx) => {
                drawCircle(ctx, b.radius, b.center, 'black', b.alpha);
                fillCircle(ctx, b.radius, b.center, homing ? '#9940ef' : '#ef4099', b.alpha)
            };
            b.preUpdate = (timeLeft) => {
                if (timeLeft <= 600) {
                    this.alpha = timeLeft / 600;
                    this.onPlayerHit = () => { };
                }
            }
            b.onTimeout = () => {
                b.delete();
            }
            if (homing) {
                b.ai = () => {
                    let direction = getPlayer().center.Sub(b.center).normalized;
                    let dist = getPlayer().center.Sub(b.center).length;
                    b.velocity.add(direction.Div(dist > 1 ? dist * dist : 1).Mult(480 * sizeMult()));
                }
            }
        });
    }
    constructor(center: Vector2, radius: number) {
        super(center, radius);
        this.draw = (ctx) => {
            fillCircle(ctx, this.radius, this.center, '#ff10a0');
            fillCircle(ctx, this.radius * 0.9, this.center, 'black');
        };
    }
}
function shootEvenlyInACircle(count: number, bulletRadius: number, pos: Vector2, velocity: number, spawnRadius: number = 0): bullet[] {
    let bullets: bullet[] = [];
    let angle = 0;
    for (let i = 0; i < count; i++) {
        let Vy = Math.sin(angle) * velocity;
        let Vx = Math.cos(angle) * velocity;
        let V = new Vector2(Vx, Vy);
        bullets.push(new bullet(pos.Add(V.normalized.Mult(spawnRadius)), V, bulletRadius))
        angle += 360 / count;
    }
    return bullets;
}
class bullet extends enemy {
    zIndex = -1;
    onPlayerHit = () => {
        getPlayer().hp -= 100;
    }
    timer: Timer;
    preUpdate = (timeLeft: number) => { };
    onTimeout = () => { this.delete() };
    constructor(center: Vector2, velocity: Vector2, radius: number, lifetime: number = 9) {
        super(center, radius);
        this.velocity = velocity;
        this.timer = new Timer(frameInterval, lifetime * fps, (c) => {
            this.preUpdate(c);
            if (c == 1)
                this.onTimeout();
        });
    }
    delete() {
        this.timer.end();
        super.delete();
    }
    update() {
        super.update();
    }
}
class coin extends drawable {
    zIndex = -2;
    static get radius() {
        return 22 * sizeMult();
    }
    collider: CircleCollider;
    onPlayerCollide: () => void = () => {
        getPlayer().score++;

        let alpha = 1;
        let timeLeft = fps * 2;
        new Timer(frameInterval, timeLeft, (counter) => {
            if (counter < timeLeft / 3) {
                alpha = counter / (timeLeft / 3);
            }
        });
        new drawable((ctx) => {
            drawCenteredText(ctx, String(getPlayer().score), undefined, alpha);
        }, undefined, 'score');

        this.delete();
    };
    constructor(public pos: Vector2) {
        super(ctx => {
            drawCircle(ctx, coin.radius, pos, 'green');
            fillCircle(ctx, coin.radius, pos, '#faffde');
        });
        this.collider = new CircleCollider(pos, coin.radius);
    }
    update() {

    }
}