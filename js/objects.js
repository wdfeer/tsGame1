"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var body = /** @class */ (function () {
    function body(center, radius) {
        this.center = Vector2.Zero;
        this.velocity = Vector2.Zero;
        this.radius = 0;
        this.center = center;
        this.radius = radius;
    }
    Object.defineProperty(body.prototype, "collider", {
        get: function () {
            return new CircleCollider(this.center, this.radius);
        },
        enumerable: false,
        configurable: true
    });
    body.prototype.update = function () {
        this.center.add(this.velocity);
    };
    return body;
}());
var player = /** @class */ (function (_super) {
    __extends(player, _super);
    function player(center, radius) {
        var _this = _super.call(this, center, radius) || this;
        _this.score = 0;
        _this._hp = 100;
        return _this;
    }
    Object.defineProperty(player.prototype, "hp", {
        get: function () {
            return this._hp;
        },
        set: function (value) {
            if (value <= 0)
                restart();
            this._hp = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(player.prototype, "speed", {
        get: function () {
            return 4 + this.score / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(player.prototype, "coinSpawnCooldown", {
        get: function () {
            return fps * 3 / Math.sqrt(1 + this.score / 3);
        },
        enumerable: false,
        configurable: true
    });
    player.prototype.update = function () {
        this.center.add(this.velocity);
        if ((this.center.x + this.radius > canv.width && this.velocity.x > 0) || (this.center.x - this.radius < 0 && this.velocity.x < 0))
            this.velocity.x = -this.velocity.x * 0.9;
        if ((this.center.y + this.radius > canv.height && this.velocity.y > 0) || (this.center.y - this.radius < 0 && this.velocity.y < 0))
            this.velocity.y = -this.velocity.y * 0.9;
    };
    return player;
}(body));
var enemy = /** @class */ (function (_super) {
    __extends(enemy, _super);
    function enemy(center, radius) {
        var _this = _super.call(this, center, radius) || this;
        _this.active = true;
        _this.onPlayerHit = function () { };
        _this.ai = function () { };
        return _this;
    }
    Object.defineProperty(enemy.prototype, "AI", {
        get: function () {
            if (!this.active)
                return function () { };
            if (this.collider.colliding(pl.collider))
                this.onPlayerHit();
            return this.ai;
        },
        enumerable: false,
        configurable: true
    });
    return enemy;
}(body));
var boss1 = /** @class */ (function (_super) {
    __extends(boss1, _super);
    function boss1(center, radius) {
        var _this = _super.call(this, center, radius) || this;
        _this.speed = 6;
        _this.onPlayerHit = function () {
            pl.hp -= 100;
        };
        _this.attackTimer = 0;
        _this.ai = function () {
            var diff = pl.center.Sub(_this.center);
            var dist = diff.length;
            if (dist > 200 + 1000 * Math.random())
                _this.velocity = pl.center.Sub(_this.center).normalized.Mult(_this.speed);
            _this.attackTimer++;
            if (_this.attackTimer >= _this.attackCooldown) {
                _this.rangedAttack();
                _this.attackTimer = 0;
            }
        };
        drawings.push(function (ctx) {
            fillCircle(ctx, _this.radius, _this.center, 'red');
            fillCircle(ctx, _this.radius * 0.9, _this.center, 'black');
        });
        return _this;
    }
    Object.defineProperty(boss1.prototype, "attackCooldown", {
        get: function () {
            return 40 + 80 / Math.sqrt(pl.score + 1);
        },
        enumerable: false,
        configurable: true
    });
    boss1.prototype.rangedAttack = function () {
        var bullets = shootEvenlyInACircle(3 + Math.floor(Math.sqrt(pl.score)), 19, this.center, 5 + 10 * Math.random());
        bullets.forEach(function (b) {
            bodies.push(b);
            drawings.push(function (ctx) {
                drawCircle(ctx, b.radius, b.center, 'black');
                fillCircle(ctx, b.radius, b.center, 'red');
            });
        });
    };
    return boss1;
}(enemy));
var bullet = /** @class */ (function (_super) {
    __extends(bullet, _super);
    function bullet(center, velocity, radius) {
        var _this = _super.call(this, center, radius) || this;
        _this.onPlayerHit = function () {
            pl.hp -= 100;
        };
        _this.velocity = velocity;
        return _this;
    }
    return bullet;
}(enemy));
function shootEvenlyInACircle(count, bulletRadius, pos, velocity, spawnRadius) {
    if (spawnRadius === void 0) { spawnRadius = 0; }
    var bullets = [];
    var angle = 0;
    for (var i = 0; i < count; i++) {
        var Vy = Math.sin(angle) * velocity;
        var Vx = Math.cos(angle) * velocity;
        var V = new Vector2(Vx, Vy);
        bullets.push(new bullet(pos.Add(V.normalized.Mult(spawnRadius)), V, bulletRadius));
        angle += 360 / count;
    }
    return bullets;
}
var coin = /** @class */ (function () {
    function coin(pos) {
        var _this = this;
        this.pos = pos;
        this.onPlayerCollide = function () {
            _this.deleteDrawing();
            pl.score++;
            var alpha = 1;
            var timeLeft = fps * 2;
            new Timer(frameInterval, timeLeft, function (counter) {
                if (counter < timeLeft / 3) {
                    alpha = counter / (timeLeft / 3);
                }
            });
            scoreDraw = function (ctx) {
                drawCenteredText(ctx, String(pl.score), undefined, alpha);
            };
        };
        this.draw = function (ctx) {
            drawCircle(ctx, coin.radius, pos, 'green');
            fillCircle(ctx, coin.radius, pos, '#ffffde');
        };
        this.drawingId = drawings.length;
        drawings.push(this.draw);
        this.collider = new CircleCollider(pos, coin.radius);
    }
    coin.prototype.deleteDrawing = function () {
        delete drawings[this.drawingId];
    };
    coin.radius = 25;
    return coin;
}());
