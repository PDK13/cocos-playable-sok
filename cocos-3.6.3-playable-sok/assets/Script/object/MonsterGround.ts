import { _decorator, AudioSource, CCFloat, Collider2D, Component, Contact2DType, director, ERigidBody2DType, find, IPhysics2DContact, Node, RigidBody2D, sp, tween, v2, v3, Vec2 } from 'cc';
import { PlayerController } from '../player/PlayerController';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('MonsterGround')
export class MonsterGround extends Component {

    @property(CCFloat)
    velocX = 100;

    @property(RigidBody2D)
    rigidbody: RigidBody2D = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(AudioSource)
    audio: AudioSource = null;

    @property(Node)
    effect: Node = null;

    m_isRight: boolean = false;
    m_stop: boolean = false;
    colliders: Collider2D[];
    m_player: Node = null;

    protected onLoad(): void {
        this.colliders = this.getComponents(Collider2D);
        if (this.colliders) {
            this.colliders.forEach(collider => {
                collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            })
        }
        this.node.on("onDead", this.onDead, this);
        this.m_player = find("RenderRoot2D").getComponentInChildren(PlayerController).node;
    }

    update(dt: number) {
        if (this.m_stop)
            return;
        let veloc = this.rigidbody.linearVelocity;
        if (this.m_isRight)
            veloc.x = this.velocX;
        else
            veloc.x = -this.velocX;
        this.rigidbody.linearVelocity = veloc;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_stop)
            return;
        let worldPos = this.node.worldPosition;
        switch (otherCollider.tag) {
            case -1://ground
                if (selfCollider.tag == 11)//left,right
                    this.updateDirection();
                break;
            case 100://player  
                let player = otherCollider.node.getComponent(PlayerController);
                if (player != null) {
                    let direction = worldPos.subtract(otherCollider.node.worldPosition);
                    if (player.isBig) {
                        this.m_stop = true;
                        this.rigidbody.sleep();
                        this.colliders.forEach(collider => {
                            collider.sensor = true;
                        })
                        this.audio.play();
                        let directMove = v3();
                        if (direction.x > 0)
                            directMove = v3(1, 1, 0);
                        else
                            directMove = v3(-1, 1, 0);
                        tween(this.node).to(1, { position: directMove.multiplyScalar(5000) }).call(() => { this.node.destroy() }).start();
                    } else {
                        if (selfCollider.tag == 12)//top
                        {
                            this.m_stop = true;
                            this.audio.play();
                            let entry = this.spine.setAnimation(0, 'dead', false);
                            this.rigidbody.sleep();
                            this.scheduleOnce(() => {
                                this.node.destroy();
                            }, entry.animationEnd);
                        } else {
                            let directionV2 = v2(direction.x, direction.y);
                            director.emit(GameEvent.PLAYER_HURT);
                            if (!player.IgnoreKnockBack)
                                player.addForce(directionV2.normalize().multiplyScalar(-100));
                            //
                            if (selfCollider.tag == 11)//left,right                            
                                this.updateDirection();
                        }
                    }
                }
                break;
        }
    }

    updateDirection() {
        this.m_isRight = !this.m_isRight;
        let scale = this.node.getScale();
        scale.x = this.m_isRight ? 1 : -1;
        this.node.scale = scale;
    }

    onDead() {
        if (this.m_stop)
            return;
        //
        this.rigidbody.sleep();
        this.rigidbody.gravityScale = 0;
        this.colliders.forEach(collider => {
            collider.enabled = false;
        })
        //
        let direction = this.m_player.worldPosition.x < this.node.worldPosition.x ? 1 : -1;
        let effect = this.effect;
        effect.setParent(this.node.parent, true);
        effect.setScale(v3(direction, 1, 1));
        effect.active = true;
        let effAnim = effect.getComponent(sp.Skeleton);
        let effEntry = effAnim.setAnimation(0, "animation", false);
        setTimeout(() => {
            effect.destroy();
        }, effEntry.animationEnd * 1000);
        this.m_stop = true;
        let entry = this.spine.setAnimation(0, 'dead', false);
        setTimeout(() => {
            this.node.destroy();
        }, entry.animationEnd * 1000);
    }
}