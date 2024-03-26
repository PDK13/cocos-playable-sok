import { _decorator, Camera, CCFloat, Component, director, Node, Tween, tween, v3, Vec2, Vec3 } from 'cc';
import { BackgroundParallax } from '../game/BackgroundParallax';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('CameraCutscene')
export class CutsceneCamera extends Component {
    @property(CCFloat)
    smoothTime = 0.1;

    @property(Node)
    background: Node | null = null;

    @property([BackgroundParallax])
    parallaxes: BackgroundParallax[] = [];
 
    m_finishPos: Vec3;
    m_targetY: number = 0;

    start()
    {
        let cam = this.getComponent(Camera);
        let ratio = 540/cam.orthoHeight;
        this.background.scale = new Vec3(2/ratio, 2/ratio, 1);
    }

    lateUpdate(dt: number)
    { 
        this.parallaxes.forEach(element => {
            element.excute();
        });
    }

    public SetPos(Pos: Vec2){
        this.node.position = v3(Pos.x, Pos.y, this.node.position.z);
    }

    public SetMove(Pos: Vec2, Duration: number, Delay: number, Option: object = { easing: 'linear' }) {
        tween(this.node)
            .delay(Delay)
            .to(Duration, { position: v3(Pos.x, Pos.y, this.node.position.z) }, Option)
            .start();
    }
}