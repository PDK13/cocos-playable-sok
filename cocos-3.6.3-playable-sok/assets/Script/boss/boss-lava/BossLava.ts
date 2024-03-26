import { _decorator, CCBoolean, CCFloat, CCInteger, Component, director, Label, Node, Tween, tween, v2, v3 } from 'cc';
import { BossLavaBody } from './BossLavaBody';
import GameEvent from '../../GameEvent';
import { BossLavaHand } from './BossLavaHand';
const { ccclass, property } = _decorator;

@ccclass('BossLava')
export class BossLava extends Component {

    @property(CCBoolean)
    bossHurtStart: boolean = true;

    @property(CCFloat)
    bossDelayStart: number = 2;

    @property(CCBoolean)
    bossHealthCheck: boolean = false;

    @property(CCInteger)
    bossHealth: number = 10;

    @property(CCBoolean)
    bossDeadWin: boolean = true;

    @property(CCBoolean)
    bossHitPlayer: boolean = true;

    //

    @property(Node)
    body: Node = null;

    @property(Node)
    handL: Node = null;

    @property(Node)
    handR: Node = null;

    @property(Node)
    effect: Node = null;

    //

    @property(Label)
    healthShow: Label = null;

    m_baseBody: BossLavaBody = null;
    m_baseHandL: BossLavaHand = null;
    m_baseHandR: BossLavaHand = null;

    m_baseOffsetHandLPos: number = 0;
    m_baseOffsetHandRPos: number = 0;
    m_baseHandLPos(): number { return this.body.position.x + this.m_baseOffsetHandLPos; }
    m_baseHandRPos(): number { return this.body.position.x + this.m_baseOffsetHandRPos; }
    //m_baseHandLPos(): number { return 0 + this.m_baseOffsetHandLPos; }
    //m_baseHandRPos(): number { return 0 + this.m_baseOffsetHandRPos; }

    m_bossStart: boolean = false;
    m_bossHurt: number = 0;
    m_stop: boolean = false;

    m_attackStyle01LR: boolean = true;
    m_attackStyle01Count = 0;
    //Phase 01
    m_attactStyle01DelayRevert = 1;
    m_attackStyle01AttackReady = 200; //Hand current on ready to attack!
    //Phase 02
    m_attackStyle01Move = false;
    m_attackStyle01BodyMove = 500;
    m_attackStyle01AttackMoveHandFixed = 500; //Fix Hand current on attack when boss moving!

    protected onLoad(): void {
        this.m_baseBody = this.body.getComponent(BossLavaBody);
        this.m_baseHandL = this.handL.getComponent(BossLavaHand);
        this.m_baseHandR = this.handR.getComponent(BossLavaHand);
        //
        this.m_baseOffsetHandLPos = this.handL.position.x - this.body.position.x;
        this.m_baseOffsetHandRPos = this.handR.position.x - this.body.position.x;
        //
        this.node.on("onHurt", this.onHurt, this);
        //
        if (!this.bossHurtStart)
            this.SetBossStart();
        //
        this.SetHealthShow();
    }

    onHurt() {
        if (this.bossHurtStart && this.SetBossStart())
            return;
        //
        console.log("[Boss] Hurt");
        this.m_bossHurt++;
        //
        this.SetHealthShow();
        //
        if (this.bossHealthCheck && this.m_bossHurt >= this.bossHealth) {
            this.m_stop = true;
            //
            this.body.emit("onStop");
            this.handL.emit("onStop");
            this.handR.emit("onStop");
            //
            if (this.bossDeadWin)
                director.emit(GameEvent.PLAYER_STOP, v3(0, 0)); //Map should put at v2(0,0)!
        }
    }

    SetHealthShow() {
        if (this.bossHealthCheck)
            this.healthShow.string = (this.bossHealth - this.m_bossHurt) + "";
        else
            this.healthShow.node.parent.active = false;
    }

    //Boss Action Primary

    SetBossStart(): boolean {
        if (this.m_bossStart)
            return false;
        this.m_bossStart = true;
        //
        this.scheduleOnce(() => {
            this.SetBossActive();
        }, this.bossDelayStart);
        //
        console.log("[Boss] Start");
        //
        return true;
    }

    SetBossIdle() {
        this.m_baseBody.SetIdle();
        this.m_baseHandL.SetIdle();
        this.m_baseHandR.SetIdle();
    }

    SetBossActive() {
        if (this.m_stop)
            return;
        //
        this.SetBossStyle01();
    }

    SetBossStop(): boolean {
        this.m_baseBody.SetIdle();
        this.m_baseHandL.SetIdle();
        this.m_baseHandR.SetIdle();
        return this.m_stop;
    }

    //Boss Attack Style 01: 
    //Phase 01: Attack L Hand, then R Hand, then revert and repeat this
    //Phase 02: Attack L Hand, then R Hand, combo moving each attack, then revert and repeat this

    SetBossStyle01() {
        if (this.SetBossStop())
            return;
        //
        this.m_attackStyle01Count++;
        //
        //PHASE
        if (this.m_bossHurt > 20 || this.m_attackStyle01Count >= 7) {
            this.m_attackStyle01Move = true;
            this.m_attactStyle01DelayRevert = 0.1;
            this.m_attackStyle01BodyMove = 1300;
            this.m_attackStyle01AttackMoveHandFixed = 1300;
        }
        else
            if (this.m_bossHurt > 10 || this.m_attackStyle01Count >= 5) {
                this.m_attackStyle01Move = true;
                this.m_attactStyle01DelayRevert = 0.2;
                this.m_attackStyle01BodyMove = 1000;
                this.m_attackStyle01AttackMoveHandFixed = 1000;
            }
            else
                if (this.m_bossHurt > 5 || this.m_attackStyle01Count >= 3) {
                    this.m_attackStyle01Move = true;
                    this.m_attactStyle01DelayRevert = 0.5;
                    this.m_attackStyle01BodyMove = 800;
                    this.m_attackStyle01AttackMoveHandFixed = 800;
                }
                else
                    if (this.m_attackStyle01Count >= 2)
                        this.m_attackStyle01Move = true;
        //
        //ATTACK
        if (this.m_attackStyle01LR)
            this.SetBossStyle01LR(this.m_attackStyle01Move);
        else
            this.SetBossStyle01RL(this.m_attackStyle01Move);
        //
        //REVERT
        this.m_attackStyle01LR = !this.m_attackStyle01LR;
    }

    SetBossStyle01LR(AttackMove: boolean) {
        if (this.SetBossStop())
            return;
        //
        //Hand L Ready
        this.m_baseBody.SetReady();
        let ReadyLDuration = this.m_baseHandL.SetReady(false);
        this.scheduleOnce(() => {
            if (this.SetBossStop())
                return;
            //
            //Hand L Attack
            let AttackLDuration = this.m_baseBody.SetAttackL();
            this.m_baseHandL.SetAttack();
            this.scheduleOnce(() => {
                if (this.SetBossStop())
                    return;
                //
                //Hand R Ready
                this.m_baseBody.SetReady();
                this.m_baseHandL.SetIdle();
                let ReadyRDuration = this.m_baseHandR.SetReady(false);
                this.scheduleOnce(() => {
                    if (this.SetBossStop())
                        return;
                    //
                    //Hand R Attack
                    let AttackRDuration = this.m_baseBody.SetAttackR();
                    this.m_baseHandR.SetAttack();
                    this.scheduleOnce(() => {
                        if (this.SetBossStop())
                            return;
                        //
                        //Idle
                        this.m_baseBody.SetIdle();
                        this.m_baseHandR.SetIdle();
                        //Revert
                        this.scheduleOnce(() => {
                            this.SetBossActive();
                        }, this.m_attactStyle01DelayRevert);
                        //
                    }, AttackRDuration);
                    //Hand R Attack Move
                    this.SetBossStyle01HandRMove(AttackRDuration, 0.35, 0.25, 0.4, AttackMove);
                }, ReadyRDuration);
                //
            }, AttackLDuration);
            //Hand L Attack Move
            this.SetBossStyle01HandLMove(AttackLDuration, 0.35, 0.25, 0.4, AttackMove);
            //
        }, ReadyLDuration)
    }

    SetBossStyle01RL(AttackMove: boolean) {
        if (this.SetBossStop())
            return;
        //
        //Hand R Ready
        this.m_baseBody.SetReady();
        let ReadyRDuration = this.m_baseHandR.SetReady(false);
        this.scheduleOnce(() => {
            if (this.SetBossStop())
                return;
            //
            //Hand R Attack
            let AttackRDuration = this.m_baseBody.SetAttackR();
            this.m_baseHandR.SetAttack();
            this.scheduleOnce(() => {
                if (this.SetBossStop())
                    return;
                //
                //Hand L Ready
                this.m_baseBody.SetReady();
                let ReadyLDuration = this.m_baseHandL.SetReady(false);
                this.m_baseHandR.SetIdle();
                this.scheduleOnce(() => {
                    if (this.SetBossStop())
                        return;
                    //
                    //Hand L Attack
                    let AttackLDuration = this.m_baseBody.SetAttackL();
                    this.m_baseHandL.SetAttack();
                    this.scheduleOnce(() => {
                        if (this.SetBossStop())
                            return;
                        //
                        //Idle
                        this.m_baseBody.SetIdle();
                        this.m_baseHandL.SetIdle();
                        //Reset
                        this.scheduleOnce(() => {
                            this.SetBossActive()
                        }, this.m_attactStyle01DelayRevert);
                        //
                    }, AttackLDuration);
                    //Hand L Attack Move
                    this.SetBossStyle01HandLMove(AttackLDuration, 0.35, 0.25, 0.4, AttackMove);
                    //
                }, ReadyLDuration);
                //
            }, AttackRDuration);
            //Hand R Attack Move
            this.SetBossStyle01HandRMove(AttackRDuration, 0.35, 0.25, 0.4, AttackMove);
            //
        }, ReadyRDuration)
    }

    SetBossStyle01HandLMove(AttackDuration: number, RatioReady: number, RatioMove: number, RatioBack: number, AttackMove: boolean) {
        let PosBodyMoveX = AttackMove ? this.body.position.x + this.m_attackStyle01BodyMove : 0;
        //
        let PosHandLReadyX = this.m_baseHandLPos() - this.m_attackStyle01AttackReady;
        let PosHandLMoveX = this.m_baseHandLPos() + Math.abs(this.m_baseOffsetHandLPos) + 100 + (AttackMove ? this.m_attackStyle01AttackMoveHandFixed : 0);
        let PosHandLBackX = PosBodyMoveX + this.m_baseOffsetHandLPos;
        tween(this.handL)
            .to(AttackDuration * RatioReady, { position: v3(PosHandLReadyX, 0) })
            .call(() => this.SetBossStyle01BodyMove(AttackDuration * RatioMove, PosBodyMoveX))
            .call(() => this.m_baseHandL.SetHurt(this.bossHitPlayer))
            .to(AttackDuration * RatioMove, { position: v3(PosHandLMoveX, 0) })
            .call(() => this.m_baseHandL.SetHurt(false))
            .to(AttackDuration * RatioBack, { position: v3(PosHandLBackX, 0) })
            .start();
        //
        let PosHandRMoveX = PosBodyMoveX + this.m_baseOffsetHandRPos;
        tween(this.handR)
            .delay(AttackDuration * RatioReady)
            .to(AttackDuration * RatioMove, { position: v3(PosHandRMoveX, 0) })
            .start();
    }

    SetBossStyle01HandRMove(AttackDuration: number, RatioReady: number, RatioMove: number, RatioBack: number, AttackMove: boolean) {
        let PosBodyMoveX = AttackMove ? this.body.position.x - this.m_attackStyle01BodyMove : 0;
        //
        let PosHandRReadyX = this.m_baseHandRPos() + this.m_attackStyle01AttackReady;
        let PosHandRMoveX = this.m_baseHandRPos() - Math.abs(this.m_baseOffsetHandRPos) - 100 - (AttackMove ? this.m_attackStyle01AttackMoveHandFixed : 0);
        let PosHandRBackX = PosBodyMoveX + this.m_baseOffsetHandRPos;
        tween(this.handR)
            .to(AttackDuration * RatioReady, { position: v3(PosHandRReadyX, 0) })
            .call(() => this.SetBossStyle01BodyMove(AttackDuration * RatioMove, PosBodyMoveX))
            .call(() => this.m_baseHandR.SetHurt(this.bossHitPlayer))
            .to(AttackDuration * RatioMove, { position: v3(PosHandRMoveX, 0) })
            .call(() => this.m_baseHandR.SetHurt(false))
            .to(AttackDuration * RatioBack, { position: v3(PosHandRBackX, 0) })
            .start();
        //
        let PosHandLMoveX = PosBodyMoveX + this.m_baseOffsetHandLPos;
        tween(this.handL)
            .delay(AttackDuration * RatioReady)
            .to(AttackDuration * RatioMove, { position: v3(PosHandLMoveX, 0) })
            .start();
    }

    SetBossStyle01BodyMove(MoveDuration: number, PosMoveX: number) {
        tween(this.body)
            .to(MoveDuration, { position: v3(PosMoveX, 0) })
            .start();
        tween(this.effect)
            .to(MoveDuration, { position: v3(PosMoveX, 200) })
            .start();
    }
}