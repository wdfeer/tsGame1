class coin extends stationaryCircle {
	draw = (ctx: CanvasRenderingContext2D) => {
		drawCircle(ctx, coin.radius, this.center, 'green');
		fillCircle(ctx, coin.radius, this.center, '#faffde', this.alpha);
	};
	zIndex = -2;
	static get radius() {
		return 22 * sizeMult();
	}
	onPlayerCollide: () => void = () => {
		getPlayer().onCoinCollect();

		let alpha = 1;
		let timeLeft = fps * 2;
		new Timer(frameInterval, timeLeft, (counter) => {
			if (counter < timeLeft / 3) {
				alpha = counter / (timeLeft / 3);
			}
		});
		new drawable(
			(ctx) => {
				drawCenteredText(ctx, String(getPlayer().score), undefined, alpha);
			},
			undefined,
			'score'
		);

		this.delete();
	};
	constructor(public center: Vector2) {
		super(center, coin.radius);
	}
	update() {
		let plColliding = this.collider.colliding(getPlayer().collider);
		if (plColliding) this.onPlayerCollide();
		if (plColliding || (boss && this.collider.colliding(boss.collider))) {
			this.delete();
		}
	}
}
