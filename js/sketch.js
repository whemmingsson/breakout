
///////////////////////////////
// ---- P5 FUNCTIONALITY --- //
///////////////////////////////

// FRAME Globals
const c_width = 900;
const c_height = 620;

let Keys = {
  RESET : 82, // r/R
  LAUNCH : 32, // space
  PAUSE : 32 // space
}

// Life -> Color mapping
let colors;

// Game objects
let bricks = [];
let ball ;
let paddle;
let gameOver = false;
let ballOnPaddle = true;
let gamePaused = false;
let score = 0;
let playerLife = PLAYER_LIFE;
let currentBallSpeed = {};

// Effects / powerups
let effects = [];
let currentEffects = [];
let bigPaddleEffect, bigBallEffect;

// Sound effects
let bounceSound, scoreSound, gameOverSound;

function preload() {
    if(ENABLE_SOUND) {
      bounceSound = loadSound('sounds/bounce.m4a');
      scoreSound = loadSound('sounds/score.m4a');
      gameOverSound = loadSound('sounds/gameover.m4a');

      bounceSound.setVolume(0.1);
      scoreSound.setVolume(1.2);
      gameOverSound.setVolume(0.1);
  }
}

// SETUP: Run ONCE
function setup() {
  let canvas = createCanvas(c_width, c_height);

  canvas.parent('sketch-holder');

  textSize(100);
  ellipseMode(CORNER);

  colors = {
    1: color("#264653"),
    2: color("#2a9d8f"),
    3: color("#e9c46a"),
    4: color("#f4a261"),
    5: color("#e76f51")
  }

  setupEffects();

  initGame();
}

function setupEffects(){
  bigPaddleEffect = new Effect(
    'bigpaddle',
    function() { paddle.width = PADDLE_WIDTH*1.5;},
    function() { paddle.width = PADDLE_WIDTH;},
    null,
    10,   
  )

  bigBallEffect = new Effect(
    'bigball',
    function() { ball.setDiameter(ball.width*2);},
    function() { ball.setDiameter(ball.BALL_DIAMATER);},
    null,
    10,   
  )

  slowBallEffect = new Effect(
    'slowball',
    function() { 
      currentBallSpeed = {dx:ball.dx, dy:Math.abs(ball.dy)}; 
      ball.dy = ball.dy*0.5;
    },
    function() { ball.dy = (ball.dy/Math.abs(ball.dy)) * currentBallSpeed.dy;},
    null,
    5,   
  )

  effects.push(bigPaddleEffect);
  //effects.push(bigBallEffect);
  effects.push(slowBallEffect);
}

function initGame() {
  gameOver = false;
  ballOnPaddle = true;
  bricks = [];

  let w = (c_width - (COL_COUNT+1) * SPACING) / COL_COUNT;

  for (let i = 0; i < COL_COUNT; i++) {
    for(let j = 0; j < ROW_COUNT; j++){

      bricks.push(new Brick(
        i * w + i * SPACING + SPACING, 
        SPACING + BRICK_HEIGHT*j + SPACING*j,
        w, 
        BRICK_HEIGHT,
        ROW_COUNT - j,
        getRandomEffect()
      ));   
    }
  }

  paddle = new Paddle(c_width / 2 - PADDLE_WIDTH/2, c_height-60, PADDLE_WIDTH, PADDLE_HEIGHT);
  ball = new Ball(paddle.x+paddle.width/2 - BALL_DIAMATER/2, paddle.y-BALL_DIAMATER-1, BALL_DIAMATER);

  score = 0;
  playerLife = PLAYER_LIFE;
}

function getRandomEffect() {
  return Math.floor(Math.random() * 100) <= EFFECT_PERCENT ? effects[Math.floor(Math.random() * effects.length)] : null;
}

// DRAW: Run EVERY FRAME UPDATE
function draw() {
  //renderGameOver();
  if(gameOver) {
    renderGameOver();
    return;
  }

  if(gamePaused){
    renderPaused();
    return;
  }

  logic();
  render();
}

function logic(){
  if(keyIsDown(LEFT_ARROW) && paddle.x > SPACING){
    paddle.move(-1);
  }
  else if(keyIsDown(RIGHT_ARROW) && paddle.x + paddle.width < c_width - SPACING){
    paddle.move(1);
  }

  if(!ballOnPaddle) {
    ball.move();
  }
  else {
    ball.x = paddle.x+paddle.width/2 - BALL_DIAMATER/2;
    ball.y = paddle.y-BALL_DIAMATER-1;
  }

  let collision = false;
  let toRemove = [];
  if(collisionHelper.collidesPaddle(ball, paddle)) {
      maybePlaySound(bounceSound);
      ball.dy*=-1;
      ball.dx += (ball.x - (paddle.x + paddle.width / 2))*XSPEED_BOUNCE_FACTOR;
   }

  for(var i = bricks.length-1; i >= 0; i--){
    let b = bricks[i];
    if(collisionHelper.collides(ball, b )){
      maybePlaySound(scoreSound);
      collision = true;
      b.applyEffect();
      score++;
      if(!toRemove.some(e => e == i))
        b.life--;
        if(b.life == 0) {
          bricks.splice(i, 1);
      }     
    }   
  }

  if(collision){
    ball.dy*=-1;
    ball.dy+=0.5;
    paddle.updateSpeed();
  }

  if(ball.checkCollitionWallsX()){
    ball.dx*=-1;
  }

  if(ball.checkCollitionWallsY()){
    ball.dy*=-1;
  }

  if(ball.checkOutOfBounds()){
     playerLife --;
      if(playerLife == 0){
        gameOver = true;
        maybePlaySound(gameOverSound);
      }
      else {
        paddle = new Paddle(c_width / 2 - PADDLE_WIDTH/2, c_height-60, PADDLE_WIDTH, PADDLE_HEIGHT);
        ball = new Ball(paddle.x+paddle.width/2 - BALL_DIAMATER/2, paddle.y-BALL_DIAMATER-1, BALL_DIAMATER);
        ballOnPaddle = true;
      }
  }
}

function render(){
  background(10);

  renderScore();
  renderLife();

  bricks.forEach(brick => {
    brick.render();
  });

  ball.render();
  paddle.render();

  // Under development
  // currentEffects.forEach(effect => {
  //   effect.effect.render();
  // });
}

function renderScore(){
  fill(60);
  textSize(30);
  text("Score: " + score, 12, c_height-12);
}

function renderLife(){
  fill("#e76f51");
  textSize(30);

  for(let i = 0; i < playerLife; i++){
    text("️❤" , c_width-38-i*32, c_height-12);
  }
  
}

function renderPaused(){
  render();  
  fill(0,0,0, 200);
  rect(0,0, c_width, c_height);
  textSize(180);
  fill(255);
  text("PAUSED", 120, c_height/2+200/2 - 40);
}

function renderGameOver(){
  //render();  
  //fill(0,0,0, 200);
  //rect(0,0, c_width, c_height);
  textSize(120);
  fill("#e76f51");
  text("GAME OVER", 100, c_height/2 + 60);
}

function keyPressed() {
  if (keyCode === Keys.LAUNCH){
      if(gameOver) {
        initGame();
      }
      else if(ballOnPaddle)
        ballOnPaddle = false;
      else
       gamePaused =! gamePaused;
  }
  else if(keyCode === Keys.RESET){
        initGame();
  }
}

function maybePlaySound(sound){
  if(ENABLE_SOUND)
    sound.play();
}

//////////////////////
// ---- CLASSES --- //
//////////////////////

let collisionHelper = {
  collides : function(ball, brick){
    return  ball.y < brick.y + brick.height &&  ball.x + ball.width > brick.x && ball.x < brick.x + brick.width;
  },

  collidesPaddle: function(ball, paddle) {
    //return  ball.y + ball.width> brick.y &&  ball.x + ball.width > brick.x && ball.x < brick.x + brick.width;
    return this.intersects(ball, paddle);
  },

  /* CODE TAKEN FROM : https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection */
  intersects : function(circle, rect)
 {
      circleDistance_x = Math.abs(circle.x+circle.width/2 - (rect.x+rect.width/2)); 
      circleDistance_y = Math.abs(circle.y+circle.width/2 - (rect.y+rect.height/2));

      if (circleDistance_x > (rect.width/2 + circle.width/2)) { return false; }
      if (circleDistance_y > (rect.height/2 + circle.width/2)) { return false; }

      if (circleDistance_x <= (rect.width/2)) { return true; } 
      if (circleDistance_y <= (rect.height/2)) { return true; }

      cornerDistance_sq = Math.pow(circleDistance_x + rect.width/2, 2) +
                          Math.pow(circleDistance_y + rect.height/2, 2);

      return (cornerDistance_sq <= Math.pow(circle.width/2,2));
  }
}

class Brick extends GameObject {
  constructor(x, y, w,h, life, effect) {
    super(x, y, w, h);
    this.life = life;
    this.effect = effect;
  }

  render() {
    fill(colors[this.life]);
    rect(this.x, this.y, this.width, this.height);

    if(this.effect !== null){
      fill(255, 255,255, 190);
      rect(this.x, this.y, this.width, this.height);
    }  
    
    if(this.effect === null){
      fill(255);
    }
    else{
      fill(25);
    }
    textSize(14);
    text(this.life, this.x+this.width/2-5, this.y+20);
  }

  applyEffect(){
    if(this.effect !== undefined && this.effect !== null){
      this.effect.apply();
      this.effect = null; // Remove the effect reference - it should only apply once
    }
  }
}

class Ball extends GameObject {
  constructor(x, y, w) {
    super(x,y, w, w);
    this.dx = BALL_XSPEED_INIT;
    this.dy = BALL_YSPEED_INIT; 
  }

  render() {
    fill(200);
    ellipse(this.x, this.y, this.width, this.width);
  }

  move(){
    this.x += this.dx;
    this.y += this.dy;
  }

  setDiameter(d){
    this.width = d;
    this.height = d;
  }

  checkCollitionWallsX(){
    return this.x + this.width > width - SPACING || this.x < SPACING
  }

  checkCollitionWallsY(){
    return this.y < SPACING;
  }

  checkOutOfBounds() {
    return this.y + this.width > height - SPACING;
  }
}

class Paddle extends GameObject{
  constructor(x, y, w,h) {
    super(x,y,w,h);
    this.displayWidth = w;
    this.displayHeight = h;
    this.speedFactor = 1;
    this.dx = PADDLE_SPEED;
  }

  render() {
    fill(245);
    rect(this.x, this.y, this.width, this.height);
  }

  move(direction){
    this.x += this.dx*direction;
  }

  updateSpeed(){
    this.dx += 0.5;
  }
}

class Effect {
  constructor(id, effectFunc, removeEffectFunc, renderFunc, timeout) {
    this.id = id;
    this.effectFunc = effectFunc;
    this.removeEffectFunc = removeEffectFunc;
    this.renderFunc = renderFunc;
    this.timeout = timeout;
    this.active = false;
    this.timer = null;
  }

  apply(){
    if(!this.active) {   
      this.effectFunc();
      this.active = true;
      this.timer = new Timeout(this.removeEffect, this.timeout, this);
      let timerId = this.timer.begin();
      currentEffects.push({id:timerId, effect:this});
    }
    else{
      this.timer.extend(this.timeout);
    }
  }

  removeEffect(e){
    e.removeEffectFunc();
    e.active = false;
    currentEffects.splice(currentEffects.indexOf(e), 1);
  }

  render() {
    // UNDER DEVELOPMENT
    /*
    if(this.active && this.renderFunc !== null)
      this.renderFunc(); */

  }
}
