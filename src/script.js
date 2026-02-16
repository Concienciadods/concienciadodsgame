
var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,           // Ajusta el juego al contenedor
        autoCenter: Phaser.Scale.CENTER_BOTH, // Lo centra siempre
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var score = 0
var scoreText
var gameOver = true
var partidarepetida = false
var sonidocoin

var game = new Phaser.Game(config)

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png')
    this.load.image('star', 'assets/star.png')
    this.load.image('bomb', 'assets/bomb.png')
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48})
    this.load.image('jump', 'assets/mobile/jump_button.png')
    this.load.image('left', 'assets/mobile/left_button.png')
    this.load.image('right', 'assets/mobile/right_button.png')

    this.load.audio('coin', 'assets/audio/coin.mp3');
}
function create() {

    this.fondo = this.add.image(400, 300, 'sky');

    // 2. TEXTO DEL MUNDO (Lo creamos vacío al principio)
    worldText = this.add.text(400, 300, '', { 
        fontSize: '64px', 
        fill: '#fff', 
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6
    }).setOrigin(0.5); // Centrado en pantalla

    sonidocoin = this.sound.add('coin');
    
    platforms = this.physics.add.staticGroup()

    platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')

    player = this.physics.add.sprite(100, 450, 'dude')

    player.setCollideWorldBounds(true)
    player.setBounce(0.2)

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude',{ start: 0, end: 3}),
        frameRete: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [ {key: 'dude', frame: 4}],
        frameRete: 10,

    })

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude',{ start: 5, end: 8}),
        frameRete: 10,
        repeat: -1
    })

    //player.body.setGravityY(300);

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    })

    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })
    
    this.physics.add.collider(stars , platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this)

    scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'})

    bombs = this.physics.add.group()

    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)


    if (partidarepetida==false) {
    let contenedorMenu = this.add.container(0, 0);

    let btnJugar = this.add.text(400, 300, ' EMPEZAR PARTIDA ', {
    fontSize: '32px',
    fill: '#ffffff00',
    backgroundColor: '#11111100',
    padding: { x: 20, y: 10 },
    fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }); // Hace que aparezca la "manita" al pasar por encima

    let titulo = this.add.text(400, 150, 'CONCIENCIADODS', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    let txtJugar = this.add.text(400, 300, 'PULSA PARA JUGAR', { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
    let txtControles = this.add.text(400, 500, 'Controles: Flechas para moverte', { fontSize: '18px', fill: '#ff0' }).setOrigin(0.5);

    // Metemos todo al contenedor
    contenedorMenu.add([titulo, btnJugar, txtJugar, txtControles]);

    // Evento del botón
    btnJugar.on('pointerdown', () => {
        contenedorMenu.destroy(); // <--- ESTO QUITA EL MENÚ
        this.physics.resume();    // <--- ESTO ACTIVA EL JUEGO
        gameOver = false
    });

    btnJugar.on('pointerover', () => btnJugar.setScale(1.1));
    btnJugar.on('pointerout', () => btnJugar.setScale(1));
    }

    // Controles para movil:
    // -----------------------------------------
    // --- CONTROLES PARA MÓVIL ---

    const { width, height } = this.scale;

    const esMovil = this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;

    if (esMovil) {
    // Colocamos el botón de salto en la derecha abajo
        this.btnUp = this.add.image(width - 80, height - 100, 'jump').setInteractive().setScrollFactor(0);
        
        // Colocamos las flechas en la izquierda abajo
        this.btnLeft = this.add.image(80, height - 100, 'left').setInteractive().setScrollFactor(0);
        this.btnRight = this.add.image(200, height - 100, 'right').setInteractive().setScrollFactor(0);

        // Escalamos los botones para que sean fáciles de pulsar (1.5 veces su tamaño)
        this.btnUp.setScale(1.5);
        this.btnLeft.setScale(1.5);
        this.btnRight.setScale(1.5);

    // 3. Quitamos las rotaciones innecesarias que pueden confundir (opcional)
    // Si tus imágenes ya son flechas apuntando al lado correcto, no necesitas setAngle.
    
    this.padControls = { up: false, left: false, right: false };

    // 4. Eventos de presionar
    this.btnUp.on('pointerdown', () => { this.padControls.up = true; this.btnUp.setAlpha(0.5); });
    this.btnLeft.on('pointerdown', () => { this.padControls.left = true; this.btnLeft.setAlpha(0.5); });
    this.btnRight.on('pointerdown', () => { this.padControls.right = true; this.btnRight.setAlpha(0.5); });

    // 5. Eventos de soltar (General para toda la pantalla)
    this.input.on('pointerup', () => {
        this.padControls.up = false;
        this.padControls.left = false;
        this.padControls.right = false;
        
        // Restauramos la opacidad
        this.btnUp.setAlpha(1);
        this.btnLeft.setAlpha(1);
        this.btnRight.setAlpha(1);
    });
} else {
    this.padControls = { up: false, left: false, right: false };
}
}

function update() {
    if (gameOver) {
        return
    }

    // --- LÓGICA DE MOVIMIENTO HORIZONTAL ---
    // Combinamos teclado (cursors) y móvil (padControls) con el operador OR (||)
    if (cursors.left.isDown || this.padControls.left) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } 
    else if (cursors.right.isDown || this.padControls.right) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('turn', true);
    }

    // --- LÓGICA DE SALTO ---
    // Saltamos si (tecla arriba O botón arriba móvil) Y además (está tocando el suelo)
    if ((cursors.up.isDown || this.padControls.up) && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true)

    score += 1
    scoreText.setText('Score: ' + score)
    sonidocoin.play({ volume: 0.3 });

    if(stars.countActive(true) === 0) {
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true)
        })
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        var bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    } 
    if (score >= 12 && score < 24) {
        this.fondo.setTint(0xe67e22); // Cambia a naranja
        if (score===12) {
            mostrarAviso("MUNDO DESIERTO X1", this);
        }
        
    } else if (score >= 24 && score < 36) {
        this.fondo.setTint(0x0000FF); // Cambia a Azul
        if (score===24) {
            mostrarAviso("MUNDO OCÉANICO X2", this);
        }
    } else if (score >= 36 && score < 48) {
        this.fondo.setTint(0xFFFF00); // Cambia a Amarillo (lava)
        if (score===36) {
            mostrarAviso("MUNDO LAVA X3", this);
        }
    } else if (score >= 48 && score < 60) {
        this.fondo.setTint(0x008f39); // Cambia a verde 
        if (score===48) {
            mostrarAviso("MUNDO BOSQUE X4", this);
        }
    } else if (score >= 60 && score < 72) {
        this.fondo.setTint(0xff70c6); // Cambia a rosa 
        if (score===60) {
            mostrarAviso("MUNDO MÁGICO X5", this);
        }
    } else if (score >= 72 && score < 84) {
        this.fondo.setTint(0xeecc77); // Cambia a galleta 
        if (score===72) {
            mostrarAviso("MUNDO GALLETA X6", this);
        }
    } else if (score >= 84 && score < 96) {
        this.fondo.setTint(0xC0C0C0); // Cambia a gris 
        if (score===84) {
            mostrarAviso("MUNDO ROCA X7", this);
        }
    } else if (score >= 96 && score < 108) {
        this.fondo.setTint(0x1FFFCB); // Cambia a azul claro
        if (score===96) {
            mostrarAviso("MUNDO TROPICAL X9", this);
        }
    } else if (score >= 108) {
        this.fondo.setTint(0xF1F5F9); // Cambia a blanco/gris
        if (score===96) {
            mostrarAviso("MUNDO INFINITO X10", this);
            mostrarAviso("Has llegado al limite de mundos disponibles", this);
        }
    }
    

}
function repetirpartida(escena) {
    let contenedorReinicio = escena.add.container(0, 0);

    // 2. Fondo oscuro para que se note que hemos perdido
    let fondoM = escena.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    // 3. Texto de GAME OVER
    let txtGameOver = escena.add.text(400, 200, '¡GAME OVER!', { 
        fontSize: '64px', 
        fill: '#ff0000',
        fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 4. BOTÓN DE REINTENTAR (TextButton)
    let btnReiniciar = escena.add.text(400, 400, ' REINTENTAR ', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#0000ff0c',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // --- EVENTOS DEL BOTÓN ---
    btnReiniciar.on('pointerover', () => btnReiniciar.setStyle({ backgroundColor: '#4444ff' }));
    btnReiniciar.on('pointerout', () => btnReiniciar.setStyle({ backgroundColor: '#0000ff' }));

    btnReiniciar.on('pointerdown', () => {
        // Reiniciamos las variables globales
        score = 0;
        gameOver = false;
        
        // Reiniciamos la escena completa
        escena.scene.restart();
        partidarepetida = true
    });

    // 5. Añadimos todo al contenedor
    contenedorReinicio.add([fondoM, txtGameOver, btnReiniciar]);
}

function hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)

    player.anims.play('turn')
    gameOver = true
    repetirpartida(this)


}

function mostrarAviso(mensaje, escena) {
    worldText.setText(mensaje);
    worldText.setAlpha(1); // Lo hacemos visible
    
    // Después de 2000ms (2 segundos), el texto desaparece
    escena.time.delayedCall(1000, () => {
        worldText.setAlpha(0);
    });
}