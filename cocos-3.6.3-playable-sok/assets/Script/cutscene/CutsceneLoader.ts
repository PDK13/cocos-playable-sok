import { _decorator, Button, CCBoolean, CCInteger, CCString, Component, director, game, Input, Node, PhysicsSystem2D, sys, tween, v3 } from 'cc';
import GameEvent from '../GameEvent';
import Loader from '../Loader';
const { ccclass, property } = _decorator;

@ccclass('CutsceneLoader')
export class CutsceneLoader extends Component {
    @property(CCBoolean)
    loop = false;

    @property(CCBoolean)
    directStore = false;

    @property(CCString)
    androidLink = "";

    @property(CCString)
    iosLink = "";

    @property(CCInteger)
    adsType = 0;

    @property([Node])
    buttonInput: Node[] = [];

    static finish: boolean = false;
    fired: boolean = false;

    onLoad() {
        game.frameRate = 59;
        director.on(GameEvent.GAME_FINISH, this.onFinish, this);
        director.on(GameEvent.GAME_STORE_OPEN, this.retryOnclick, this);
        if (this.directStore || Loader.finish) {
            this.buttonInput.forEach(e => {
                e.active = e.getComponent(Button).interactable = false;
            });
            this.node.on(Input.EventType.TOUCH_START, this.retryOnclick, this);
        }
        else {
            this.buttonInput.forEach(e => {
                e.on(Input.EventType.TOUCH_START, this.onCutsceneContinue, this);
            });
        }
        //
        PhysicsSystem2D.instance.enable = false;
    }

    onFinish() {
        if (this.loop) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
    }

    onCutsceneContinue() {
        director.emit(GameEvent.CUTSCENE_CONTINUE);
    }

    retryOnclick() {
        console.log("[Debug] Finish!");
        let link = '';
        switch (sys.os) {
            case sys.OS.ANDROID:
                link = this.androidLink;
                break;
            case sys.OS.IOS:
                link = this.iosLink;
                break;
            default:
                link = this.androidLink;
                break;
        }
        openGameStoreUrl(link);
    }
}