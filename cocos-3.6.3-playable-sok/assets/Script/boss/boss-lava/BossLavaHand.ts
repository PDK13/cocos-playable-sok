import { _decorator, AudioSource, CCString, Collider2D, Component, Contact2DType, director, find, instantiate, IPhysics2DContact, Node, RigidBody2D, sp, tween, v2, v3 } from 'cc';
import { PlayerController } from '../../player/PlayerController';
import GameEvent from '../../GameEvent';
import GameTag from '../../GameTag';
const { ccclass, property } = _decorator;

@ccclass('BossLavaHand')
export class BossLavaHand extends Component {

    @property(CCString)
    animIdle: string = "idle";

    @property(CCString)
    animReady: string = "skill_3_ready";

    @property(CCString)
    animAttack: string = "skill_3";

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    //

    m_stop: boolean = false;
    m_hurt: boolean = false;
    m_collider: Collider2D = null;

    protected onLoad(): void {
        this.m_collider = this.getComponent(Collider2D);
        if (this.m_collider) {
            this.m_collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        this.m_collider.enabled = false;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_stop)
            return;
        //
        if (!this.m_hurt)
            return;
        //
        let worldPos = this.node.worldPosition;
        switch (otherCollider.tag) {
            case GameTag.PLAYER:
                let direction = worldPos.subtract(otherCollider.node.worldPosition);
                let directionV2 = v2(direction.x, direction.y);
                let player = otherCollider.node.getComponent(PlayerController);
                if (player != null) {
                    if (player.isBig) {
                        this.getComponent(RigidBody2D).sleep();
                        this.getComponent(Collider2D).sensor = true;
                        let directMove = v3();
                        if (direction.x > 0)
                            directMove = v3(1, 1, 0);
                        else
                            directMove = v3(-1, 1, 0);
                        tween(this.node).to(1, { position: directMove.multiplyScalar(5000) }).call(() => { this.node.destroy() }).start();
                    }
                    else {
                        director.emit(GameEvent.PLAYER_HURT);
                        player.addForce(directionV2.normalize().multiplyScalar(-100));
                    }
                }
                break;
        }
    }

    onStop() {
        this.m_stop = true;
    }

    //

    public SetHurt(Hurt: boolean) {
        if (this.m_stop){
            this.m_hurt = false;
            this.m_collider.enabled = false;
            return;
        }
        //
        this.m_hurt = Hurt;
        this.m_collider.enabled = Hurt;
    }

    //

    public SetIdle(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animIdle, true).animationEnd / (primary ? 1 : this.spine.timeScale);
    }

    public SetReady(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animReady, false).animationEnd / (primary ? 1 : this.spine.timeScale);
    }

    public SetAttack(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animAttack, false).animationEnd / (primary ? 1 : this.spine.timeScale);
    }
}