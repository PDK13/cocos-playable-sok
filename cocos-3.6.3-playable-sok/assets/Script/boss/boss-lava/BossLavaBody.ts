import { _decorator, AudioSource, CCFloat, CCInteger, CCString, Component, instantiate, Node, sp, v3 } from 'cc';
import { BossLavaHand } from './BossLavaHand';
import { BossLava } from './BossLava';
const { ccclass, property } = _decorator;

@ccclass('BossLavaBody')
export class BossLavaBody extends Component {
    @property(CCFloat)
    delayHurt = 1;

    @property(CCString)
    animIdle: string = "idle";

    @property(CCString)
    animReady: string = "skill_3_ready";

    @property(CCString)
    animAttackL: string = "skill_3_at_L";

    @property(CCString)
    animAttackR: string = "skill_3_at_R";

    //

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    //

    @property(Node)
    effect: Node = null;

    @property(AudioSource)
    audio: AudioSource = null;

    //

    m_stop: boolean = false;
    m_hurt: boolean = false;

    protected onLoad(): void {
        //
        this.node.on("onHurt", this.onHurt, this);
        this.node.on("onStop", this.onStop, this);
    }

    onHurt() {
        if (this.m_stop)
            return;
        //
        if (this.m_hurt)
            return;
        //
        this.m_hurt = true
        setTimeout(() => {
            this.m_hurt = false
        }, this.delayHurt * 1000);
        //
        let effect = instantiate(this.effect);
        effect.active = true;
        effect.setParent(this.node.parent, true);
        effect.position = this.effect.position;
        effect.setScale(v3(1, 1, 1));
        effect.active = true;
        let effAnim = effect.getComponent(sp.Skeleton);
        let effEntry = effAnim.setAnimation(0, "animation", false);
        setTimeout(() => {
            effect.destroy();
        }, effEntry.animationEnd * 1000);
        //
        this.node.parent.emit("onHurt");
    }

    onStop() {
        this.m_stop = true;
    }

    //

    public SetIdle(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animIdle, true).animationEnd / (primary ? 1 : this.spine.timeScale);
    }

    public SetReady(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animReady, true).animationEnd / (primary ? 1 : this.spine.timeScale);
    }

    public SetAttackL(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animAttackL, false).animationEnd / (primary ? 1 : this.spine.timeScale);
    }

    public SetAttackR(primary: boolean = true): number {
        return this.spine.setAnimation(0, this.animAttackR, false).animationEnd / (primary ? 1 : this.spine.timeScale);
    }
}