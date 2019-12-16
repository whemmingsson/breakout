
///////////////////////////////
// ---- P5 FUNCTIONALITY --- //
///////////////////////////////

// FRAME Globals
const c_width = 900;
const c_height = 600;

// Global game settings
let Settings = {
  // Enables the sound for the whole game
  ENABLE_SOUND : false,
  BALL_DIAMATER : 20,
  ROW_COUNT : 4,
  COL_COUNT : 10,
  PADDLE_HEIGHT : 16,
  PADDLE_WIDTH : 110,
  BRICK_HEIGHT : 28,
  // Sets the spacing between bricks but also invisible wall around the game area
  SPACING : 3,
  // Sets the bounce factor when the ball hits the paddle. Higher values means more effect on x-speed on bounce.
  XSPEED_BOUNCE_FACTOR : 0.10,
  BALL_XSPEED_INIT : 3,
  BALL_YSPEED_INIT : -9,
  PADDLE_SPEED : 12,
  EFFECT_PERCENT: 12,
  PLAYER_LIFE : 3
};

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
let playerLife = Settings.PLAYER_LIFE;

// Effects / powerups
let currentEffects = [];
let bigPaddleEffect;

// Sound effects
let bounceSound, scoreSound, gameOverSound;

function preload() {
    if(Settings.ENABLE_SOUND) {
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
  createCanvas(c_width, c_height);

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
    function() { paddle.width = Settings.PADDLE_WIDTH*1.5;},
    function() { paddle.width = Settings.PADDLE_WIDTH;},
    function() { 
      fill(10, 50, 240, 150);
      rect(paddle.x, paddle.y, paddle.width, paddle.height);
    },
    10,   
  )
}

function initGame() {
  gameOver = false;
  ballOnPaddle = true;
  bricks = [];

  let w = (c_width - (Settings.COL_COUNT+1) * Settings.SPACING) / Settings.COL_COUNT;

  for (let i = 0; i < Settings.COL_COUNT; i++) {
    for(let j = 0; j < Settings.ROW_COUNT; j++){
      let randomNr = Math.floor(Math.random() * 100);
      let addEffect = randomNr <= Settings.EFFECT_PERCENT;  // X% chance of applying the effect
      bricks.push(new Brick(
        i * w + i * Settings.SPACING + Settings.SPACING, 
        Settings.SPACING + Settings.BRICK_HEIGHT*j + Settings.SPACING*j + Settings.BRICK_HEIGHT,
        w, 
        Settings.BRICK_HEIGHT,
        Settings.ROW_COUNT - j,
        addEffect ? bigPaddleEffect : null
      ));   
    }
  }

  paddle = new Paddle(c_width / 2 - Settings.PADDLE_WIDTH/2, c_height-40, Settings.PADDLE_WIDTH, Settings.PADDLE_HEIGHT);
  ball = new Ball(paddle.x+paddle.width/2 - Settings.BALL_DIAMATER/2, paddle.y-Settings.BALL_DIAMATER-1, Settings.BALL_DIAMATER);

  score = 0;
  playerLife = Settings.PLAYER_LIFE;
}

// DRAW: Run EVERY FRAME UPDATE
function draw() {
  if(gameOver)
    return;

  if(gamePaused){
    render();  
    fill(0,0,0, 200);
    rect(0,0, c_width, c_height);
    textSize(200);
    fill(255);
    text("PAUSED", 220, c_height/2+200/2 - 40);
    return;
  }

  logic();
  render();
}

function logic(){
  if(keyIsDown(LEFT_ARROW) && paddle.x > Settings.SPACING){
    paddle.move(-Settings.PADDLE_SPEED);
  }
  else if(keyIsDown(RIGHT_ARROW) && paddle.x + paddle.width < c_width - Settings.SPACING){
    paddle.move(Settings.PADDLE_SPEED);
  }

  if(!ballOnPaddle)
    ball.move();
  else {
    ball.x = paddle.x+paddle.width/2 - Settings.BALL_DIAMATER/2;
    ball.y = paddle.y-Settings.BALL_DIAMATER-1;
  }

  let collision = false;
  let toRemove = [];
  if(collisionHelper.collidesPaddle(ball, paddle)) {
      maybePlaySound(bounceSound);
      ball.dy*=-1;
      ball.dx += (ball.x - (paddle.x + paddle.width / 2))*Settings.XSPEED_BOUNCE_FACTOR;
   }

  for(var i = bricks.length-1; i >= 0; i--){
    let b = bricks[i];
    if(collisionHelper.collides(ball, b )){
      maybePlaySound(scoreSound);
      collision = true;
      b.applyEffect();
      score++;
      if(!toRemove.some(e =>e == i))
        b.life--;
        if(b.life == 0) {
          bricks.splice(i, 1);
      }     
    }   
  }

  if(collision){
    ball.dy*=-1;
    ball.dy*=1.05;
  }

  if(ball.checkCollitionWallsX()){
    ball.dx*=-1;
  }

  if(ball.checkCollitionWallsY()){
    ball.dy*=-1;
  }

  if(ball.checkOutOfBounds()){
    gameOver = true;
    maybePlaySound(gameOverSound);
  }
}

function render(){
  background(10);

  renderScore();

  bricks.forEach(brick => {
    brick.render();
  });

  ball.render();
  paddle.render();

  currentEffects.forEach(effect => {
    effect.effect.render();
  });
}

function renderScore(){
  fill(40);
  textSize(100);
  text(score, c_width/2-20, c_height/2+72/2);
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
  if(Settings.ENABLE_SOUND)
    sound.play();
}

//////////////////////
// ---- CLASSES --- //
//////////////////////

let collisionHelper = {
  collides : function(ball, brick){
    return  ball.y < brick.y + brick.height &&  ball.x + ball.width > brick.x && ball.x < brick.x + brick.width;
  },

  collidesPaddle: function(ball, brick) {
    return  ball.y + ball.width> brick.y &&  ball.x + ball.width > brick.x && ball.x < brick.x + brick.width;
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
    this.dx = Settings.BALL_XSPEED_INIT;
    this.dy = Settings.BALL_YSPEED_INIT; 
  }

  render() {
    fill(200);
    ellipse(this.x, this.y, this.width, this.width);
  }

  move(){
    this.x += this.dx;
    this.y += this.dy;
  }

  checkCollitionWallsX(){
    return this.x + this.width > width - Settings.SPACING || this.x < Settings.SPACING
  }

  checkCollitionWallsY(){
    return this.y < Settings.SPACING;
  }

  checkOutOfBounds() {
    return this.y + this.width > height - Settings.SPACING;
  }
}

class Paddle extends GameObject{
  constructor(x, y, w,h) {
    super(x,y,w,h);
    this.displayWidth = w;
    this.displayHeight = h;
  }

  render() {
    fill(245);
    rect(this.x, this.y, this.displayWidth, this.displayHeight);
  }

  move(dx){
    this.x += dx;
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
    if(this.active && this.renderFunc !== null)
      this.renderFunc();
  }
}
