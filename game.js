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
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // 3레이어 배경
        this.add.tileSprite(0, 0, w, h, 'backgrounds', 'background_solid_sky').setOrigin(0);
        this.add.tileSprite(0, 300, w, h - 300, 'backgrounds', 'background_fade_hills').setOrigin(0).setAlpha(0.5);
        this.add.tileSprite(0, 500, w, h - 500, 'backgrounds', 'background_color_hills').setOrigin(0).setAlpha(0.7);

        // 바닥 장식
        for (let x = 0; x < w; x += 64) {
            this.add.image(x + 32, h - 32, 'tiles', 'terrain_grass_block_top').setScale(1);
        }

        // 타이틀
        this.add.text(w / 2, 200, 'BUBBLE JUMP', {
            fontSize: '36px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 장식용 캐릭터
        const char = this.add.sprite(w / 2, h - 100, 'characters', 'character_beige_idle').setScale(0.5);

        // "TAP TO START" 깜빡임
        const tapText = this.add.text(w / 2, 420, 'TAP TO START', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
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
        this.add.text(w / 2, 480, 'BEST: ' + Number(best).toLocaleString(), {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 입력 대기
        this.input.once('pointerdown', () => this.startGame());
        this.input.keyboard.once('keydown', () => this.startGame());
    }

    startGame() {
        this.sound.play('sfx_select');
        this.scene.start('Game');
    }
}

// Game: 메인 게임 (단계 3에서 구현)
class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
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
    pixelArt: true,
    backgroundColor: '#4488FF'
};

const game = new Phaser.Game(config);
