import { _decorator, CCFloat, Component, director, Node, sp, tween, UIOpacity, v2, Vec2 } from 'cc';
import { CutsceneCharacter } from '../CutsceneCharacter';
import { CutsceneCamera } from '../CutsceneCamera';
import { CutsceneObject } from '../CutsceneObject';
import GameEvent from '../../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('CutsceneDemonStartManager')
export class CutsceneDemonStartManager extends Component {

    @property(CCFloat)
    timeScale: number = 1;

    @property(CCFloat)
    delayStart: number = 1.5;

    @property(CutsceneCharacter)
    zeroRed: CutsceneCharacter = null;

    @property(CutsceneCharacter)
    zeroBlue: CutsceneCharacter = null;

    @property(CutsceneCamera)
    camera: CutsceneCamera = null;

    @property(CutsceneObject)
    bulletZeroRed: CutsceneObject = null;

    @property(CutsceneObject)
    bulletZeroBlue: CutsceneObject = null;

    @property(CutsceneObject)
    smashDownRed: CutsceneObject = null;

    @property(CutsceneObject)
    smashDownBlue: CutsceneObject = null;

    @property(CutsceneObject)
    whiteSlash: CutsceneObject = null;

    @property(UIOpacity)
    mask: UIOpacity = null;

    @property([Node])
    buttonCutscene: Node[] = [];

    buttonIndex: number = -1;

    //CONST:
    readonly posYCharGround: number = -1310;
    readonly posYBulletGround: number = -1230;
    readonly posYWhiteSlashGround: number = -1200;
    readonly posYSmashDownGround: number = -1310;
    readonly bulletDelayFly: number = 0.25;
    readonly charJumpWallDelay: number = 0.1;
    readonly charDownSmashDelay: number = 0.05;
    //
    //Idle
    readonly animIdle = "idle";
    //Move
    readonly animDash = "dash";
    //Hit
    readonly animHit = "hit";
    //Skill
    readonly animFireBullet = "skill";
    readonly animSmashDownReady = "skill3";
    readonly animSmashDownLoop = "skill3_loop";
    //Jump
    readonly animJumpUpReady = "jump1_up";
    readonly animJumpUpLoop = "jump2_loop";
    readonly animJumpUpCircle = "jump3_double_jump";
    readonly animJumpDownReady = "jump4_down";
    readonly animJumpDownLoop = "jump5_down_loop";
    readonly animJumpLandIdle = "jump6_down_end";
    //Wall
    readonly animWallIdle = "bam_tuong_down";
    //Fight
    readonly animAttack1 = "attack_2_1";
    readonly animAttack2 = "attack_2_2";

    protected start(): void {
        this.camera.SetPos(v2(-500, 200));
        this.zeroRed.SetPos(v2(900, 150));
        this.zeroBlue.SetPos(v2(1000, this.posYCharGround));
        this.zeroRed.SetFaceR();
        this.zeroBlue.SetFaceL();
        this.zeroRed.node.active = false;
        this.zeroBlue.node.active = false;
        this.bulletZeroRed.node.active = false;
        this.bulletZeroBlue.node.active = false;
        //
        this.zeroRed.SetTimeScale(this.timeScale);
        this.zeroBlue.SetTimeScale(this.timeScale);
        //
        director.on(GameEvent.CUTSCENE_CONTINUE, this.onCutsceneContinue, this);
        //
        this.scheduleOnce(() => {
            this.SetAction01();
            //this.camera.SetMove(v2(-500, -870), 3, 3); //Camera From (-500, 200) to (-500, -870)
        }, this.delayStart);
    }

    //Cutscene Button

    SetButtonCutsceneAppear() {
        this.buttonIndex++;
        if (this.buttonIndex < this.buttonCutscene.length)
            this.buttonCutscene[this.buttonIndex].active = true;
    }

    onCutsceneContinue() {
        if (this.buttonIndex >= 0)
            this.buttonCutscene[this.buttonIndex].active = false;
        //
        switch (this.buttonIndex) {
            case 0:
                this.SetAction04(); //Btn Attack
                break;
            case 1:
                this.SetAction07(); //Btn Fire
                break;
            case 2:
                this.SetAction09(); //Btn Down
                break;
            case 3:
                this.SetAction11(); //Btn Attack (Final)
                break;
        }
    }

    //Effect

    SetAnimBulletFire(BulletFire: CutsceneObject, Pos: Vec2): number {
        BulletFire.node.active = true;
        BulletFire.SetPos(Pos);
        let Duration = BulletFire.SetAnim("appear", false);
        this.scheduleOnce(() => {
            BulletFire.SetAnim("idle", true);
        }, Duration);
        return Duration;
    }

    SetAnimBulletExplode(BulletFire: CutsceneObject) {
        this.scheduleOnce(() => {
            BulletFire.node.active = false;
        }, BulletFire.SetAnim("explode", false));
    }

    SetAnimWhiteSlash(Pos: Vec2): number {
        this.whiteSlash.node.active = true;
        this.whiteSlash.SetPos(Pos);
        let Duration = this.whiteSlash.SetAnim("apear", false);
        this.scheduleOnce(() => {
            this.whiteSlash.node.active = false;
        }, Duration);
        return Duration;
    }

    SetAnimSmashDown(SmashDown: CutsceneObject, Pos: Vec2, Blow: boolean) {
        SmashDown.node.active = true;
        SmashDown.SetPos(Pos);
        let Duration = SmashDown.SetAnim(Blow ? "2" : "1", false);
        this.scheduleOnce(() => {
            SmashDown.node.active = false;
        }, Duration);
        return Duration;
    }

    //Action 01: Zero Red knock back from top to down wall, then land the ground

    SetAction01() {
        //Duration:
        let CameraMoveDown = 2 / this.timeScale;
        let ZeroRedFlyToWall = 0.5 / this.timeScale;
        let ZeroRedDelayLandGround = 0.25 / this.timeScale;
        let ZeroRedLandToGround = 0.25 / this.timeScale;
        //
        //Start:
        this.camera.SetMove(v2(-500, -870), CameraMoveDown, 0); //Camera From (-500, 200) to (-500, -870)
        this.scheduleOnce(() => {
            //Zero Red fly to wall
            this.zeroRed.node.active = true;
            this.zeroRed.SetAnim(this.animJumpDownLoop, true);
            this.zeroRed.SetPos(v2(800, 150));
            this.zeroRed.SetMove(v2(-1050, -1050), ZeroRedFlyToWall, 0); //Zero Red From (900;150) to (-1050;-1050)
            this.scheduleOnce(() => {
                //Zero Red hit the wall
                this.scheduleOnce(() => {
                    this.zeroRed.SetAnim(this.animJumpDownLoop, true);
                }, this.zeroRed.SetAnim(this.animHit, false));
                this.scheduleOnce(() => {
                    //Zero Red land the ground
                    this.scheduleOnce(() => {
                        this.zeroRed.SetAnim(this.animIdle, true);
                    }, this.zeroRed.SetAnim(this.animJumpLandIdle, false));
                    this.zeroRed.SetMove(v2(-750, -1310), ZeroRedLandToGround, 0); //Zero Red From (-1050;-1050) to (-750,Ground)
                    this.scheduleOnce(() => {
                        //Next action
                        this.SetAction02();
                    }, ZeroRedLandToGround + 0.25);
                }, ZeroRedDelayLandGround);
            }, ZeroRedFlyToWall);
        }, CameraMoveDown);
    }

    //Action 02: Zero Blue dash forward and start battle with Zero Red

    SetAction02() {
        //Duration:
        let CameraMoveRight = 1 / this.timeScale;
        let ZeroBlueFireDelay = 0.25 / this.timeScale;
        let BulletBlueFlyMiss = 0.5 / this.timeScale;
        let ZeroRedJumpDelay = 0.2 / this.timeScale;
        let ZeroRedJumpThough = 0.5 / this.timeScale;
        let TwoZeroDelayNextAction = 0.2 / this.timeScale;
        //
        //Start:
        this.camera.SetMove(v2(-200, -870), CameraMoveRight, 0); //Camera From (-500,-870) to (-200,-870)
        this.zeroBlue.node.active = true;
        let ZeroBlueTowardDuration = this.zeroBlue.SetAnim(this.animDash, true) * 3;
        this.zeroBlue.SetMove(v2(450, this.posYCharGround), ZeroBlueTowardDuration, 0); //Zero Blue from (1100,Ground) to (450,Ground)
        this.scheduleOnce(() => {
            this.zeroBlue.SetAnim(this.animIdle, true);
            this.scheduleOnce(() => {
                //Zero Blue fire the fire ball
                this.scheduleOnce(() => {
                    this.zeroBlue.SetAnim(this.animIdle, true);
                }, this.zeroBlue.SetAnim(this.animFireBullet, false));
                //
                //Bullet Zero Blue fire
                this.SetAnimBulletFire(this.bulletZeroBlue, v2(360, this.posYBulletGround));
                this.bulletZeroBlue.SetMove(v2(-1100, this.posYBulletGround), BulletBlueFlyMiss, this.bulletDelayFly);
                this.bulletZeroBlue.SetFaceL();
                this.scheduleOnce(() => {
                    this.SetAnimBulletExplode(this.bulletZeroBlue);
                }, BulletBlueFlyMiss + this.bulletDelayFly);
                //
                //Zero Red Jump avoid Zero Blue Bullet
                this.scheduleOnce(() => {
                    this.scheduleOnce(() => {
                        this.zeroRed.SetAnim(this.animJumpUpLoop, true);
                    }, this.zeroRed.SetAnim(this.animJumpUpReady, false));
                }, ZeroRedJumpDelay);
                this.zeroRed.SetMove(v2(-560, -975), ZeroRedJumpThough / 2, ZeroRedJumpDelay); //Zero Red from (-750,Ground) to (-560, -975)
                //
                this.scheduleOnce(() => {
                    this.scheduleOnce(() => {
                        this.scheduleOnce(() => {
                            this.zeroRed.SetAnim(this.animIdle, true);
                        }, this.zeroRed.SetAnim(this.animJumpDownLoop, false));
                    }, this.zeroRed.SetAnim(this.animJumpDownReady, false));
                    this.zeroRed.SetMove(v2(-400, this.posYCharGround), ZeroRedJumpThough / 2, 0); //Red Blue from (-560, -975) to (-400,Ground)
                }, ZeroRedJumpDelay + ZeroRedJumpThough / 2);
                //
                //Zero Red and Blue Zero look at each other for awhile
                this.scheduleOnce(() => {
                    //Next action
                    this.SetAction03();
                }, ZeroRedJumpDelay + ZeroRedJumpThough + TwoZeroDelayNextAction);
            }, ZeroBlueFireDelay);
        }, ZeroBlueTowardDuration);
    }

    //Action 03: Two Zero dash toward, wait for player press button to start fight

    SetAction03() {
        //Duration
        let TwoZeroDashToward = 0.35 / this.timeScale;
        //
        //Start
        this.zeroRed.SetAnim(this.animDash, true);
        this.zeroRed.SetMove(v2(-110, this.posYCharGround), TwoZeroDashToward, 0); //Zero Red from (-400,Ground) to (-110,Ground)
        this.zeroBlue.SetAnim(this.animDash, true);
        this.zeroBlue.SetMove(v2(155, this.posYCharGround), TwoZeroDashToward, 0); //Zero Blue from (450,Ground) to (155,Ground)
        this.scheduleOnce(() => {
            //Zero Red ready to attack
            this.zeroRed.SetTimeScale(0);
            this.zeroBlue.SetAnim(this.animAttack1, false);
            this.zeroBlue.SetTimeScale(0);
            //
            //Button apear and wait for player press button
            this.SetButtonCutsceneAppear();
        }, TwoZeroDashToward);
    }

    //Action 04: After player press button, fight continue, two zero fight 3 time in row

    SetAction04() {
        //Duration
        let TwoZeroMoveFight01 = 0.125 / this.timeScale;
        let TwoZeroMoveFight02 = 0.125 / this.timeScale;
        let TwoZeroMoveFight03 = 0.125 / this.timeScale;
        //
        //Start
        let DurationFight01 = this.zeroRed.SetAnim(this.animAttack2, false);
        this.zeroRed.SetTimeScale(1);
        this.zeroBlue.SetTimeScale(1);
        //
        this.SetAnimWhiteSlash(v2(-20, this.posYWhiteSlashGround));
        //
        this.scheduleOnce(() => {
            //Fisrt knock-back of Zero Red when fight
            let DurationFight02 = this.zeroRed.SetAnim(this.animAttack1, false);
            this.zeroRed.SetMove(v2(-210, this.posYCharGround), TwoZeroMoveFight01, 0); //Zero Red from (-110,Ground) to (-210,Ground)
            this.zeroBlue.SetAnim(this.animAttack2, false);
            this.zeroBlue.SetMove(v2(55, this.posYCharGround), TwoZeroMoveFight01, 0); //Zero Blue from (155,Ground) to (55,Ground)
            //
            this.SetAnimWhiteSlash(v2(-85, this.posYWhiteSlashGround));
            //
            this.scheduleOnce(() => {
                //Second knock-back of Zero Red when fight
                let DurationFight03 = this.zeroRed.SetAnim(this.animAttack2, false);
                this.zeroRed.SetMove(v2(-310, this.posYCharGround), TwoZeroMoveFight02, 0); //Zero Red from (-210,Ground) to (-310,Ground)
                this.zeroBlue.SetAnim(this.animAttack1, false);
                this.zeroBlue.SetMove(v2(-55, this.posYCharGround), TwoZeroMoveFight02, 0); //Zero Blue from (55,Ground) to (-55,Ground)
                //
                this.SetAnimWhiteSlash(v2(-185, this.posYWhiteSlashGround));
                //
                this.scheduleOnce(() => {
                    //Zero Red fall back when fight
                    this.zeroRed.SetAnim(this.animJumpUpLoop, false);
                    this.zeroRed.SetMove(v2(-750, this.posYCharGround), TwoZeroMoveFight03, 0); //Zero Red from (-310,Ground) to (-750,Ground)
                    this.zeroBlue.SetAnim(this.animAttack2, false);
                    this.zeroBlue.SetMove(v2(-155, this.posYCharGround), TwoZeroMoveFight03, 0); //Zero Blue from (-55,Ground) to (-155,Ground)
                    //
                    this.scheduleOnce(() => {
                        this.zeroRed.SetAnim(this.animIdle, true);
                        this.zeroBlue.SetAnim(this.animIdle, true);
                        //
                        //Next action
                        this.SetAction05();
                    }, TwoZeroMoveFight03);
                }, DurationFight03);
            }, DurationFight02);
        }, DurationFight01);
    }

    //Action 05: Zero Red dash toward, Zero Blue jump up and smash down

    SetAction05() {
        //Duration
        let ZeroRedDashToward = 0.5 / this.timeScale;
        let ZeroBlueDelayJump = 0.2 / this.timeScale;
        let ZeroBlueJumpToward = 0.2 / this.timeScale;
        let ZeroBlueSmashDown = 0.2 / this.timeScale;
        let ZeroRedDashBack = 0.2 / this.timeScale;
        //
        //Start
        this.zeroRed.SetAnim(this.animDash, true);
        this.zeroRed.SetMove(v2(50, this.posYCharGround), ZeroRedDashToward, 0); //Zero Red from (-750,Ground) to (50,Ground)
        this.scheduleOnce(() => {
            this.zeroRed.SetAnim(this.animIdle, true);
            this.zeroRed.SetFaceL();
        }, ZeroRedDashToward);
        //
        this.scheduleOnce(() => {
            //Zero Blue start jump up
            this.scheduleOnce(() => {
                this.zeroBlue.SetAnim(this.animJumpUpLoop, true);
            }, this.zeroBlue.SetAnim(this.animJumpUpReady, false));
            this.zeroBlue.SetMove(v2(-400, -900), ZeroBlueJumpToward, 0); //Red Blue from (-560,-975) to (-400,-900)
            this.scheduleOnce(() => {
                //Zero Blue ready to smash down
                let SmashDownReadyDuration = this.zeroBlue.SetAnim(this.animSmashDownReady, false) + this.charDownSmashDelay;
                this.scheduleOnce(() => {
                    //Zero Blue start smash down
                    this.zeroBlue.SetAnim(this.animSmashDownLoop, true);
                    this.zeroBlue.SetMove(v2(-400, this.posYCharGround), ZeroBlueSmashDown, 0); //Red Blue from (-400,-975) to (-400,Ground)
                    this.scheduleOnce(() => {
                        //Zero Blue smash down to ground
                        this.zeroBlue.SetAnim(this.animIdle, true);
                        this.scheduleOnce(() => {
                            //Zero Blue turn back and attack hit Zero Red
                            this.zeroBlue.SetAnim(this.animAttack1, false);
                            this.zeroBlue.SetFaceR();
                            //Next action
                            this.SetAction06();
                        }, ZeroRedDashBack);
                        //
                        this.SetAnimSmashDown(this.smashDownBlue, v2(-560, this.posYSmashDownGround), true);
                        //
                        this.zeroRed.SetAnim(this.animDash, true);
                        this.zeroRed.SetMove(v2(-225, this.posYCharGround), ZeroRedDashBack, 0); //Zero Red from (50,Ground) to (-225,Ground)
                    }, ZeroBlueSmashDown);
                }, SmashDownReadyDuration);
                //
                this.SetAnimSmashDown(this.smashDownBlue, v2(-560, -800), false);
                //
            }, ZeroBlueJumpToward);
        }, ZeroBlueDelayJump);
    }

    //Action 06: Zero Red knock back, Zero ready to fire and button cutscene appear

    SetAction06() {
        //Duration
        let ZeroRedKnockBack = 0.3 / this.timeScale;
        //
        //Start
        this.camera.SetMove(v2(50, -870), ZeroRedKnockBack, 0); //Camera From (-225,-870) to (50,-870)
        this.scheduleOnce(() => {
            this.zeroRed.SetAnim(this.animJumpUpLoop, true);
        }, this.zeroRed.SetAnim(this.animHit, false));
        this.zeroRed.SetTimeScale(1);
        this.zeroRed.SetMove(v2(500, this.posYCharGround), ZeroRedKnockBack, 0); //Zero Red from (-200,Ground) to (500,Ground)
        //
        this.scheduleOnce(() => {
            this.zeroRed.SetAnim(this.animIdle, true);
            this.zeroBlue.SetTimeScale(0);
            //
            this.zeroBlue.SetAnim(this.animFireBullet, false);
            this.zeroBlue.SetTimeScale(0);
            //
            //Button apear and wait for player press button
            this.SetButtonCutsceneAppear();
        }, ZeroRedKnockBack);
    }

    //Action 07: Zero Red and Zero Blue fire each other

    SetAction07() {
        //Duration
        let BulletFlyTowardBlow = 0.3 / this.timeScale;
        //
        //Start
        this.scheduleOnce(() => {
            this.zeroBlue.SetAnim(this.animIdle, true);
        }, this.zeroBlue.SetAnim(this.animFireBullet, false));
        this.zeroBlue.SetTimeScale(1);
        //
        this.SetAnimBulletFire(this.bulletZeroBlue, v2(-350, this.posYBulletGround));
        this.bulletZeroBlue.SetMove(v2(120, this.posYBulletGround), BulletFlyTowardBlow, this.bulletDelayFly);
        this.bulletZeroBlue.SetFaceR();
        this.scheduleOnce(() => {
            this.SetAnimBulletExplode(this.bulletZeroBlue);
        }, BulletFlyTowardBlow + this.bulletDelayFly);
        //
        this.zeroRed.SetTimeScale(1);
        let AttackDuration02 = this.zeroRed.SetAnim(this.animFireBullet, false);
        //
        this.SetAnimBulletFire(this.bulletZeroRed, v2(400, this.posYBulletGround));
        this.bulletZeroRed.SetMove(v2(120, this.posYBulletGround), BulletFlyTowardBlow, this.bulletDelayFly);
        this.bulletZeroRed.SetFaceL();
        this.scheduleOnce(() => {
            this.SetAnimBulletExplode(this.bulletZeroRed);
        }, BulletFlyTowardBlow + this.bulletDelayFly);
        //
        this.scheduleOnce(() => {
            //Next action
            this.SetAction08();
        }, AttackDuration02);
    }

    //Action 08: Zero Red fall back, go up, dash out and button cutscene apear

    SetAction08() {
        //Duration
        let PosXWallL = 900;
        let PosXWallR = 1250;
        let ZeroRedFallBack = 0.4 / this.timeScale;
        let ZeroRedJumpWall = 0.35 / this.timeScale;
        let ZeroRedDashOut = 0.35 / this.timeScale;
        //
        //Start
        this.camera.SetMove(v2(280, -870), ZeroRedFallBack, 0); //Camera From (50,-870) to (280,-870)
        this.zeroRed.SetAnim(this.animDash, true);
        this.zeroRed.SetMove(v2(930, this.posYCharGround), ZeroRedFallBack, 0); //Zero Red from (500,Ground) to (930,Ground)
        this.zeroRed.SetFaceR();
        //
        this.scheduleOnce(() => {
            this.camera.SetMove(v2(280, 150), ZeroRedJumpWall * 3, 0); //Camera From (50,-870) to (280,150)
            this.scheduleOnce(() => {
                this.zeroRed.SetAnim(this.animJumpUpLoop, true);
            }, this.zeroRed.SetAnim(this.animJumpUpReady, false));
            //Zero Red jump up between wall
            //Wall 1
            this.zeroRed.SetMove(v2(PosXWallR, -950), ZeroRedJumpWall, 0); //Zero Red from (930,Ground) to (PosXWallR,-950)
            this.zeroRed.SetFaceR();
            this.scheduleOnce(() => {
                //Wall 1 Delay
                this.zeroRed.SetAnim(this.animWallIdle, true);
                this.zeroRed.SetFaceL();
                this.scheduleOnce(() => {
                    //Wall 2
                    this.zeroRed.SetAnim(this.animJumpUpLoop, true);
                    this.zeroRed.SetMove(v2(PosXWallL, -550), ZeroRedJumpWall, 0); //Zero Red from (PosXWallR,-950) to (PosXWallL,-550)
                    this.scheduleOnce(() => {
                        //Wall 2 Delay
                        this.zeroRed.SetAnim(this.animWallIdle, true);
                        this.zeroRed.SetFaceR();
                        this.scheduleOnce(() => {
                            //Wall 3
                            this.zeroRed.SetAnim(this.animJumpUpLoop, true);
                            this.zeroRed.SetMove(v2(PosXWallR, -120), ZeroRedJumpWall, 0); //Zero Red from (PosXWallL,-550) to (PosXWallR,-120)
                            this.scheduleOnce(() => {
                                //Wall 3 Delay
                                this.zeroRed.SetAnim(this.animWallIdle, true);
                                this.zeroRed.SetFaceL();
                                this.scheduleOnce(() => {
                                    //Wall 4
                                    this.zeroRed.SetAnim(this.animJumpUpCircle, true);
                                    this.zeroRed.SetMove(v2(PosXWallL, 250), ZeroRedJumpWall, 0); //Zero Red from (PosXWallR,-120) to (PosXWallL,250)
                                    this.scheduleOnce(() => {
                                        //Zero Red Dash out
                                        this.zeroRed.SetAnim(this.animDash, true);
                                        this.zeroRed.SetMove(v2(150, 250), ZeroRedDashOut, 0); //Zero Red from (PosXWallL,250) to (150,250)
                                        this.zeroRed.SetFaceL();
                                        this.scheduleOnce(() => {
                                            //Button apear and wait for player press button
                                            this.SetButtonCutsceneAppear();
                                        }, ZeroRedDashOut);
                                        //Zero Red Dash out
                                    }, ZeroRedJumpWall);
                                    //Wall 4
                                }, this.charJumpWallDelay);
                                //Wall 3 Delay
                            }, ZeroRedJumpWall);
                            //Wall 3
                        }, this.charJumpWallDelay);
                        //Wall 2 Delay
                    }, ZeroRedJumpWall);
                    //Wall 2
                }, this.charJumpWallDelay);
                //Wall 1 Delay
            }, ZeroRedJumpWall);
            //Wall 1
        }, ZeroRedFallBack);
    }

    //Action 09: Zero Red smash down

    SetAction09() {
        //Duration
        let ZeroRedDownSmash = 0.5 / this.timeScale;
        let ZeroBlueJumpUp = 0.2 / this.timeScale;
        let ZeroBlueFallBack = 0.1 / this.timeScale;
        let ZeroBlueDownSmash = 0.35 / this.timeScale;
        let ZeroRedDashOut = 0.2 / this.timeScale;
        let ZeroBlueIdleDelay = 0.2 / this.timeScale;
        //
        //Start
        let SmashDownReadyDuration = this.zeroRed.SetAnim(this.animSmashDownReady, false) + this.charDownSmashDelay;
        this.scheduleOnce(() => {
            //Zero Red smash down to attack Zero Blue under him
            this.camera.SetMove(v2(200, -870), ZeroRedDownSmash, 0); //Camera From (280,150) to (200,-870)
            this.zeroRed.SetAnim(this.animSmashDownLoop, true);
            this.zeroRed.SetMove(v2(150, this.posYCharGround), ZeroRedDownSmash, 0); //Zero Red from (150,250) to (150,Ground)
            this.scheduleOnce(() => {
                this.SetAnimSmashDown(this.smashDownRed, v2(150, this.posYSmashDownGround), true);
            }, ZeroRedDownSmash);
        }, SmashDownReadyDuration);
        //
        this.SetAnimSmashDown(this.smashDownRed, v2(150, 350), false);
        //
        this.scheduleOnce(() => {
            this.zeroBlue.SetAnim(this.animJumpUpLoop, true);
        }, this.zeroBlue.SetAnim(this.animJumpUpReady, false));
        this.zeroBlue.SetPos(v2(0, this.posYCharGround));
        this.zeroBlue.SetMove(v2(450, -770), ZeroBlueJumpUp, 0); //Zero Blue from (0,Ground) to (450,-770)
        this.scheduleOnce(() => {
            //Zero Blue jump up to Zero Red
            this.zeroBlue.SetMove(v2(200, -250), ZeroBlueJumpUp, this.charJumpWallDelay); //Zero Blue from (450, -770) to (200,-250)
            this.zeroBlue.SetFaceL();
            this.scheduleOnce(() => {
                //Zero Blue fall back when Zero Red smash down
                this.zeroBlue.SetMove(v2(450, -250), ZeroBlueFallBack, 0); //Zero Blue from (450,-770) to (450,-250)
                //
                this.scheduleOnce(() => {
                    let SmashDownReadyDuration = this.zeroBlue.SetAnim(this.animSmashDownReady, false) + this.charDownSmashDelay;
                    this.scheduleOnce(() => {
                        //Zero Blue smash down
                        this.zeroBlue.SetAnim(this.animSmashDownLoop, false)
                        this.zeroBlue.SetMove(v2(450, this.posYCharGround), ZeroBlueDownSmash, 0); //Zero Blue from (450,-250) to (450,Ground)
                        this.scheduleOnce(() => {
                            this.zeroBlue.SetAnim(this.animIdle, true);
                            //Next action
                            this.SetAction10();
                        }, ZeroBlueDownSmash + ZeroBlueIdleDelay);
                        //
                        this.scheduleOnce(() => {
                            this.SetAnimSmashDown(this.smashDownBlue, v2(450, this.posYSmashDownGround), true);
                        }, ZeroBlueDownSmash);
                        //
                        //Zero Red dash out after land ground
                        this.zeroRed.SetAnim(this.animJumpUpLoop, true);
                        this.zeroRed.SetFaceR();
                        this.zeroRed.SetMove(v2(-200, this.posYCharGround), ZeroRedDashOut, 0); //Zero Red from (150,Ground) to (-200,Ground)
                        this.scheduleOnce(() => {
                            this.zeroRed.SetAnim(this.animIdle, true);
                            this.zeroRed.SetFaceR();
                        }, ZeroRedDashOut);
                    }, SmashDownReadyDuration);
                    //
                    this.SetAnimSmashDown(this.smashDownBlue, v2(450, -150), false);
                    //
                }, ZeroBlueFallBack + this.charJumpWallDelay);
            }, ZeroBlueJumpUp + this.charJumpWallDelay);
        }, ZeroBlueJumpUp);
    }

    //Action 10: Two Zero ready to fight to end

    SetAction10() {
        //Duration
        let ZeroBlueDelayAction = 0.1 / this.timeScale;
        let ZeroBlueDashToward = 0.25 / this.timeScale;
        //
        //Start
        this.scheduleOnce(() => {
            this.camera.SetMove(v2(-80, -870), ZeroBlueDashToward, 0); //Camera From (200,-870) to (-80,-870)
            this.zeroBlue.SetAnim(this.animDash, true);
            this.zeroBlue.SetMove(v2(70, this.posYCharGround), ZeroBlueDashToward, 0); //Zero Blue from (450,Ground) to (70,Ground)
            this.scheduleOnce(() => {
                this.zeroBlue.SetAnim(this.animAttack1, false);
                this.zeroBlue.SetTimeScale(0);
                //Button apear and wait for player press button
                this.SetButtonCutsceneAppear();
            }, ZeroBlueDashToward);
        }, ZeroBlueDelayAction);
    }

    //Action 11: Two Zero fight to end and white apear

    SetAction11() {
        //Duration
        let MaskWhiteShowDelay = 3 / this.timeScale;
        let MaskWhiteShowDuration = 3 / this.timeScale;
        let MoveToStoreDelay = MaskWhiteShowDelay + MaskWhiteShowDuration + 1;
        //
        //Start
        this.zeroRed.SetAnimInfiniteLoop(this.animAttack2, this.animAttack1);
        this.zeroRed.SetTimeScale(1);
        this.zeroBlue.SetAnimInfiniteLoop(this.animAttack1, this.animAttack2);
        this.zeroBlue.SetTimeScale(1);
        //
        this.whiteSlash.node.active = true;
        this.whiteSlash.SetPos(v2(-60, this.posYWhiteSlashGround));
        this.whiteSlash.SetTimeScale(2);
        this.whiteSlash.SetAnimInfiniteLoop("apear", "apear", true);
        //
        this.scheduleOnce(() => {
            tween(this.mask).to(MaskWhiteShowDuration, { opacity: 255 }).start();
        }, MaskWhiteShowDelay);
        //
        this.scheduleOnce(() => {
            director.emit(GameEvent.GAME_STORE_OPEN);
        }, MoveToStoreDelay);
    }
}