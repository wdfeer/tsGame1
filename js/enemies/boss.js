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
var boss = /** @class */ (function (_super) {
    __extends(boss, _super);
    function boss(center, radius, timeLeft) {
        var _this = _super.call(this, center, radius) || this;
        _this.speed = 2 * distScale;
        _this.attackTimer = 0;
        _this.attacks = [];
        _this._currentAttack = 0;
        _this.baseTimeLeft = timeLeft;
        _this.timeLeft = timeLeft;
        _this.baseRadius = radius;
        return _this;
    }
    boss.prototype.preTick = function (timeLeft) {
        this.radius =
            this.baseRadius * 0.35 +
                this.baseRadius * 0.65 * (timeLeft / this.baseTimeLeft);
    };
    boss.prototype.delete = function () {
        _super.prototype.delete.call(this);
    };
    Object.defineProperty(boss.prototype, "attackCooldown", {
        get: function () {
            return (35 + 55 / (getPlayer().score > 9 ? Math.sqrt(getPlayer().score - 8) : 1));
        },
        enumerable: false,
        configurable: true
    });
    boss.prototype.attack = function () {
        this.attacks[this.currentAttack]();
        this.currentAttack++;
        this.attackTimer = 0;
    };
    Object.defineProperty(boss.prototype, "currentAttack", {
        get: function () {
            return this._currentAttack;
        },
        set: function (value) {
            if (value < 0)
                value = this.attacks.length - 1;
            else if (value >= this.attacks.length)
                value = 0;
            this._currentAttack = value;
        },
        enumerable: false,
        configurable: true
    });
    boss.prototype.update = function () {
        this.preTick(this.timeLeft);
        this.timeLeft--;
        if (this.timeLeft <= 1) {
            this.onTimeout();
            this.delete();
        }
        _super.prototype.update.call(this);
    };
    return boss;
}(enemy));