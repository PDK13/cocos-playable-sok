import { _decorator, Component, sp, tween, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CutsceneObject')
export class CutsceneObject extends Component {
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    m_spineScaleX: number;

    public SpineInfiniteLoop: boolean = true;

    protected onLoad(): void {
        this.m_spineScaleX = this.spine._skeleton.scaleX;
    }

    public SetAnim(Anim: string, Loop: boolean, DurationScale: boolean = false): number {
        return this.spine.setAnimation(0, Anim, Loop).animationEnd / (DurationScale ? this.spine.timeScale : 1);
    }

    public SetAnimInfiniteLoop(Anim1: string, Anim2: string, DurationScale: boolean = false, Anim1First: boolean = true) {
        if (!this.SpineInfiniteLoop)
            //NOTE: IF WANT TO STOP CURRENT AND START NEW, SET THIS VALUE TO FALSE FIRST!
            return;
        //WARNING: AFTER USE THIS METHODE, INFINITE LOOP WILL BE OCCUR!
        this.scheduleOnce(() => {
            this.SetAnimInfiniteLoop(Anim1, Anim2, DurationScale, !Anim1First)
        }, this.SetAnim(Anim1First ? Anim1 : Anim2, false, DurationScale));
    }

    public SetTimeScale(TimeScale: number = 1) {
        this.spine.timeScale = TimeScale;
    }

    //

    public SetFaceL() {
        this.spine._skeleton.scaleX = -this.m_spineScaleX;
    }

    public SetFaceR() {
        this.spine._skeleton.scaleX = this.m_spineScaleX;
    }

    public SetPos(Pos: Vec2) {
        this.node.position = v3(Pos.x, Pos.y, this.node.position.z);
    }

    public SetMove(Pos: Vec2, Duration: number, Delay: number, Option: object = { easing: 'linear' }) {
        tween(this.node)
            .delay(Delay)
            .to(Duration, { position: v3(Pos.x, Pos.y, this.node.position.z) }, Option)
            .start();
    }
}