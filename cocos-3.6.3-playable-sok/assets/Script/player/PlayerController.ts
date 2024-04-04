import { _decorator, Node, AudioSource, Component, Vec2, director, RigidBody2D, Vec3, Enum, tween, v3, CCFloat, sp, PhysicsSystem2D, ERaycast2DType, v2, Contact2DType, Collider2D, IPhysics2DContact, __private, CCString, CCBoolean, CCInteger, Label } from 'cc';
import GameEvent from '../GameEvent';
import Loader from '../Loader';
import GameTag from '../GameTag';
import { ObjectConveyorBelt } from '../object/ObjectConveyorBelt';
import { BaseSpineCustom } from '../base/BaseSpineCustom';
import { BaseObject } from '../base/BaseObject';
import { BaseSpine } from '../base/BaseSpine';
const { ccclass, property } = _decorator;
const { spine } = sp;
var PlayerState;

PlayerState = Enum({
    Idle: 0,
    Move: 1,
    Jump: 2,
    Air: 3,
    Hurt: 4,
    Fight: 5,
    SmashDownReady: 6,
    SmashDownLoop: 7,
    SmashDownGround: 8,
    SmashDownEnd: 9,
});


@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(CCString)
    animIdle: string = 'idle';

    @property(CCString)
    animMove: string = "run";

    @property(CCString)
    animUp: string = 'jump1_up';

    @property(CCString)
    animJump: string = "jump2_loop";

    @property(CCString)
    animLand: string = "jump6_down_end";

    @property(CCString)
    animAttackGround: string = "attack_1";

    @property(CCString)
    animAttackSwitch: string = "attack_1";

    @property(CCString)
    animAttackAir: string = "attack_jump_1";

    @property(CCString)
    animSmashDownReady: string = "attack_1";

    @property(CCString)
    animSmashDownLoop: string = "attack_jump_1";

    @property(CCString)
    animWall: string = "bam_tuong_down";

    @property(CCString)
    animHit: string = 'hit';

    spine: BaseSpineCustom = null;

    //

    @property(CCBoolean)
    attackSmashDown = false;

    @property(CCBoolean)
    attackNotJump = false;

    @property(CCBoolean)
    attackNotMove = false;

    @property(CCBoolean)
    attackSwitchEach = false;

    @property(CCBoolean)
    noneContinueX = false;

    @property(CCBoolean)
    conveyorBeltHold = false;

    //

    @property(CCBoolean)
    playerProtect = true;

    @property(CCInteger)
    playerHealth = 3;

    //

    @property(CCBoolean)
    autoRun = false;

    @property(CCFloat)
    xDamping = 40;

    @property(CCFloat)
    airSpeedX = 200;

    @property(CCFloat)
    maxSpeedX = 1000;

    @property(CCFloat)
    jumpForce = 1000;

    @property(RigidBody2D)
    rigidbody: RigidBody2D = null;

    @property(Label)
    healthCount: Label = null;

    @property(BaseObject)
    smashDownEffect: BaseObject = null;

    @property(BaseSpine)
    smashDownEffectSpine: BaseSpine = null;

    @property(AudioSource)
    jumpAudio: AudioSource = null;

    @property(AudioSource)
    hurtAudio: AudioSource = null;

    @property(AudioSource)
    finishAudio: AudioSource = null;

    m_targets: TargetData[] = [];
    m_targetsSmashDownAir: TargetData[] = [];
    m_targetsSmashDownGround: TargetData[] = [];

    m_state: typeof PlayerState = PlayerState.Idle;
    //
    m_baseScale: Vec3;
    m_spineScaleX: number;
    m_baseMass: number;
    m_ratioSize: number;
    //
    m_waitFinish: boolean = false;
    m_finishPos: Vec3 = v3();
    m_finish: boolean = false;
    //
    m_grounded: boolean = false;
    m_moveDirection: number = 0;
    m_hurt: boolean = false;
    //
    m_lockInput: boolean = false;
    m_lockJump: boolean = false;
    //
    m_fight: boolean = false;
    m_fightSwitch: number = 0;
    //
    m_smashDownActive: boolean = false;
    m_smashDownHit: boolean = false;
    //
    m_conveyorBelt: ObjectConveyorBelt = null;
    m_conveyorBeltActive: boolean = false;

    public IgnoreKnockBack: boolean = false;

    get isBig() {
        return this.m_ratioSize > 1;
    }

    onLoad() {
        this.spine = this.getComponent(BaseSpineCustom);
        //
        this.m_baseScale = this.node.scale.clone();
        this.m_ratioSize = 1;
        //
        director.on(GameEvent.PLAYER_JUMP, this.onJump, this);
        director.on(GameEvent.PLAYER_FIRE, this.onFire, this);
        director.on(GameEvent.PLAYER_SMASH_DOWN, this.onSmashDown, this);
        director.on(GameEvent.PLAYER_MOVE_LEFT, this.onPlayerMoveLeft, this);
        director.on(GameEvent.PLAYER_MOVE_RIGHT, this.onPlayerMoveRight, this);
        director.on(GameEvent.PLAYER_MOVE_STOP, this.onPlayerMoveStop, this);
        director.on(GameEvent.PLAYER_STOP, this.onPlayerStop, this);
        director.on(GameEvent.PLAYER_HURT, this.onHurt, this);
        director.on(GameEvent.PLAYER_X4, this.onX4, this);
        //
        //physic    
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c => {
            c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            c.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        })
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     //PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // }
        //
        //Health
        if (this.playerProtect)
            this.healthCount.node.parent.active = false;
        else
            this.healthCount.string = this.playerHealth.toString();
    }

    start() {
        this.m_baseMass = this.rigidbody.getMass();
        //
        this.m_spineScaleX = this.spine.GetFace();
        if (this.autoRun && !Loader.finish)
            this.onPlayerMoveRight();
    }

    onX4(active: boolean) {
        let ratio = active ? 4 : 1;
        tween(this.node).to(0.25, { scale: this.m_baseScale.multiplyScalar(ratio) }).start();
        this.m_ratioSize = ratio;
    }

    onJump() {
        if (this.m_finish || !this.m_grounded || this.m_lockInput || this.m_lockJump)
            return;
        //
        if (this.attackNotJump && this.m_state == PlayerState.Fight)
            return;
        //
        if (this.m_smashDownActive)
            return;
        //
        if (this.m_conveyorBeltActive)
            return;
        //
        this.m_lockJump = true;
        this.jumpAudio.play();
        this.m_grounded = false;
        let veloc = this.rigidbody.linearVelocity;
        veloc.y = this.jumpForce;
        this.rigidbody.linearVelocity = veloc;
        //
        var Duration = this.spine.SetAnim(this.animUp, false);
        setTimeout(() => {
            this.m_lockJump = false;
        }, Duration);
    }

    onFire(active: boolean) {
        if (this.m_finish ||
            this.m_hurt ||
            this.m_fight ||
            this.m_smashDownActive ||
            this.m_conveyorBeltActive)
            return;
        this.fire();
    }

    fire() {
        this.rigidbody.wakeUp();
        this.m_state = PlayerState.Fight;
        this.m_fight = true;
        //
        let AnimAttack = this.animAttackGround;
        if (this.m_grounded)
            AnimAttack = this.m_fightSwitch == 0 ? this.animAttackGround : this.animAttackSwitch;
        else
            AnimAttack = this.animAttackAir;
        //
        var Duration = this.spine.SetAnim(AnimAttack, false);
        this.scheduleOnce(() => {
            this.m_fight = false;
        }, Duration);
        //
        if (this.m_grounded) {
            if (this.attackSwitchEach)
                this.m_fightSwitch = this.m_fightSwitch == 0 ? 1 : 0;
        }
    }

    onSmashDown(active: boolean) {
        if (!this.attackSmashDown ||
            this.m_finish ||
            this.m_hurt ||
            this.m_fight ||
            this.m_smashDownActive ||
            this.m_conveyorBeltActive)
            return;
        this.smashDown();
    }

    smashDown() {
        this.rigidbody.sleep();
        this.m_state = PlayerState.SmashDownReady;
        this.m_smashDownActive = true;
        this.m_smashDownHit = false;
        var DurationReady = this.spine.SetAnim(this.animSmashDownReady, false);
        this.scheduleOnce(() => {
            var DurationLoop = this.spine.SetAnim(this.animSmashDownLoop, true);
            this.scheduleOnce(() => {
                this.m_smashDownHit = true;
                this.rigidbody.wakeUp();
                this.m_state = PlayerState.SmashDownLoop;
            }, DurationLoop);
        }, DurationReady);
        this.IgnoreKnockBack = true;
        //
        this.smashDownEffectReady();
    }

    smashDownEffectReady() {
        this.smashDownEffect.node.active = true;
        this.smashDownEffect.SetPosV3(v3(0, 150, 0), this.node.position.clone());
        this.smashDownEffectSpine.SetAnim("1", false);
    }
    smashDownEffectGround() {
        this.smashDownEffect.node.active = true;
        this.smashDownEffect.SetPosV3(v3(0, 0, 0), this.node.position.clone());
        this.smashDownEffectSpine.SetAnim("2", false);
    }

    onHurt() {
        if (this.m_hurt)
            return;
        //
        if (this.playerHealth == 0)
            return;
        //
        if (this.m_smashDownActive)
            return;
        //
        //Health
        if (!this.playerProtect) {
            this.playerHealth--;
            this.healthCount.string = this.playerHealth.toString();
        }
        //
        this.m_fight = false;
        this.m_smashDownActive = false;
        this.m_smashDownHit = false;
        this.m_state = PlayerState.Hurt;
        this.m_hurt = true;
        this.m_lockInput = true;
        var Duration = this.spine.SetAnim(this.animHit, false);
        this.hurtAudio.play();
        this.scheduleOnce(() => {
            this.m_lockInput = false;
            this.m_hurt = false;
            //
            if (!this.playerProtect && this.playerHealth == 0) {
                this.onDead();
            }
        }, Duration);
    }

    onDead() {
        director.emit(GameEvent.GAME_LOSE);
        //Character Skull haven't anim Dead!
        return;
        //
        var Duration = this.spine.SetAnim('dead', false);
        this.scheduleOnce(() => {
            director.emit(GameEvent.GAME_LOSE);
        }, Duration);
    }

    onPlayerMoveLeft() {
        if (this.m_finish || this.m_smashDownActive)
            return;
        //
        if (this.attackNotMove && this.m_state == PlayerState.Fight)
            return;
        //
        if (this.m_conveyorBelt != null) {
            if (this.m_conveyorBelt.ToLeft) {
                this.m_moveDirection = 0;
                this.m_conveyorBeltActive = true;
                //
                let Pos = this.node.position.clone();
                Pos.x = this.m_conveyorBelt.node.position.x;
                this.node.position = Pos;
                //
                this.spine.SetAnim(this.animWall, true);
                this.spine.SetFace(this.m_spineScaleX);
                //
                return;
            }
            else {
                this.m_conveyorBeltActive = false;
                //
                if (!this.m_grounded)
                    this.spine.SetAnim(this.animJump, true);
                //
            }
        }
        //
        this.m_moveDirection = -1;
        this.spine.SetFace(-this.m_spineScaleX);
    }

    onPlayerMoveRight() {
        if (this.m_finish || this.m_smashDownActive)
            return;
        //
        if (this.attackNotMove && this.m_state == PlayerState.Fight)
            return;
        //
        if (this.m_conveyorBelt != null) {
            if (this.m_conveyorBelt.ToRight) {
                this.m_moveDirection = 0;
                this.m_conveyorBeltActive = true;
                //
                let Pos = this.node.position.clone();
                Pos.x = this.m_conveyorBelt.node.position.x;
                this.node.position = Pos;
                //
                this.spine.SetAnim(this.animWall, true);
                this.spine.SetFace(-this.m_spineScaleX);
                //
                return;
            }
            else {
                this.m_conveyorBeltActive = false;
                //
                if (!this.m_grounded)
                    this.spine.SetAnim(this.animJump, true);
            }
        }
        //
        this.m_moveDirection = 1;
        this.spine.SetFace(this.m_spineScaleX);
    }

    onPlayerMoveStop() {
        this.m_moveDirection = 0;
        if (!this.conveyorBeltHold && this.m_conveyorBeltActive) {
            this.m_conveyorBeltActive = false;
            let veloc = this.rigidbody.linearVelocity.clone();
            veloc.x = 0;
            this.rigidbody.linearVelocity = veloc;
        }
        else {
            let veloc = this.rigidbody.linearVelocity.clone();
            veloc.x = 0;
            this.rigidbody.linearVelocity = veloc;
        }
    }

    onPlayerStop(position: Vec3) {
        this.spine.SetAnim(this.animMove, true);
        this.finishAudio.play();
        this.m_finishPos = position;
        this.m_waitFinish = true;
        this.m_finish = true;
        this.m_lockInput = true;
    }

    update(dt: number) {
        //Check Ground!
        this.onCheckGround();
        //
        if (this.m_waitFinish) {
            if (this.m_grounded) {
                this.m_waitFinish = false;
                this.finish();
            }
        }
        //
        if (this.m_finish)
            return;
        //
        if (this.m_state == PlayerState.Fight) //Attack
        {
            this.m_targets.forEach(e => {
                if (e != null)
                    if (!e.mark) {
                        e.target.emit("onDead");
                        e.target.emit("onHurt");
                    }
            })
        }
        //
        if (this.m_smashDownActive) //Attack Smash Down
        {
            if (this.m_smashDownHit) {
                this.m_targetsSmashDownAir.forEach(e => {
                    if (e != null)
                        if (!e.mark) {
                            e.target.emit("onDead");
                            e.target.emit("onHurt");
                        }
                })
            }
            if (this.m_grounded && this.m_state == PlayerState.SmashDownGround) {
                this.m_targetsSmashDownGround.forEach(e => {
                    if (e != null)
                        if (!e.mark) {
                            e.target.emit("onDead");
                            e.target.emit("onHurt");
                        }
                })
            }
        }
        //
        if (this.m_lockInput)
            return;
        //
        if (this.m_conveyorBeltActive) {
            director.emit(GameEvent.PLAYER_GROUND, this.node.position.y);
            this.rigidbody.linearVelocity = v2(0, this.m_conveyorBelt.ForceMove);
        }
        //
        this.onMoveVel(dt);
        //
        this.updateState();
    }

    onCheckGround(OffsetX: number = 0): boolean {
        let p1 = this.node.getWorldPosition().add(v3(OffsetX, 10));
        let p2 = p1.clone().subtract(v3(OffsetX, 10, 0));
        const results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Any);
        if (results.length < 1) {
            //Not collide with any collision!
            this.m_grounded = false;
        }
        else {
            //Collide with aleast 1 collision!
            if (this.m_smashDownActive) {
                //Smash down in current active!
                for (let i = 0; i < results.length; i++) {
                    if (results[i].collider.tag == GameTag.GROUND_BREAK) {
                        results[i].collider.node.active = false;
                        //
                        this.smashDownEffectGround();
                        //
                        break;
                    }
                    else
                        if (results[i].collider.tag == GameTag.GROUND) //Ground
                        {
                            this.m_grounded = true;
                            director.emit(GameEvent.PLAYER_GROUND, p1.y);
                            break;
                        }
                        else
                            this.m_grounded = false;
                }
            }
            else {
                //Normally!
                for (let i = 0; i < results.length; i++) {
                    if (results[i].collider.tag == GameTag.GROUND ||
                        results[i].collider.tag == GameTag.GROUND_BREAK) //Ground
                    {
                        this.m_grounded = true;
                        director.emit(GameEvent.PLAYER_GROUND, p1.y);
                        break;
                    }
                    else
                        this.m_grounded = false;
                }
            }
        }
        return this.m_grounded;
    }

    onMoveVel(dt: number) {
        if (this.m_smashDownActive)
            return;
        //
        if (this.attackNotMove && this.m_state == PlayerState.Fight) {
            this.rigidbody.linearVelocity = v2(1 * this.m_moveDirection, this.rigidbody.linearVelocity.y);
            return;
        }
        //
        if (this.noneContinueX) {
            if (this.m_moveDirection == 0) {
                //Progess for poligon body collsion!
                this.rigidbody.linearVelocity = v2(0, this.rigidbody.linearVelocity.y);
                return;
            }
        }
        //
        let veloc = this.rigidbody.linearVelocity.clone();
        let current = veloc.clone();
        veloc.x += this.m_moveDirection * this.airSpeedX;
        if (veloc.x > this.maxSpeedX)
            veloc.x = this.maxSpeedX;
        else if (veloc.x < -this.maxSpeedX)
            veloc.x = -this.maxSpeedX;
        this.rigidbody.linearVelocity = current.lerp(veloc, this.xDamping * dt);
    }

    finish() {
        let time = Math.abs(this.node.worldPosition.x - this.m_finishPos.x) / 1000;
        tween(this.node).to(time, { position: this.m_finishPos }).call(() => {
            this.spine.SetAnim('win', false);
        }).delay(2).call(() => {
            director.emit(GameEvent.GAME_FINISH);
        }).start();
    }

    addForceY(force: number) {
        let veloc = this.rigidbody.linearVelocity;
        veloc.y = force;
        this.rigidbody.linearVelocity = veloc;
        //
        this.m_grounded = false;
    }

    addForce(force: Vec2) {
        this.rigidbody.linearVelocity = force;
    }

    updateState() {
        if (this.m_conveyorBeltActive)
            this.updateStateConveyorBelt();
        else
            if (this.m_smashDownActive)
                this.updateStateSmashDown();
            else
                this.updateStateNormal();
    }

    updateStateConveyorBelt() {
        //...
    }

    updateStateNormal() {
        let state = PlayerState.Idle;
        //find state
        if (this.m_hurt || this.m_fight)
            return;
        if (this.m_grounded) {
            if (this.m_moveDirection == 0)
                state = PlayerState.Idle;
            else
                state = PlayerState.Move;
        }
        else {
            if (this.m_lockJump)
                state = PlayerState.Jump;
            else
                state = PlayerState.Air;
        }
        //update state
        if (this.m_state == state)
            return;
        this.unschedule(this.onTransitionIdle);
        switch (state) {
            case PlayerState.Idle:
                if (this.m_state == PlayerState.Air) {
                    var Duration = this.spine.SetAnim(this.animLand, false);
                    this.scheduleOnce(this.onTransitionIdle, Duration);
                }
                else
                    this.spine.SetAnim(this.animIdle, true);
                break;
            case PlayerState.Move:
                this.spine.SetAnim(this.animMove, true);
                break;
            case PlayerState.Jump:
                break;
            case PlayerState.Air:
                this.spine.SetAnim(this.animJump, true);
                break;
            case PlayerState.Hurt:
                break;
        }
        this.m_state = state;
    }

    updateStateSmashDown() {
        switch (this.m_state) {
            case PlayerState.SmashDownReady:
                //...
                break;
            case PlayerState.SmashDownLoop: //Attack
                if (this.m_grounded) {
                    this.m_state = PlayerState.SmashDownGround;
                    this.scheduleOnce(() => {
                        this.m_state = PlayerState.SmashDownEnd;
                    }, 0.1);
                    //
                    this.smashDownEffectGround();
                }
                break;
            case PlayerState.SmashDownEnd:
                this.spine.SetAnim(this.animIdle, true);
                this.m_state = PlayerState.Idle;
                this.m_smashDownActive = false;
                this.m_smashDownHit = false;
                this.IgnoreKnockBack = false;
                break;
        }
    }

    onTransitionIdle() {
        this.spine.SetAnim(this.animIdle, true);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag == GameTag.PLAYER) {
            //Body Player contact with Trigger!
            switch (otherCollider.tag) {
                case GameTag.TRIGGER_JUMP: //Trigger jump
                    this.onJump();
                    setTimeout(() => {
                        director.emit(GameEvent.GAME_TRIGGER_FIRE);
                        this.onPlayerMoveStop();
                        this.rigidbody.sleep();
                    }, 150);
                    setTimeout(() => {
                        otherCollider.node.destroy();
                    }, 1);
                    break;
                case GameTag.TRIGGER_JUMP_SMASH_DOWN: //Trigger jump smash down
                    this.onJump();
                    setTimeout(() => {
                        director.emit(GameEvent.GAME_TRIGGER_SMASH_DOWN);
                        this.onPlayerMoveStop();
                        this.rigidbody.sleep();
                    }, 260);
                    setTimeout(() => {
                        otherCollider.node.destroy();
                    }, 1);
                    break;
                case GameTag.TRIGGER_OBJ_CONVEYOR_BELT: //Trigger obj conveyor belt
                    this.m_conveyorBelt = otherCollider.getComponent(ObjectConveyorBelt);
                    break;
                case GameTag.TRIGGER_BOSS_DUMMY: //Trigger boss dummy
                    director.emit(GameEvent.TRIGGER_BOSS_DUMMY);
                    this.onPlayerMoveRight();
                    setTimeout(() => {
                        this.onJump();
                    }, 100);
                    setTimeout(() => {
                        director.emit(GameEvent.GAME_STORE_BUTTON);
                        this.onPlayerMoveStop();
                        this.rigidbody.sleep();
                    }, 250);
                    setTimeout(() => {
                        otherCollider.node.destroy();
                    }, 1);
                    break;
            }
        }
        //
        if (selfCollider.tag == GameTag.PLAYER_ATTACK) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let target: TargetData = new TargetData();
                    target.target = otherCollider.node;
                    target.mark = false;
                    this.m_targets.push(target);
                    break;
            }
        }
        if (selfCollider.tag == GameTag.PLAYER_ATTACK_SMASH_DOWN_AIR) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let target: TargetData = new TargetData();
                    target.target = otherCollider.node;
                    target.mark = false;
                    this.m_targetsSmashDownAir.push(target);
                    break;
            }
        }
        if (selfCollider.tag == GameTag.PLAYER_ATTACK_SMASH_DOWN_GROUND) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let target: TargetData = new TargetData();
                    target.target = otherCollider.node;
                    target.mark = false;
                    this.m_targetsSmashDownGround.push(target);
                    break;
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag == GameTag.PLAYER) {
            //Body Player contact with Trigger!
            switch (otherCollider.tag) {
                case GameTag.TRIGGER_OBJ_CONVEYOR_BELT: //Trigger obj conveyor belt
                    this.m_conveyorBelt = null;
                    this.m_conveyorBeltActive = false;
                    break;
            }
        }
        //
        if (selfCollider.tag == GameTag.PLAYER_ATTACK) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let index = this.m_targets.findIndex((o) => otherCollider.node == o.target);
                    if (index > -1)
                        this.m_targets.splice(index, 1);
                    break;
            }
        }
        if (selfCollider.tag == GameTag.PLAYER_ATTACK_SMASH_DOWN_AIR) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let index = this.m_targetsSmashDownAir.findIndex((o) => otherCollider.node == o.target);
                    if (index > -1)
                        this.m_targetsSmashDownAir.splice(index, 1);
                    break;
            }
        }
        if (selfCollider.tag == GameTag.PLAYER_ATTACK_SMASH_DOWN_GROUND) {
            switch (otherCollider.tag) {
                case GameTag.MONSTER:
                case GameTag.MONSTER_HIT:
                    let index = this.m_targetsSmashDownGround.findIndex((o) => otherCollider.node == o.target);
                    if (index > -1)
                        this.m_targetsSmashDownGround.splice(index, 1);
                    break;
            }
        }
    }
}

export class TargetData {
    target: Node;
    mark: boolean;
}