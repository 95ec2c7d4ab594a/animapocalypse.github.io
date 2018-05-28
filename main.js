var game = new Phaser.Game(800, 600,  Phaser.CANVAS, 'gameDiv');
//player and background:
var background;
var player;
var cursors;
var health = 100;
var dog;


//bullets:
var bullets;
var bulletTime = 0;
var fireButton;

//enemy:
var enemies;

//cure:
var cure;


//hexcolour:
var rand = (Math.random()*0xFFFFFF<<0).toString(16);

//debug:
var debug;

//scoring:
var score = 0;
var scoreText;

//winning:
var winText;


//platforms:
var platforms;
var bounds
var gameText;

//testing:
var enemyHealth = 100;
var bulletDamage = 50;
var dogHealth = 100;

//values:
var enemiesKilled = {amount: []}
var cureAmount = 0;
var dogCured = 0;

//fps:
var fpsText;



//pause button:
var pause = document.createElement("BUTTON");
pause.id="pause";
pause.textContent = "pause";
pause.addEventListener('click', () => {
  game.paused = true;
  alert('Game Paused');
});
document.body.appendChild(pause);

//resume button:
var resume = document.createElement("BUTTON");
resume.id="resume";
resume.textContent = "resume";
resume.addEventListener('click', () => {
    game.paused = false;
});
document.body.appendChild(resume)

//restart button:
var restart = document.createElement('BUTTON');
restart.id = "restart";
restart.textContent = "Restart";
restart.addEventListener('click', () => {
  window.location.reload();
});
document.body.appendChild(restart);



var mainState = {



  preload() {

    //preloads everything required in game
    game.load.image('trees', 'assets/background.png');
    // game.load.image('player', 'assets/protagonist.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemy', 'assets/zombie.png');
    game.load.spritesheet('dog', 'assets/dogSheet.png', 192, 144 , 2);
    game.load.image('test', 'assets/floor.png');
    game.load.image('bounds', 'assets/bounds.png');
    game.load.image('cure', 'assets/cure.png');
    game.load.spritesheet('player', 'assets/protagonistSheet.png', 192, 192, 6);

  },

  create() {
    //creates everything in game

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        //background
        background = game.add.tileSprite(0,0,800,600, 'trees');

      //player
      // player = game.add.sprite(game.world.centerX,game.world.centerY + 40, 'player');

      player = game.add.sprite(40, 100, 'player');
      player.animations.add('walk');
      player.animations.play('walk', 12, true);
      game.physics.enable(player,Phaser.Physics.ARCADE);


      //dog
      dog = game.add.sprite(game.world.centerX - 410, game.world.centerY + 190, 'dog');
      dog.scale.setTo(0.8);
      dog.animations.add('original', [1], true);
      dog.animations.add('second', [0], true);
      dog.animations.play('original');
      dog.anchor.x -= 0.1;
      dog.anchor.y -= 0.0;
      game.physics.enable(dog,Phaser.Physics.ARCADE);
      dog.body.immovable = true;

      //platforms
      platforms = game.add.physicsGroup();
      platforms.create(0, 600, 'test');
      platforms.setAll('body.immovable', true);

      bounds = game.add.physicsGroup();
      bounds.create(795, 120, 'bounds');  
      bounds.setAll('body.immovable', true);

      //collision world borders
      player.body.collideWorldBounds = true;

      //makes arrow keys usable
      cursors = game.input.keyboard.createCursorKeys();

      //makes the bullets
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;
      bullets.createMultiple(30, 'bullet');
      bullets.setAll('anchor.x', 0.5);
      bullets.setAll('anchor.y', 1);
      bullets.setAll('outOfBoundsKill', true);
      bullets.setAll('checkWorldBounds', true);

      //firebutton
      fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      //enemies
      enemies = game.add.group();
      enemies.enableBody = true;
      enemies.physicsBodyType = Phaser.Physics.ARCADE;

      createEnemies();

      //scoretext and wintext
      scoreText = game.add.text(15,15, `Score: ${score}`, {
        font: "20px Arial",
        fill: `#${rand}`,
        align: "left"
      });

        winText = game.add.text(400, 300, "You Win!", {
          font: "20px Arial",
          fill: `#${rand}`,
          align: "left"
        });
        winText.visible = false
        gameText = game.add.text(10, 400, "Press Down Arrow Key!", {
          font: "20px Arial",
          fill: `#${rand}`,
          align: "left"
        });
        gameText.visible = false

        //fps test
        game.time.advancedTiming = true;

  },



  update() {

    //everything in here happens each frame

    player.body.gravity.y = 550;
    game.physics.arcade.collide(player, platforms);


    //colliders
    game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this); //bullets
    game.physics.arcade.overlap(dog, enemies, lossHandler, null, this); //dog death
    game.physics.arcade.overlap(bullets, bounds, spamProtector, null, this); //bounds for bullets
    game.physics.arcade.overlap(player, cure, winHandler, null, this); //cure collector

    background.tilePosition.x -= 2;

    if(cursors.left.isDown) {

      player.body.x -= 7;

    }

    if(cursors.right.isDown) {

      player.body.x += 7;

    }

    if(fireButton.isDown) {
      fireBullet();
    }

    if (cursors.up.isDown && (player.body.onFloor() || player.body.touching.down)) {
        player.body.velocity.y -= 300;
    }

    if (cureAmount === 1 && game.physics.arcade.collide(player, dog)) {
      gameText.visible = true;
        if (cursors.down.isDown) {
            dogCured = 1;
            cureAmount = 0;
            dog.animations.play('second');
          if (dogCured === 1) {
            gameText.visible = false;
            cure.kill();
          }
      }
    } else {
      gameText.visible = false;
    }

    enemies.x -= 1;

    if (enemiesKilled.amount.length === 10) {
      spawnCure();
      enemiesKilled.amount = []
    }

    if (score === 1000 && dogCured === 1) {
      scoreText.visible = false;
      winText.visible = true;
      score === 1000
    }

    if (dogHealth === 0) {
      dog.kill()
      game.paused = true;
      alert('Failed, The Dog Died!');
    }

    if (enemies.countLiving() === 0) {
      if (score < 1000) {
        createEnemies();
      } else {
        enemies.kill();
      }
    }
    //check if score = 1000 if so wins the game
    scoreText.text = "Score: " + score;

  },

  render() {

    game.debug.text(game.time.fps, 780, 14, `#${rand}`);

  }

};

//functions

function fireBullet()  {

  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {
      bullet.reset(player.x + 150, player.y +100);
      bullet.body.velocity.x += 400;
      bulletTime = game.time.now + 200;
    }
  }
}

function createEnemies() {

    for(var y = 0; y < 1; y++){
       for(var x = 0; x < 2; x++) {
        var enemy = enemies.create(x*75, y*55, 'enemy');
        enemy.anchor.setTo(-4, -2);
      }
    }
    enemies.x = 100;
    enemies.y = 50;
}


function collisionHandler(bullet, enemy) {

  bullet.kill();
  enemy.kill();

  enemiesKilled.amount.push(1);

  score += 100;

  scoreText.setText('Score: ' + score);

};

function lossHandler(dog, enemy) {

  enemy.kill();
  dogHealth -= 50;

}

function spamProtector(bullet, bounds) {

  bullet.kill();

}

function winHandler(player, cure) {

  cure.kill();
  cureAmount += 1;
}

function spawnCure() {
  cure = game.add.sprite(game.world.centerX + 350, game.world.centerY + 250, 'cure');
  game.physics.enable(cure,Phaser.Physics.ARCADE);
}

game.state.add('mainState', mainState);

game.state.start('mainState');
