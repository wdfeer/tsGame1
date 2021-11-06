class player extends body {
	draw = (ctx: CanvasRenderingContext2D) => {
		drawCircle(ctx, this.radius, this.center);
		fillCircle(ctx, this.radius, this.center, 'crimson', this.alpha);
	};
	id = 'player';

	score: number = 0;
	scoreAlpha: number = 1;
	scoreFadeTimer: Timer | null = null;
	godmode: boolean = false;
	static readonly maxhp: number = 100;
	private _hp: number = player.maxhp;
	public get hp(): number {
		return this._hp;
	}
	public set hp(value: number) {
		if (value < this.hp) playSound('./sounds/hit.mp3');
		if (this.godmode) return;
		if (value <= 0) {
			restart();
			this._hp = 0;
			return;
		}
		if (value >= player.maxhp) value = player.maxhp;
		this._hp = value;
		this.alpha = this.hp / player.maxhp;
	}
	get speed() {
		return (8 - 5 * Math.pow(0.9, this.score)) * sizeMult();
	}
	onCoinCollect() {
		this.score++;
		this.hp += 5;

		playSound('./sounds/score.mp3', 0.25);

		this.scoreAlpha = 1;
		let timeLeft = fps * (1 + 2 * Math.pow(0.9, this.score));
		if (this.scoreFadeTimer) this.scoreFadeTimer.end();
		this.scoreFadeTimer = new Timer(frameInterval, timeLeft, (counter) => {
			if (counter < timeLeft / 3) {
				this.scoreAlpha = counter / (timeLeft / 3);
			}
		});
		if (!getDrawableWithId('score'))
			new drawable(
				(ctx) => {
					drawCenteredText(
						ctx,
						String(getPlayer().score),
						undefined,
						undefined,
						this.scoreAlpha
					);
				},
				undefined,
				'score'
			);
	}
	get coinSpawnCooldown() {
		return (fps * 3) / Math.sqrt(1 + this.score / 3);
	}
	constructor(center: Vector2, radius: number) {
		super(center, radius);
	}
}
