var fondoJuego;
var nave;
var balas;
var tiempoBala = 0;
var botonDisparo;
var enemigos;
var tiempoEntreBalas = 400;
var tiempo = 0;
var malos;
var timer;
var puntos = 0;
var txtPuntos;
var vidas;
var txtVidas;
var juego = new Phaser.Game(370, 550, Phaser.CANVAS, 'bloque_juego');

var estadoPrincipal = {
  preload: function() {
    juego.load.image('fondo', 'img/space.png');
    juego.load.image('nave', 'img/nave.png');
    juego.load.image('laser', 'img/laser.png');
    juego.load.image('malo', 'img/pajaro2.png'); // Cambiado a pajaro2.png
    juego.load.audio('disparo', 'audio/disparo.wav');
    juego.load.audio('explosion', 'audio/explosion.wav');
  },

  create: function() {
    fondoJuego = juego.add.tileSprite(0, 0, 370, 550, 'fondo');
    juego.physics.startSystem(Phaser.Physics.ARCADE);

    nave = juego.add.sprite(juego.width / 2, 485, 'nave');
    nave.anchor.setTo(0.5);
    juego.physics.arcade.enable(nave, true);

    balas = juego.add.group();
    balas.enableBody = true;
    balas.physicsBodyType = Phaser.Physics.ARCADE;
    balas.createMultiple(50, 'laser');
    balas.setAll('anchor.x', 0.5);
    balas.setAll('anchor.y', 0.5);
    balas.setAll('outOfBoundsKill', true);
    balas.setAll('checkWorldBounds', true);

    malos = juego.add.group();
    malos.enableBody = true;
    malos.physicsBodyType = Phaser.Physics.ARCADE;
    malos.createMultiple(50, 'malo'); // Usando pajaro2.png
    malos.setAll('anchor.x', 0.5);
    malos.setAll('anchor.y', 0.5);
    malos.setAll('outOfBoundsKill', true);
    malos.setAll('checkWorldBounds', true);

    timer = juego.time.events.loop(2000, this.crearEnemigo, this);

    // Definiendo el puntaje y las vidas en pantalla
    txtPuntos = juego.add.text(80, 20, "0", { font: "14px Arial", fill: "#FFF" });
    juego.add.text(20, 20, "Puntaje: ", { font: "14px Arial", fill: "#FFF" });
    txtVidas = juego.add.text(360, 20, "3", { font: "14px Arial", fill: "#FFF" });
    juego.add.text(310, 20, "Vidas: ", { font: "14px Arial", fill: "#FFF" });
    juego.add.text(20, 520, "Sanchez Valderrama Jordy Anthony", { font: "14px Arial", fill: "#FFF" });

    // Inicializando vidas
    vidas = 3;

    // Agregar controles de entrada
    juego.input.onDown.add(this.disparar, this);
  },

  update: function() {
    nave.rotation = juego.physics.arcade.angleToPointer(nave) + Math.PI / 2;
    nave.x = juego.input.x;

    fondoJuego.tilePosition.y += 1; // Mueve el fondo hacia abajo

    // Agregando colisiones
    juego.physics.arcade.overlap(balas, malos, this.colision, null, this);
    
    // Defendiendo el contador de vidas
    malos.forEachAlive(function(m) {
      if (m.position.y > 520 && m.position.y < 521) {
        vidas -= 1;
        txtVidas.text = vidas;
        m.kill(); // Eliminar enemigo cuando llega al límite inferior
      }
    });

    if (vidas === 0) {
      this.gameOver();
    }
  },

  disparar: function() {
    if (juego.time.now > tiempo && balas.countDead() > 0) {
      tiempo = juego.time.now + tiempoEntreBalas;
      var sonidoDisparo = juego.add.audio('disparo');
      sonidoDisparo.play();
      var bala = balas.getFirstDead();
      bala.anchor.setTo(0.5);
      bala.reset(nave.x, nave.y);
      bala.rotation = juego.physics.arcade.angleToPointer(bala) + Math.PI / 2;
      juego.physics.arcade.moveToPointer(bala, 200);
    }
  },

  crearEnemigo: function() {
    var enem = malos.getFirstDead();
    var num = Math.floor(Math.random() * 10 + 1);
    enem.reset(num * 38, 0);
    enem.anchor.setTo(0.5);
    enem.body.velocity.y = 100;
    enem.checkWorldBounds = true;
    enem.outOfBoundsKill = true;
  },

  colision: function(b, m) {
    var sonidoExplosion = juego.add.audio('explosion');
    sonidoExplosion.play();
    b.kill();
    m.kill();
    puntos++;
    txtPuntos.text = puntos;
  },

  gameOver: function() {
    juego.add.text(juego.world.centerX, juego.world.centerY, "PERDISTE", { font: "bold 32px Arial", fill: "#FFF" }).anchor.setTo(0.5);
    juego.time.events.add(Phaser.Timer.SECOND * 3, function() {
      juego.state.start('principal'); // Reinicia el juego cambiando al estado 'principal'
    }, this);
  }
};

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');
