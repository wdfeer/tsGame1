type draw = (ctx: CanvasRenderingContext2D) => void;
class drawable {
	isDrawn: boolean = true;
	draw: draw;
	Draw(ctx: CanvasRenderingContext2D) {
		if (this.isDrawn) this.draw(ctx);
	}
	zIndex: number;
	id: string;
	delete() {
		delete drawables[drawables.indexOf(this)];
	}
	constructor(draw: draw = () => {}, zIndex: number = 0, id: string = '') {
		this.draw = draw;
		this.zIndex = zIndex;
		this.id = id;
		drawables.push(this);
	}
}
var drawables: drawable[] = [];
function getDrawableWithId(id: string): drawable | null {
	for (let i = 0; i < drawables.length; i++) {
		if (drawables[i] && drawables[i].id == id) return drawables[i];
	}
	return null;
}

function render(): void {
	let context = canv.getContext('2d')!;
	context.clearRect(0, 0, canv.width, canv.height);

	let getZ = (d?: drawable) => {
		if (d) return d.zIndex;
		return 0;
	};
	for (let i = drawables.min(getZ); i <= drawables.max(getZ); i++) {
		drawables.forEach((d) => {
			if (d.zIndex == i) {
				d.Draw(context);
			}
		});
	}
}

function drawCircle(
	ctx: CanvasRenderingContext2D,
	radius: number,
	center: Vector2,
	color: string = 'black',
	alpha: number = 1
): void {
	ctx.beginPath();
	ctx.globalAlpha = alpha;
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	ctx.strokeStyle = color;
	ctx.stroke();
}

function fillCircle(
	ctx: CanvasRenderingContext2D,
	radius: number,
	center: Vector2,
	color: string = 'black',
	alpha: number = 1
): void {
	ctx.beginPath();
	ctx.globalAlpha = alpha;
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function drawCenteredText(
	ctx: CanvasRenderingContext2D,
	text: string,
	color: string = 'black',
	alpha: number = 1,
	fontStyle: string = '96px Bahnschrift'
) {
	ctx.globalAlpha = alpha;
	ctx.fillStyle = color;
	ctx.font = fontStyle;
	ctx.textAlign = 'center';
	ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2);
}
