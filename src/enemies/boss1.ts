class boss1 extends boss {
	fillColor: color = { r: 0, g: 0, b: 0 };
	preTick(timeLeft: number) {
		super.preTick(timeLeft);
		if (timeLeft <= 180) {
			this.fillColor.r = (1 - timeLeft / 180) * 255;
			if (timeLeft <= 30) {
				this.fillColor.g = (1 - timeLeft / 30) * 255;
				this.fillColor.b = (1 - timeLeft / 30) * 255;
			}
		}
	}
	onTimeout() {
		function columnOfBullets(startingX: number, velocityMultiplier: number, offsetY: boolean) {
			for (let i = 0; i <= 16; i++) {
				let point = new Vector2(startingX, canvas.height / 16 * i + (offsetY ? canvas.height / 32 : 0));
				let b = new bullet(point, new Vector2(3.5 * distScale * velocityMultiplier, 0), canvas.height / 64);
				b.fillColor = '#2f2f2f';
				b.bounce = false;
			}
		}
		columnOfBullets(0, 1, true);
		columnOfBullets(canvas.width, -1, false);

		let score = getPlayer().score;
		initiateVictory(10 / (score > 0 ? Math.sqrt(score) : 1));
	}
	delete() {
		this.attackTimers.forEach((t) => t.delete());
		super.delete();
	}
	attackTimers: Timer[] = [];
	private newAttackTimer(frames: number, onTimeout: () => void) {
		this.attackTimers.push(new Timer(frameInterval, frames, (c, timer) => {
			if (paused) {
				timer.counter++;
			}
		}, onTimeout));
	}
	attacks = [
		() => { // Aimed attack
			let diff: Vector2 = getPlayer().center.Sub(this.center);
			let angle = Math.atan2(diff.y, diff.x);
			this.rangedAttack(1, 12, 15, '#ef4f2f', 240, angle);
			for (let i = 1; i <= 14; i++) {
				this.newAttackTimer(2 * i, () => {
					this.rangedAttack(1, 12 - i / 2, 15 - i / 2, '#ef4f2f', 240, angle);
				});
			}
		},
		() => { // Rotating attack
			let rotation = (Math.random() < 0.5 ? 1 : -1) * 0.004;
			let coolAttack = (rotation: number, angle: number) => {
				this.rangedAttack(3, 1.5, 10, undefined, 800, angle, (b) => {
					b.velocity = Vector2.rotate(b.velocity, rotation);
				}, false);
			}
			coolAttack(rotation, 0);
			for (let i = 0; i < 12; i++) {
				this.newAttackTimer((i + 1) * 3, () => coolAttack(rotation, 360 / 12 * (i + 1)));
			}
		},
		() => { // Accelerating attack
			let playerPos = getPlayer().center;
			this.rangedAttack(12, 0.7, 12, '#ef10ef', 240, undefined,
				(b: bullet) => {
					b.velocity.add(b.velocity.normalized.Div(12));
				}
				, false);
		},
		() => { // Appearing attack
			for (let i = 0; i < 100; i++) {
				bullet.appearingBullet(randomPoint(), 15, 60, 180);
			}
		}
	];
	ai = () => {
		this.timeLeft -= getPlayer().score / 5;

		let diff: Vector2 = getPlayer().center.Sub(this.center);
		let dist: number = diff.length;

		if (dist > this.radius * 4 + this.radius * 20 * distScale * Math.random())
			this.velocity = getPlayer()
				.center.Sub(this.center)
				.normalized.Mult(this.speed);
		this.attackTimer++;
		if (this.attackTimer >= this.attackCooldown) {
			this.attack();
		}
	};
	rangedAttack(
		count: number,
		speed: number,
		size: number,
		fillColor: string = '#ef4099',
		timeLeft: number = 720,
		angle: number = 0,
		customAi: ((b: bullet) => void) | undefined = undefined,
		deflect: boolean = true
	): bullet[] {
		let bullets = bullet.shootEvenlyInACircle(
			count,
			distScale,
			this.center,
			1,
			this.radius,
			angle
		);
		bullets.forEach((b) => {
			b.timeLeft = timeLeft;
			b.radius *= size;
			b.velocity.mult(speed * distScale);
			b.bounce = deflect;

			b.velocity.add(this.velocity);
			b.fillColor = fillColor;
			b.onTimeout = () => {
				b.delete();
			};
			if (customAi != undefined) {
				b.ai = () => customAi(b);
			}
		});
		return bullets;
	}
	constructor(center: Vector2) {
		super(center, 55 * distScale, 60 * fps);
		this.draw = (ctx) => {
			fillCircle(ctx, this.radius, this.center, '#ff10a0');
			fillCircle(
				ctx,
				this.radius * 0.9,
				this.center,
				`rgb(${this.fillColor.r},${this.fillColor.g}, ${this.fillColor.b})`
			);
		};
	}
}
