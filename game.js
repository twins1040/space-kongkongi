// Boot: 설정 초기화 후 Load 씬으로 전환
class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        this.scene.start('Load');
    }
}

// Load: 에셋 로드 + 로딩 바
class LoadScene extends Phaser.Scene {
    constructor() {
        super('Load');
    }

    preload() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // 로딩 바
        const barW = 300;
        const barH = 24;
        const border = this.add.rectangle(cx, cy, barW, barH).setStrokeStyle(2, 0xffffff);
        const fill = this.add.rectangle(cx - barW / 2 + 2, cy, 0, barH - 4, 0x44ff44).setOrigin(0, 0.5);

        this.load.on('progress', (v) => {
            fill.width = (barW - 4) * v;
        });

        // 아틀라스
        this.load.atlasXML('characters', 'assets/Spritesheets/spritesheet-characters-default.png', 'assets/Spritesheets/spritesheet-characters-default.xml');
        this.load.atlasXML('enemies', 'assets/Spritesheets/spritesheet-enemies-default.png', 'assets/Spritesheets/spritesheet-enemies-default.xml');
        this.load.atlasXML('tiles', 'assets/Spritesheets/spritesheet-tiles-default.png', 'assets/Spritesheets/spritesheet-tiles-default.xml');
        this.load.atlasXML('backgrounds', 'assets/Spritesheets/spritesheet-backgrounds-default.png', 'assets/Spritesheets/spritesheet-backgrounds-default.xml');

        // 사운드
        this.load.audio('sfx_bump', 'assets/Sounds/sfx_bump.ogg');
        this.load.audio('sfx_coin', 'assets/Sounds/sfx_coin.ogg');
        this.load.audio('sfx_disappear', 'assets/Sounds/sfx_disappear.ogg');
        this.load.audio('sfx_gem', 'assets/Sounds/sfx_gem.ogg');
        this.load.audio('sfx_hurt', 'assets/Sounds/sfx_hurt.ogg');
        this.load.audio('sfx_jump', 'assets/Sounds/sfx_jump.ogg');
        this.load.audio('sfx_jump_high', 'assets/Sounds/sfx_jump-high.ogg');
        this.load.audio('sfx_magic', 'assets/Sounds/sfx_magic.ogg');
        this.load.audio('sfx_select', 'assets/Sounds/sfx_select.ogg');
        this.load.audio('sfx_throw', 'assets/Sounds/sfx_throw.ogg');
    }

    create() {
        this.scene.start('Menu');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const w = 480;
        const h = 720;

        // 배경 (GameScene과 동일)
        this.add.tileSprite(0, 0, w, h, 'backgrounds', 'background_solid_sky').setOrigin(0);
        this.add.tileSprite(0, 300, w, h - 300, 'backgrounds', 'background_fade_hills').setOrigin(0).setAlpha(0.5);
        this.add.tileSprite(0, 500, w, h - 500, 'backgrounds', 'background_color_hills').setOrigin(0).setAlpha(0.7);

        // 바닥 (GameScene과 동일)
        for (let x = 0; x < w; x += 64) {
            this.add.image(x + 32, h - 32, 'tiles', 'terrain_grass_block_top');
        }

        // 플랫폼 장식 (GameScene과 동일 위치)
        this.createDecorationPlatform(160, 490);
        this.createDecorationPlatform(320, 310);
        this.createDecorationPlatform(160, 140);

        // 장식용 캐릭터
        this.add.sprite(w / 2, h - 96, 'characters', 'character_beige_idle');

        // 타이틀
        this.add.text(w / 2, 200, 'BUBBLE JUMP', {
            fontSize: '36px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // "TAP TO START" 깜빡임
        const tapText = this.add.text(w / 2, 300, 'TAP TO START', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: tapText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // 최고 점수
        const best = localStorage.getItem('bubbleJump_highScore') || 0;
        this.add.text(w / 2, 360, 'BEST: ' + Number(best).toLocaleString(), {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 입력 대기
        this.input.once('pointerdown', () => this.startGame());
        this.input.keyboard.once('keydown', () => this.startGame());
    }

    createDecorationPlatform(cx, y) {
        this.add.image(cx - 64, y, 'tiles', 'terrain_grass_horizontal_left');
        this.add.image(cx, y, 'tiles', 'terrain_grass_horizontal_middle');
        this.add.image(cx + 64, y, 'tiles', 'terrain_grass_horizontal_right');
    }

    startGame() {
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
        this.sound.play('sfx_select');
        this.scene.start('Game');
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        const w = 480;
        const h = 720;

        // 배경
        this.add.tileSprite(0, 0, w, h, 'backgrounds', 'background_solid_sky').setOrigin(0);
        this.add.tileSprite(0, 300, w, h - 300, 'backgrounds', 'background_fade_hills').setOrigin(0).setAlpha(0.5);
        this.add.tileSprite(0, 500, w, h - 500, 'backgrounds', 'background_color_hills').setOrigin(0).setAlpha(0.7);

        // 바닥 (static group)
        this.ground = this.physics.add.staticGroup();
        for (let x = 0; x < w; x += 64) {
            this.ground.create(x + 32, h - 32, 'tiles', 'terrain_grass_block_top');
        }

        // 플랫폼 (one-way)
        this.platforms = this.physics.add.staticGroup();
        this.createPlatform(160, 490);
        this.createPlatform(320, 310);
        this.createPlatform(160, 140);

        // 플레이어
        this.player = this.physics.add.sprite(240, 500, 'characters', 'character_beige_idle');
        this.player.body.setSize(80, 100);
        this.player.body.setOffset(24, 28);
        this.player.setMaxVelocity(300, 700);

        // 애니메이션
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'characters', frame: 'character_beige_walk_a' },
                { key: 'characters', frame: 'character_beige_walk_b' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // 충돌
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);

        // 키보드
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    createPlatform(cx, y) {
        const left = this.platforms.create(cx - 64, y, 'tiles', 'terrain_grass_horizontal_left');
        const mid = this.platforms.create(cx, y, 'tiles', 'terrain_grass_horizontal_middle');
        const right = this.platforms.create(cx + 64, y, 'tiles', 'terrain_grass_horizontal_right');
        [left, mid, right].forEach(tile => {
            tile.body.checkCollision.down = false;
            tile.body.checkCollision.left = false;
            tile.body.checkCollision.right = false;
        });
    }

    update() {
        const player = this.player;
        const onFloor = player.body.blocked.down || player.body.touching.down;

        // 이동
        const leftDown = this.cursors.left.isDown || this.wasd.left.isDown;
        const rightDown = this.cursors.right.isDown || this.wasd.right.isDown;
        const jumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                         Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                         Phaser.Input.Keyboard.JustDown(this.wasd.space);

        if (leftDown) {
            player.setVelocityX(-200);
            player.setFlipX(true);
        } else if (rightDown) {
            player.setVelocityX(200);
            player.setFlipX(false);
        } else {
            player.setVelocityX(0);
        }

        // 점프
        if (jumpDown && onFloor) {
            player.setVelocityY(-620);
        }

        // 애니메이션
        if (!onFloor) {
            if (player.body.velocity.y < 0) {
                player.anims.stop();
                player.setFrame('character_beige_jump');
            } else {
                player.anims.stop();
                player.setFrame('character_beige_front');
            }
        } else if (player.body.velocity.x !== 0) {
            player.anims.play('walk', true);
        } else {
            player.anims.stop();
            player.setFrame('character_beige_idle');
        }
    }
}

// Phaser 설정
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 720,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [BootScene, LoadScene, MenuScene, GameScene],
    backgroundColor: '#4488FF'
};

const game = new Phaser.Game(config);
