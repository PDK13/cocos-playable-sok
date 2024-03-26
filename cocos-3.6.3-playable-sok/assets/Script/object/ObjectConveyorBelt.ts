import { _decorator, CCBoolean, CCFloat, Component, Node, Quat, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectConveyorBelt')
export class ObjectConveyorBelt extends Component {
    @property(Node)
    rope: Node = null;

    @property(CCFloat)
    ropeLengthPrimary: number = 100;

    @property(CCFloat)
    ropeRepeatDuration: number = 3;

    @property(CCBoolean)
    ropeUp: boolean = true;

    @property(CCFloat)
    forcePlayer: number = 15;

    @property(CCBoolean)
    leftToRight: boolean = true;

    @property([Node])
    wheels: Node[] = [];

    @property(CCFloat)
    wheelsSpeedRatio: number = 1;

    public readonly ToRight: boolean = this.leftToRight;
    public readonly ToLeft: boolean = !this.leftToRight;
    public readonly ForceMove: number = this.forcePlayer;

    protected start(): void {
        this.SetRopeRepeat();
        //
        let WheelIndex = 0;
        while(WheelIndex < this.wheels.length){
            this.SetWheelRotate(WheelIndex);
            WheelIndex++;
        }
    }

    SetRopeRepeat() {
        this.rope.position = v3(this.rope.position.x, 0, 0);
        tween(this.rope)
            .to(this.ropeRepeatDuration, { position: v3(this.rope.position.x, this.ropeLengthPrimary, 0) })
            .call(() => this.SetRopeRepeat())
            .start();
    }

    SetWheelRotate(Index: number) {
        let Rotate = v3(0, 0, this.wheels[Index].eulerAngles.z + (this.ropeUp ? -1 : 1));
        //
        if (Rotate.z >= 360 || Rotate.z <= -360)
            Rotate = v3(0, 0, 0);
        //
        tween(this.rope)
            .call(() => this.wheels[Index].setRotationFromEuler(Rotate))
            .delay(0.02 * this.wheelsSpeedRatio)
            .call(() => this.SetWheelRotate(Index))
            .start();
    }
}