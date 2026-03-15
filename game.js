import Phaser from 'phaser';


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
        this.load.atlasXML('characters', 'assets/Spritesheets/spritesheet-characters-double.png', 'assets/Spritesheets/spritesheet-characters-double.xml');
        this.load.atlasXML('enemies', 'assets/Spritesheets/spritesheet-enemies-double.png', 'assets/Spritesheets/spritesheet-enemies-double.xml');
        this.load.atlasXML('tiles', 'assets/Spritesheets/spritesheet-tiles-double.png', 'assets/Spritesheets/spritesheet-tiles-double.xml');
        this.load.atlasXML('backgrounds', 'assets/Spritesheets/spritesheet-backgrounds-double.png', 'assets/Spritesheets/spritesheet-backgrounds-double.xml');

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
            this.add.image(x + 32, h - 32, 'tiles', 'terrain_grass_block_top').setScale(0.5);
        }

        // 장식용 캐릭터
        this.add.sprite(w / 2, h - 128, 'characters', 'character_beige_idle').setScale(0.5);

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
            const tile = this.ground.create(x + 32, h - 32, 'tiles', 'terrain_grass_block_top');
            tile.setScale(0.5).refreshBody();
        }

        // 플랫폼 (one-way)
        this.platforms = this.physics.add.staticGroup();
        this.createPlatform(160, 490);
        this.createPlatform(320, 310);
        this.createPlatform(160, 140);

        // 플레이어
        this.player = this.physics.add.sprite(240, 500, 'characters', 'character_beige_idle');
        this.player.setScale(0.5);
        this.player.body.setSize(160, 200);
        this.player.body.setOffset(48, 56);
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

        // 터치 조작
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;

        const btnAlpha = 0.7;
        const btnAlphaActive = 0.9;
        const btnY = 668;
        const btnR = 32;

        this.btnLeft = this.add.circle(48, btnY, btnR, 0xffffff, btnAlpha).setDepth(100);
        this.btnRight = this.add.circle(128, btnY, btnR, 0xffffff, btnAlpha).setDepth(100);
        this.btnJump = this.add.circle(432, btnY, btnR, 0xffffff, btnAlpha).setDepth(100);

        this.add.text(48, btnY, '◀', { fontSize: '20px', color: '#000' }).setOrigin(0.5).setAlpha(0.5).setDepth(101);
        this.add.text(128, btnY, '▶', { fontSize: '20px', color: '#000' }).setOrigin(0.5).setAlpha(0.5).setDepth(101);
        this.add.text(432, btnY, '▲', { fontSize: '20px', color: '#000' }).setOrigin(0.5).setAlpha(0.5).setDepth(101);

        this.touchBtnAlpha = btnAlpha;
        this.touchBtnAlphaActive = btnAlphaActive;

        // 적 그룹
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.enemies, this.platforms);

        // 플레이어 ↔ 적 overlap
        this.physics.add.overlap(this.player, this.enemies, this.handleEnemyContact, null, this);

        // 적 애니메이션
        this.anims.create({
            key: 'slime_walk',
            frames: [
                { key: 'enemies', frame: 'slime_normal_walk_a' },
                { key: 'enemies', frame: 'slime_normal_walk_b' }
            ],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'worm_walk',
            frames: [
                { key: 'enemies', frame: 'worm_normal_move_a' },
                { key: 'enemies', frame: 'worm_normal_move_b' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // 피격 상태
        this.hp = 3;
        this.isInvincible = false;

        // 테스트용 적 스폰
        this.spawnEnemy('slime', -32, 640, 1);
        this.spawnEnemy('worm', 512, 640, -1);
        this.spawnEnemy('slime', 512, 460, -1);
    }

    spawnEnemy(type, x, y, dir) {
        const configs = {
            slime: { anim: 'slime_walk', frame: 'slime_normal_walk_a', speed: 60, bodyW: 80, bodyH: 56, offX: 24, offY: 40, score: 100 },
            worm: { anim: 'worm_walk', frame: 'worm_normal_move_a', speed: 40, bodyW: 80, bodyH: 50, offX: 24, offY: 46, score: 50 }
        };
        const cfg = configs[type];
        const enemy = this.enemies.create(x, y, 'enemies', cfg.frame);
        enemy.setScale(0.5);
        enemy.body.setSize(cfg.bodyW, cfg.bodyH);
        enemy.body.setOffset(cfg.offX, cfg.offY);
        enemy.setVelocityX(cfg.speed * dir);
        enemy.setFlipX(dir > 0);
        enemy.anims.play(cfg.anim, true);
        enemy.body.setBounceX(0);
        enemy.enemyType = type;
        enemy.enemySpeed = cfg.speed;
        enemy.enemyDir = dir;
        enemy.enemyScore = cfg.score;
        return enemy;
    }

    handleEnemyContact(player, enemy) {
        if (enemy.isDying) return;

        // 밟기 판정: 플레이어가 낙하 중이고 플레이어 하단이 적 상단 근처
        const playerBottom = player.body.bottom;
        const enemyTop = enemy.body.top;
        if (player.body.velocity.y > 0 && playerBottom < enemyTop + 16) {
            this.killEnemy(enemy);
            player.setVelocityY(-350);
            this.sound.play('sfx_jump_high');
        } else {
            this.hitPlayer(player, enemy);
        }
    }

    killEnemy(enemy) {
        enemy.isDying = true;
        enemy.body.enable = false;
        enemy.anims.stop();
        const restFrames = { slime: 'slime_normal_rest', worm: 'worm_normal_rest' };
        enemy.setFrame(restFrames[enemy.enemyType]);

        // 점수 팝업
        const scoreTxt = this.add.text(enemy.x, enemy.y - 20, '+' + enemy.enemyScore, {
            fontSize: '16px', fontFamily: 'Arial', color: '#ffff00',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: scoreTxt,
            y: scoreTxt.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => scoreTxt.destroy()
        });

        this.tweens.add({
            targets: enemy,
            y: enemy.y + 30,
            alpha: 0,
            duration: 300,
            onComplete: () => enemy.destroy()
        });

        this.sound.play('sfx_disappear');
    }

    hitPlayer(player, enemy) {
        if (this.isInvincible) return;

        this.hp--;
        this.isInvincible = true;
        this.sound.play('sfx_hurt');

        // 넉백
        const knockDir = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(150 * knockDir);
        player.setVelocityY(-250);

        // 피격 애니메이션
        player.anims.stop();
        player.setFrame('character_beige_hit');

        // 깜빡임
        const blink = this.time.addEvent({
            delay: 100,
            repeat: 14,
            callback: () => {
                player.setAlpha(player.alpha === 1 ? 0.3 : 1);
            }
        });

        this.time.delayedCall(1500, () => {
            this.isInvincible = false;
            player.setAlpha(1);
        });

        if (this.hp <= 0) {
            // 게임오버 (단계 11에서 구현)
        }
    }

    createPlatform(cx, y) {
        const left = this.platforms.create(cx - 64, y, 'tiles', 'terrain_grass_horizontal_left');
        const mid = this.platforms.create(cx, y, 'tiles', 'terrain_grass_horizontal_middle');
        const right = this.platforms.create(cx + 64, y, 'tiles', 'terrain_grass_horizontal_right');
        [left, mid, right].forEach(tile => {
            tile.setScale(0.5).refreshBody();
            tile.body.checkCollision.down = false;
            tile.body.checkCollision.left = false;
            tile.body.checkCollision.right = false;
        });
    }

    update() {
        const player = this.player;
        const onFloor = player.body.blocked.down || player.body.touching.down;

        // 터치 입력: 모든 포인터를 순회하여 영역 판정
        this.touchLeft = false;
        this.touchRight = false;
        let newTouchJump = false;
        const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3];
        for (const p of pointers) {
            if (!p || !p.isDown) continue;
            const px = p.x;
            const py = p.y;
            if (py > 620) {
                if (px < 90) this.touchLeft = true;
                else if (px < 170) this.touchRight = true;
                else if (px > 380) newTouchJump = true;
            }
        }
        if (newTouchJump && !this._prevTouchJump) this.touchJump = true;
        this._prevTouchJump = newTouchJump;

        // 버튼 비주얼
        this.btnLeft.setAlpha(this.touchLeft ? this.touchBtnAlphaActive : this.touchBtnAlpha);
        this.btnRight.setAlpha(this.touchRight ? this.touchBtnAlphaActive : this.touchBtnAlpha);
        this.btnJump.setAlpha(newTouchJump ? this.touchBtnAlphaActive : this.touchBtnAlpha);

        // 이동
        const leftDown = this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft;
        const rightDown = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;
        const jumpDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                         Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                         Phaser.Input.Keyboard.JustDown(this.wasd.space) ||
                         this.touchJump;

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
            this.touchJump = false;
            this.sound.play('sfx_jump');
        }

        // Wrap-around (플레이어)
        if (player.x < -32) player.x = 512;
        else if (player.x > 512) player.x = -32;

        // 적 업데이트
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isDying) return;
            // Wrap-around
            if (enemy.x < -32) enemy.x = 512;
            else if (enemy.x > 512) enemy.x = -32;
            // 플랫폼/바닥 가장자리에서 반전
            if (enemy.body.blocked.right || enemy.body.touching.right) {
                enemy.enemyDir = -1;
                enemy.setVelocityX(-enemy.enemySpeed);
                enemy.setFlipX(false);
            } else if (enemy.body.blocked.left || enemy.body.touching.left) {
                enemy.enemyDir = 1;
                enemy.setVelocityX(enemy.enemySpeed);
                enemy.setFlipX(true);
            }
        });

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
    input: {
        activePointers: 3
    },
    scene: [BootScene, LoadScene, MenuScene, GameScene],
    backgroundColor: '#4488FF'
};

const game = new Phaser.Game(config);
