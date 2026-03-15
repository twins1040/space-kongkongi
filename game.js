import Phaser from 'phaser';

const T = 64;        // PPU: 1타일 = 64px
const W = T * 7.5;   // 480
const H = T * 11.25; // 720

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
        // 배경 (4T × 4T 타일 배치)
        const bgT = T * 4;
        const fades = ['background_fade_hills', 'background_fade_trees', 'background_fade_mushrooms', 'background_fade_desert'];
        for (let bx = 0, i = 0; bx < W; bx += bgT, i++) {
            this.add.image(bx + bgT / 2, bgT / 2, 'backgrounds', 'background_solid_sky').setScale(0.5);
            this.add.image(bx + bgT / 2, bgT + bgT / 2, 'backgrounds', 'background_clouds').setScale(0.5);
            this.add.image(bx + bgT / 2, H - bgT / 2, 'backgrounds', fades[i % fades.length]).setScale(0.5);
        }

        // 바닥
        for (let x = 0; x < W; x += T) {
            this.add.image(x + T / 2, H - T / 2, 'tiles', 'terrain_grass_block_top').setScale(0.5);
        }

        // 장식용 환경
        this.add.image(T * 1.5, H - T * 1.5, 'tiles', 'bush').setScale(0.5);
        this.add.image(W - T * 1.5, H - T * 1.5, 'tiles', 'bush').setScale(0.5);
        this.add.image(T * 5, H - T * 1.5, 'tiles', 'mushroom_red').setScale(0.5);

        // 장식용 캐릭터 (점프 애니메이션)
        const char = this.add.sprite(W / 2, H - T * 2, 'characters', 'character_beige_idle').setScale(0.5);
        this.tweens.add({
            targets: char,
            y: H - T * 3,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeOut',
            onYoyo: () => char.setFrame('character_beige_front'),
            onRepeat: () => char.setFrame('character_beige_jump')
        });

        // 장식용 코인/별
        const star = this.add.image(W - T * 1.5, T * 2.5, 'tiles', 'star').setScale(0.5);
        this.tweens.add({ targets: star, angle: 360, duration: 3000, repeat: -1 });
        const coin = this.add.image(T * 1.5, T * 2.5, 'tiles', 'coin_gold').setScale(0.5);
        this.tweens.add({ targets: coin, angle: -360, duration: 2500, repeat: -1 });

        const dpr = window.devicePixelRatio;

        // 타이틀 (바운스 애니메이션)
        const title = this.add.text(W / 2, T * 3, '우주에서온\n콩콩이', {
            fontSize: '44px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffe844',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            resolution: dpr
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // "TAP TO START" 깜빡임
        const tapText = this.add.text(W / 2, T * 5.5, 'TAP TO START', {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            resolution: dpr
        }).setOrigin(0.5);

        this.tweens.add({
            targets: tapText,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // 최고 점수
        const best = localStorage.getItem('bubbleJump_highScore') || 0;
        this.add.text(W / 2, T * 7, 'BEST: ' + Number(best).toLocaleString(), {
            fontSize: '24px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            resolution: dpr
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
        // 그리드: row(0)=688(바닥), row(1)=624, row(3)=496, row(6)=304, row(9)=112
        const row = (r) => H - T / 2 - r * T;

        // 배경 (4T × 4T 타일 배치)
        const bgT = T * 4;
        const fades = ['background_fade_hills', 'background_fade_trees', 'background_fade_mushrooms', 'background_fade_desert'];
        for (let bx = 0, i = 0; bx < W; bx += bgT, i++) {
            this.add.image(bx + bgT / 2, bgT / 2, 'backgrounds', 'background_solid_sky').setScale(0.5);
            this.add.image(bx + bgT / 2, bgT + bgT / 2, 'backgrounds', 'background_clouds').setScale(0.5);
            this.add.image(bx + bgT / 2, H - bgT / 2, 'backgrounds', fades[i % fades.length]).setScale(0.5);
        }

        // 바닥 (wrap-around 영역까지 확장)
        this.ground = this.physics.add.staticGroup();
        for (let x = -T * 2; x < W + T * 2; x += T) {
            const tile = this.ground.create(x + T / 2, row(0), 'tiles', 'terrain_grass_block_top');
            tile.setScale(0.5).refreshBody();
        }

        // 플랫폼 (one-way) — 그리드에 스냅
        this.platforms = this.physics.add.staticGroup();
        this.platformDefs = [
            { cx: T * 2.5, y: row(3) },
            { cx: T * 5,   y: row(6) },
            { cx: T * 2.5, y: row(9) },
        ];
        this.createPlatform(this.platformDefs[0].cx, this.platformDefs[0].y);
        this.createPlatform(this.platformDefs[2].cx, this.platformDefs[2].y);

        // 중간 블록열: bricks + item box + bricks (row 6)
        const midY = row(6);
        const midCx = T * 5;
        const brickL = this.physics.add.staticImage(midCx - T, midY, 'tiles', 'bricks_brown').setScale(0.5).refreshBody();
        const brickR = this.physics.add.staticImage(midCx + T, midY, 'tiles', 'bricks_brown').setScale(0.5).refreshBody();
        this.bricks = [brickL, brickR];
        // 플레이어 — 바닥 위 중앙
        this.player = this.physics.add.sprite(W / 2, row(2), 'characters', 'character_beige_idle');
        this.player.setScale(0.5);
        this.player.body.setSize(128, 200);
        this.player.body.setOffset(64, 56);
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
        this.bricks.forEach(b => this.physics.add.collider(this.player, b));

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

        // HUD
        this.score = 0;

        // 체력 하트
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(36 + i * 40, 24, 'tiles', 'hud_heart').setScale(0.5).setDepth(200).setScrollFactor(0);
            this.hearts.push(heart);
        }

        // 웨이브 표시
        this.waveText = this.add.text(W / 2, 24, 'WAVE 1', {
            fontSize: '32px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        // 점수 표시
        this.scoreIcon = this.add.image(448, 24, 'tiles', 'hud_coin').setScale(0.5).setDepth(200).setScrollFactor(0);
        this.scoreText = this.add.text(420, 24, '0', {
            fontSize: '32px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
        }).setOrigin(1, 0.5).setDepth(200).setScrollFactor(0);

        // 적 그룹
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.enemies, this.platforms);
        this.bricks.forEach(b => this.physics.add.collider(this.enemies, b));

        // 플레이어 ↔ 적 overlap
        this.physics.add.overlap(this.player, this.enemies, this.handleEnemyContact, null, this);

        // 적 애니메이션
        const animDefs = [
            { key: 'slime_walk', atlas: 'enemies', frames: ['slime_normal_walk_a', 'slime_normal_walk_b'], fps: 8 },
            { key: 'worm_walk', atlas: 'enemies', frames: ['worm_normal_move_a', 'worm_normal_move_b'], fps: 8 },
            { key: 'mouse_walk', atlas: 'enemies', frames: ['mouse_walk_a', 'mouse_walk_b'], fps: 10 },
            { key: 'ladybug_walk', atlas: 'enemies', frames: ['ladybug_walk_a', 'ladybug_walk_b'], fps: 8 },
            { key: 'snail_walk', atlas: 'enemies', frames: ['snail_walk_a', 'snail_walk_b'], fps: 6 },
            { key: 'bee_fly', atlas: 'enemies', frames: ['bee_a', 'bee_b'], fps: 10 },
            { key: 'fly_fly', atlas: 'enemies', frames: ['fly_a', 'fly_b'], fps: 10 },
            { key: 'saw_spin', atlas: 'enemies', frames: ['saw_a', 'saw_b'], fps: 12 },
            { key: 'slime_spike_walk', atlas: 'enemies', frames: ['slime_spike_walk_a', 'slime_spike_walk_b'], fps: 8 },
        ];
        animDefs.forEach(def => {
            this.anims.create({
                key: def.key,
                frames: def.frames.map(f => ({ key: def.atlas, frame: f })),
                frameRate: def.fps,
                repeat: -1
            });
        });

        // 게임 상태
        this.hp = 3;
        this.isInvincible = false;
        this.isGameOver = false;

        // 콤보
        this.combo = 0;
        this.comboText = this.add.text(W / 2, 80, '', {
            fontSize: '40px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200).setAlpha(0);

        // 아이템 블록 — 중간 블록열 중앙
        this.itemBlock = this.physics.add.staticImage(midCx, midY, 'tiles', 'block_exclamation_active').setScale(0.5);
        this.itemBlock.refreshBody();
        this.itemBlockActive = true;
        this.physics.add.collider(this.player, this.itemBlock, this.hitItemBlock, null, this);

        // 아이템 그룹
        this.items = this.physics.add.group();
        this.physics.add.collider(this.items, this.ground);
        this.physics.add.collider(this.items, this.platforms);
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // 파워업 상태
        this.starActive = false;
        this.springActive = false;

        // 웨이브 시스템
        this.waveNum = 1;
        this.waveEnemies = [];
        this.waveSpawnIndex = 0;
        this.waveSpawnTimer = null;
        this.waveKills = 0;
        this.waveTotalEnemies = 0;
        this.waveDamageTaken = false;
        this.startWave(1);
    }

    getWaveConfig(wave) {
        const waves = [
            null,
            { enemies: ['worm','worm','worm','slime','slime'], interval: 2000 },
            { enemies: ['slime','slime','slime','worm','worm','ladybug'], interval: 1800 },
            { enemies: ['slime','slime','ladybug','ladybug','bee','bee','snail'], interval: 1600 },
            { enemies: ['mouse','mouse','bee','bee','fly','fly','slime','slime'], interval: 1500 },
            { enemies: ['mouse','mouse','fly','fly','saw','slime','slime','bee','bee'], interval: 1300 },
            { enemies: ['slime_spike','slime_spike','saw','mouse','mouse','bee','bee','bee','fly','fly'], interval: 1200 },
        ];
        if (wave <= 6) return { ...waves[wave], speedMult: wave <= 3 ? 1.0 : 1.0 + (wave - 3) * 0.1 };

        // 웨이브 7+: 전 종류 랜덤
        const pool = ['slime','worm','mouse','ladybug','snail','bee','fly'];
        const hazards = ['saw','slime_spike'];
        const count = 10 + (wave - 7);
        const enemies = [];
        for (let i = 0; i < count; i++) enemies.push(pool[Math.floor(Math.random() * pool.length)]);
        // 위험 적 최대 2마리
        const hazardCount = Math.min(2, Math.floor((wave - 5) / 2));
        for (let i = 0; i < hazardCount; i++) enemies.push(hazards[i % 2]);
        return { enemies, interval: 1000, speedMult: Math.min(2.0, 1.0 + (wave - 1) * 0.05) };
    }

    startWave(wave) {
        this.waveNum = wave;
        this.waveText.setText('WAVE ' + wave);
        this.waveDamageTaken = false;
        // 아이템 블록 리셋
        this.itemBlockActive = true;
        this.itemBlock.setFrame('block_exclamation_active');

        const cfg = this.getWaveConfig(wave);
        this.waveEnemies = [...cfg.enemies];
        this.waveSpawnIndex = 0;
        this.waveKills = 0;
        this.waveTotalEnemies = this.waveEnemies.length;
        this.waveSpeedMult = cfg.speedMult;

        // 순차 스폰
        this.waveSpawnTimer = this.time.addEvent({
            delay: cfg.interval,
            repeat: this.waveTotalEnemies - 1,
            callback: () => this.spawnWaveEnemy()
        });
        // 첫 적 즉시 스폰
        this.spawnWaveEnemy();
    }

    spawnWaveEnemy() {
        if (this.waveSpawnIndex >= this.waveEnemies.length) return;
        const type = this.waveEnemies[this.waveSpawnIndex++];
        const dir = Math.random() < 0.5 ? 1 : -1;
        const startX = dir === 1 ? -T / 2 : W + T / 2;

        const groundTypes = ['slime','worm','mouse','ladybug','snail','slime_spike'];
        const airTypes = ['bee','fly'];
        const platformTypes = ['saw'];

        if (airTypes.includes(type)) {
            const y = 100 + Math.random() * 300;
            const enemy = this.spawnEnemy(type, startX, y, dir);
            enemy.enemySpeed *= this.waveSpeedMult;
            enemy.setVelocityX(enemy.enemySpeed * dir);
        } else if (platformTypes.includes(type)) {
            const plat = this.platformDefs[Math.floor(Math.random() * this.platformDefs.length)];
            const enemy = this.spawnEnemyOnPlatform(type, plat.cx, plat.y, dir);
            enemy.enemySpeed *= this.waveSpeedMult;
            enemy.setVelocityX(enemy.enemySpeed * enemy.enemyDir);
        } else {
            const enemy = this.spawnEnemy(type, startX, H - T * 1.5, dir);
            enemy.enemySpeed *= this.waveSpeedMult;
            enemy.setVelocityX(enemy.enemySpeed * dir);
        }
    }

    hitItemBlock(player, block) {
        if (!this.itemBlockActive) return;
        // 아래에서 머리로 쳤을 때만: 플레이어가 상승 중이고 블록 아래에 위치
        if (player.body.velocity.y >= 0 || player.y >= block.y) return;

        this.itemBlockActive = false;
        this.itemBlock.setFrame('block_exclamation');
        this.sound.play('sfx_bump');

        // 블록 바운스 연출
        this.tweens.add({
            targets: this.itemBlock,
            y: this.itemBlock.y - 8,
            duration: 80,
            yoyo: true
        });

        // 아이템 출현
        const roll = Math.random();
        let itemType;
        if (roll < 0.50) itemType = 'coin';
        else if (roll < 0.70) itemType = 'heart';
        else if (roll < 0.85) itemType = 'star';
        else itemType = 'spring';

        const frames = { coin: 'coin_gold', heart: 'heart', star: 'star', spring: 'spring' };
        const item = this.items.create(this.itemBlock.x, this.itemBlock.y - T, 'tiles', frames[itemType]);
        item.setScale(0.5);
        item.itemType = itemType;
        item.setVelocityY(-200);
        item.body.setAllowGravity(true);
        item.setBounce(0.3);

        // 8초 후 소멸 (6초부터 깜빡임)
        this.time.delayedCall(6000, () => {
            if (!item.active) return;
            this.tweens.add({
                targets: item,
                alpha: 0.2,
                duration: 200,
                yoyo: true,
                repeat: 4,
                onComplete: () => { if (item.active) item.destroy(); }
            });
        });
    }

    collectItem(player, item) {
        const type = item.itemType;
        item.destroy();

        if (type === 'coin') {
            this.addScore(500);
            this.sound.play('sfx_coin');
        } else if (type === 'heart') {
            if (this.hp < 3) this.hp++;
            this.updateHearts();
            this.sound.play('sfx_coin');
        } else if (type === 'star') {
            this.sound.play('sfx_magic');
            this.activateStar();
        } else if (type === 'spring') {
            this.sound.play('sfx_magic');
            this.springActive = true;
            // 시각적 표시
            const springTxt = this.add.text(W / 2, 120, 'SPRING!', {
                fontSize: '24px', fontFamily: 'Arial Black, Arial', color: '#00ffff',
                stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(200);
            this.tweens.add({ targets: springTxt, alpha: 0, delay: 1000, duration: 300, onComplete: () => springTxt.destroy() });
        }
    }

    activateStar() {
        this.starActive = true;
        this.isInvincible = true;

        // 깜빡임 효과
        const blink = this.time.addEvent({
            delay: 100,
            repeat: 49,
            callback: () => {
                this.player.setAlpha(this.player.alpha === 1 ? 0.5 : 1);
            }
        });

        this.time.delayedCall(5000, () => {
            this.starActive = false;
            this.isInvincible = false;
            this.player.setAlpha(1);
        });
    }

    checkWaveClear() {
        // 스폰 완료 확인
        if (this.waveSpawnIndex < this.waveTotalEnemies) return;
        // 처치 가능한 적이 남아있는지 확인
        const alive = this.enemies.getChildren().filter(e => !e.isDying && !e.unstompable);
        if (alive.length > 0) return;

        // 밟기 불가 적 제거
        this.enemies.getChildren().filter(e => !e.isDying && e.unstompable).forEach(e => {
            e.isDying = true;
            e.body.enable = false;
            this.tweens.add({ targets: e, alpha: 0, duration: 500, onComplete: () => e.destroy() });
        });

        // 웨이브 클리어
        const bonus = this.waveNum * 300;
        const noDmgBonus = this.waveDamageTaken ? 0 : 500;
        this.addScore(bonus + noDmgBonus);

        const clearText = this.add.text(W / 2, 300, 'WAVE ' + this.waveNum + ' CLEAR!', {
            fontSize: '36px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);

        if (noDmgBonus > 0) {
            const perfectText = this.add.text(W / 2, 350, 'NO DAMAGE +500', {
                fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#00ff00',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(200);
            this.tweens.add({ targets: perfectText, alpha: 0, delay: 1200, duration: 300, onComplete: () => perfectText.destroy() });
        }

        this.tweens.add({
            targets: clearText,
            alpha: 0,
            delay: 1200,
            duration: 300,
            onComplete: () => {
                clearText.destroy();
                this.startWave(this.waveNum + 1);
            }
        });
    }

    addScore(amount) {
        this.score += amount;
        this.scoreText.setText(this.score.toLocaleString());
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });
    }

    updateHearts() {
        for (let i = 0; i < 3; i++) {
            this.hearts[i].setFrame(i < this.hp ? 'hud_heart' : 'hud_heart_empty');
        }
    }

    spawnEnemy(type, x, y, dir) {
        const configs = {
            slime:       { anim: 'slime_walk',       frame: 'slime_normal_walk_a',  speed: 60,  bodyW: 80, bodyH: 56, offX: 24, offY: 72,  score: 100, ground: true },
            worm:        { anim: 'worm_walk',        frame: 'worm_normal_move_a',   speed: 40,  bodyW: 80, bodyH: 50, offX: 24, offY: 78,  score: 50,  ground: true },
            mouse:       { anim: 'mouse_walk',       frame: 'mouse_walk_a',         speed: 120, bodyW: 88, bodyH: 56, offX: 20, offY: 72,  score: 150, ground: true },
            ladybug:     { anim: 'ladybug_walk',     frame: 'ladybug_walk_a',       speed: 80,  bodyW: 80, bodyH: 56, offX: 24, offY: 72,  score: 100, ground: true },
            snail:       { anim: 'snail_walk',       frame: 'snail_walk_a',         speed: 30,  bodyW: 88, bodyH: 56, offX: 20, offY: 72,  score: 50,  ground: true },
            bee:         { anim: 'bee_fly',           frame: 'bee_a',               speed: 70,  bodyW: 64, bodyH: 64, offX: 32, offY: 32,  score: 200, ground: false },
            fly:         { anim: 'fly_fly',           frame: 'fly_a',               speed: 100, bodyW: 64, bodyH: 56, offX: 32, offY: 36,  score: 150, ground: false },
            saw:         { anim: 'saw_spin',          frame: 'saw_a',               speed: 50,  bodyW: 80, bodyH: 80, offX: 24, offY: 48,  score: 0,   ground: true, unstompable: true },
            slime_spike: { anim: 'slime_spike_walk',  frame: 'slime_spike_walk_a',  speed: 50,  bodyW: 80, bodyH: 56, offX: 24, offY: 72,  score: 0,   ground: true, unstompable: true },
        };
        const cfg = configs[type];
        const enemy = this.enemies.create(x, y, 'enemies', cfg.frame);
        enemy.setScale(0.5);
        enemy.body.setSize(cfg.bodyW, cfg.bodyH);
        enemy.body.setOffset(cfg.offX, cfg.offY);
        enemy.setVelocityX(cfg.speed * dir);
        enemy.setFlipX(dir > 0);
        enemy.anims.play(cfg.anim, true);
        enemy.enemyType = type;
        enemy.enemySpeed = cfg.speed;
        enemy.enemyDir = dir;
        enemy.enemyScore = cfg.score;
        enemy.isGround = cfg.ground;
        enemy.unstompable = cfg.unstompable || false;

        if (!cfg.ground) {
            enemy.body.setAllowGravity(false);
            enemy.baseY = y;
            enemy.flyTime = 0;
        }

        return enemy;
    }

    spawnEnemyOnPlatform(type, platformCx, platformY, dir) {
        const enemy = this.spawnEnemy(type, platformCx, platformY - 50, dir);
        enemy.patrolMinX = platformCx - 80;
        enemy.patrolMaxX = platformCx + 80;

        // 달팽이 2단계 처치
        if (type === 'snail') {
            enemy.snailPhase = 1;
        }

        return enemy;
    }

    handleEnemyContact(player, enemy) {
        if (enemy.isDying) return;

        // 별 무적: 접촉만으로 처치 (밟기 불가 포함)
        if (this.starActive) {
            this.killEnemy(enemy);
            this.sound.play('sfx_disappear');
            return;
        }

        // 밟기 불가 적은 항상 피격
        if (enemy.unstompable) {
            this.hitPlayer(player, enemy);
            return;
        }

        // 밟기 판정: 플레이어가 낙하 중이고 플레이어 하단이 적 상단 근처
        const playerBottom = player.body.bottom;
        const enemyTop = enemy.body.top;
        if (player.body.velocity.y > 0 && playerBottom < enemyTop + 16) {
            // 달팽이 2단계 처치
            if (enemy.enemyType === 'snail' && enemy.snailPhase === 1) {
                enemy.snailPhase = 2;
                enemy.anims.stop();
                enemy.setFrame('snail_shell');
                enemy.setVelocityX(0);
                enemy.enemySpeed = 0;
                enemy.enemyScore = 200;
                player.setVelocityY(-350);
                this.sound.play('sfx_bump');
                this.combo++;
                this._comboProtect = true;
                this._canBounceJump = true;
                this.updateComboDisplay();
                // 점수 팝업 (1단계)
                const scoreTxt = this.add.text(enemy.x, enemy.y - 20, '+50', {
                    fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#ffff00',
                    stroke: '#000', strokeThickness: 4
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({ targets: scoreTxt, y: scoreTxt.y - 40, alpha: 0, duration: 800, onComplete: () => scoreTxt.destroy() });
                this.addScore(50);
                return;
            }
            this.killEnemy(enemy);
            player.setVelocityY(-350);
            this.sound.play('sfx_jump_high');
            this._comboProtect = true;
            this._canBounceJump = true;
        } else {
            this.hitPlayer(player, enemy);
        }
    }

    getComboMultiplier() {
        if (this.combo <= 1) return 1;
        if (this.combo === 2) return 2;
        if (this.combo === 3) return 3;
        if (this.combo === 4) return 5;
        return 8;
    }

    updateComboDisplay() {
        if (this.combo < 2) {
            this.comboText.setAlpha(0);
            return;
        }
        const colors = { 2: '#ffffff', 3: '#ffff00', 4: '#ff8800', 5: '#ff0000' };
        const colorKey = Math.min(this.combo, 5);
        this.comboText.setText('×' + this.getComboMultiplier() + ' COMBO!');
        this.comboText.setColor(colors[colorKey]);
        this.comboText.setAlpha(1);
        this.tweens.add({
            targets: this.comboText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    killEnemy(enemy) {
        enemy.isDying = true;
        enemy.body.enable = false;
        enemy.anims.stop();
        const restFrames = {
            slime: 'slime_normal_rest', worm: 'worm_normal_rest',
            mouse: 'mouse_rest', ladybug: 'ladybug_rest',
            snail: 'snail_rest', bee: 'bee_rest', fly: 'fly_rest'
        };
        enemy.setFrame(restFrames[enemy.enemyType] || 'slime_normal_rest');

        // 콤보
        this.combo++;
        const multiplier = this.getComboMultiplier();
        const points = enemy.enemyScore * multiplier;
        this.updateComboDisplay();

        // 점수 팝업
        const label = multiplier > 1 ? '+' + points + ' ×' + multiplier : '+' + points;
        const scoreTxt = this.add.text(enemy.x, enemy.y - 20, label, {
            fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#ffff00',
            stroke: '#000', strokeThickness: 4
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
        this.addScore(points);

        // 웨이브 클리어 판정
        this.waveKills++;
        this.checkWaveClear();
    }

    hitPlayer(player, enemy) {
        if (this.isInvincible) return;

        this.hp--;
        this.isInvincible = true;
        this.waveDamageTaken = true;
        this.sound.play('sfx_hurt');
        this.updateHearts();

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
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        if (this.waveSpawnTimer) this.waveSpawnTimer.remove();

        // 플레이어 사망 연출
        this.player.anims.stop();
        this.player.setFrame('character_beige_hit');
        this.player.setAlpha(1);

        // 1초 후 게임오버 UI
        this.time.delayedCall(1000, () => {
            // 어두운 오버레이
            this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(300);

            // GAME OVER 텍스트
            const goText = this.add.text(W / 2, H / 2 - T * 2, 'GAME OVER', {
                fontSize: '48px', fontFamily: 'Arial Black, Arial', color: '#ff4444',
                stroke: '#000000', strokeThickness: 6
            }).setOrigin(0.5).setDepth(301).setScale(0);

            this.tweens.add({
                targets: goText,
                scaleX: 1, scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });

            // 최종 점수
            this.add.text(W / 2, H / 2 - T * 0.5, 'SCORE: ' + this.score.toLocaleString(), {
                fontSize: '28px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(301);

            // 최고 웨이브
            this.add.text(W / 2, H / 2 + T * 0.5, 'WAVE: ' + this.waveNum, {
                fontSize: '24px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(301);

            // 최고 점수 갱신
            const best = Number(localStorage.getItem('bubbleJump_highScore') || 0);
            if (this.score > best) {
                localStorage.setItem('bubbleJump_highScore', this.score);
                this.add.text(W / 2, H / 2 + T * 1.5, 'NEW BEST!', {
                    fontSize: '28px', fontFamily: 'Arial Black, Arial', color: '#ffff00',
                    stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5).setDepth(301);
            }

            // TAP TO RESTART
            this.time.delayedCall(2000, () => {
                const restartText = this.add.text(W / 2, H / 2 + T * 3, 'TAP TO RESTART', {
                    fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
                    stroke: '#000000', strokeThickness: 3
                }).setOrigin(0.5).setDepth(301);

                this.tweens.add({
                    targets: restartText,
                    alpha: 0, duration: 500, yoyo: true, repeat: -1
                });

                this.input.once('pointerdown', () => {
                    this.sound.play('sfx_select');
                    this.scene.restart();
                });
                this.input.keyboard.once('keydown', () => {
                    this.sound.play('sfx_select');
                    this.scene.restart();
                });
            });
        });
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
        if (this.isGameOver) return;
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
        this.touchJump = false;

        if (leftDown) {
            player.setVelocityX(-200);
            player.setFlipX(true);
        } else if (rightDown) {
            player.setVelocityX(200);
            player.setFlipX(false);
        } else {
            player.setVelocityX(0);
        }

        // 점프 (바운스 중에도 허용: 착지 전까지)
        if (onFloor && !this._comboProtect) this._canBounceJump = false;
        const canJump = onFloor || this._canBounceJump;
        if (jumpDown && canJump) {
            if (this.springActive) {
                player.setVelocityY(-840);
                this.springActive = false;
                this.sound.play('sfx_jump_high');
            } else {
                player.setVelocityY(-620);
                this.sound.play('sfx_jump');
            }
            this._canBounceJump = false;
        }

        // 착지 시 콤보 리셋 (밟기 직후 프레임은 보호)
        if (this._comboProtect) {
            if (!onFloor) this._comboProtect = false;
        } else if (onFloor && this.combo > 0) {
            if (this.combo >= 2) {
                this.tweens.add({
                    targets: this.comboText,
                    alpha: 0,
                    duration: 300
                });
            }
            this.combo = 0;
        }

        // Wrap-around (플레이어)
        if (player.x < -T / 2) player.x = W + T / 2;
        else if (player.x > W + T / 2) player.x = -T / 2;

        // 적 업데이트
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isDying) return;

            if (enemy.isGround) {
                // wrap-around
                if (enemy.x < -T / 2) enemy.x = W + T / 2;
                else if (enemy.x > W + T / 2) enemy.x = -T / 2;
                // 벽 반전
                if (enemy.body.blocked.right || enemy.body.touching.right) {
                    enemy.enemyDir = -1;
                    enemy.setVelocityX(-enemy.enemySpeed);
                    enemy.setFlipX(false);
                } else if (enemy.body.blocked.left || enemy.body.touching.left) {
                    enemy.enemyDir = 1;
                    enemy.setVelocityX(enemy.enemySpeed);
                    enemy.setFlipX(true);
                }
                // 순찰 범위 반전
                if (enemy.patrolMinX != null) {
                    if (enemy.enemyDir < 0 && enemy.x <= enemy.patrolMinX) {
                        enemy.enemyDir = 1;
                        enemy.setVelocityX(enemy.enemySpeed);
                        enemy.setFlipX(true);
                    } else if (enemy.enemyDir > 0 && enemy.x >= enemy.patrolMaxX) {
                        enemy.enemyDir = -1;
                        enemy.setVelocityX(-enemy.enemySpeed);
                        enemy.setFlipX(false);
                    }
                }
            } else {
                // 공중 적: wrap-around
                if (enemy.x < -T / 2) enemy.x = W + T / 2;
                else if (enemy.x > W + T / 2) enemy.x = -T / 2;
                // 벌: 사인파
                if (enemy.enemyType === 'bee') {
                    enemy.flyTime += 0.03;
                    enemy.y = enemy.baseY + Math.sin(enemy.flyTime) * 30;
                }
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
    width: W,
    height: H,
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
    backgroundColor: '#4488FF',
    resolution: window.devicePixelRatio
};

const game = new Phaser.Game(config);
