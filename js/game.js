"use strict";
var fps = 60;
var frameInterval = 1000 / fps;
function sizeMult() {
    return (canv.width + canv.height) / 2600;
}
function randomPoint() {
    return new Vector2(Math.random() * canv.width, Math.random() * canv.height);
}
var currentBoss;
var bossTimer;
function restart() {
    if (updateTimer)
        updateTimer.end();
    updateTimer = new Timer(frameInterval, 9999999, gameUpdate);
    drawables = [];
    if (currentBoss)
        currentBoss.delete();
    new player(new Vector2(canv.width / 2, canv.height / 2), 8.5 * sizeMult());
    if (bossTimer)
        bossTimer.end();
    bossTimer = new SecTimer(9, function (count, timer) {
        if (count == 1) {
            if (getPlayer().score > 0) {
                var pos = randomPoint();
                while (pos.Sub(getPlayer().center).length <
                    (canv.width + canv.height) / 3) {
                    pos = randomPoint();
                }
                currentBoss = new boss1(pos);
            }
            else
                timer.counter += 4;
        }
    });
}
restart();
var victoryTimer;
function victory(score) {
    updateTimer.end();
    new drawable(function (ctx) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canv.width, canv.height);
    }, 1, 'victoryShade');
    new drawable(function (ctx) {
        drawCenteredText(ctx, "Victory!", new Vector2(0, -120 * sizeMult()));
        drawCenteredText(ctx, "Score: " + score);
        drawCenteredText(ctx, "Press R to restart", new Vector2(0, 120 * sizeMult()), undefined, undefined, 56);
    }, 2, 'victoryText');
}
var updateTimer;
var renderTimer = new Timer(frameInterval, 9999999, render);
function gameUpdate() {
    updateCoinSpawn();
    updateCoins(getCoins());
    updateBodies(getBodies());
}
var coinTimer = 0;
function updateCoinSpawn() {
    coinTimer += 1;
    if (coinTimer >= getPlayer().coinSpawnCooldown && getCoins().length < 3) {
        var coinPos = randomPoint();
        new coin(coinPos);
        coinTimer = 0;
    }
}
function updateCoins(coins) {
    coins.forEach(function (c) {
        c.update();
    });
}
function updateBodies(bodies) {
    bodies.forEach(function (b) {
        if (!b)
            return;
        b.update();
    });
}
function onKeyPress(key) {
    if (key == 'r')
        restart();
}
function onClick(event) {
    getPlayer().velocity = CursorPos(event)
        .Sub(getPlayer().center)
        .normalized.Mult(getPlayer().speed);
}
function CursorPos(event) {
    return new Vector2(event.clientX, event.clientY);
}
