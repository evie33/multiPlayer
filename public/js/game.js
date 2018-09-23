// const socket = io(window.location.origin);

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('hippo', 'assets/hippo.png');
  this.load.image('giraffe', 'assets/giraffe.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('broadcast', data => {
    this.ship.body.velocity.x = -100;
  });
  this.socket.on('toRight', () => {
    this.ship.body.velocity.x = 100;
  });
  this.socket.on('toUp', () => {
    this.ship.body.velocity.y = -100;
  });
  this.socket.on('playerMoved', function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', {
    fontSize: '25px',
    fill: '#7AE8A0'
  });
  this.redScoreText = this.add.text(584, 16, '', {
    fontSize: '25px',
    fill: '#5DF0FF'
  });

  this.socket.on('scoreUpdate', function(scores) {
    self.blueScoreText.setText('Happi: ' + scores.blue);
    self.redScoreText.setText('Crazy: ' + scores.red);
  });

  this.socket.on('starLocation', function(starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(
      self.ship,
      self.star,
      function() {
        this.socket.emit('starCollected');
      },
      null,
      self
    );
  });
}

function addPlayer(self, playerInfo) {
  if (playerInfo.team === 'blue') {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, 'hippo')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(33, 30);
  } else {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, 'giraffe')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(33, 30);
  }
}

function addOtherPlayers(self, playerInfo) {
  let otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer');
  if (playerInfo.team === 'blue') {
    otherPlayer = self.physics.add
      .image(playerInfo.x, playerInfo.y, 'giraffe')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(33, 30);
  } else {
    otherPlayer = self.physics.add
      .image(playerInfo.x, playerInfo.y, 'hippo')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(33, 30);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.ship) {
    if (this.cursors.left.isDown) {
      this.ship.body.velocity.x = -100;
    } else if (this.cursors.right.isDown) {
      this.ship.body.velocity.x = 100;
    }
    if (this.cursors.up.isDown) {
      this.ship.body.velocity.y = -100;
    } else if (this.cursors.down.isDown) {
      this.ship.body.velocity.y = 100;
    }

    this.physics.world.wrap(this.ship, 5);

    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (
      this.ship.oldPosition &&
      (x !== this.ship.oldPosition.x ||
        y !== this.ship.oldPosition.y ||
        r !== this.ship.oldPosition.rotation)
    ) {
      this.socket.emit('playerMovement', {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };
  }
}
