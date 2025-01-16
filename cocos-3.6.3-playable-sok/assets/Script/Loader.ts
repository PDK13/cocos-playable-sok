import { _decorator, Component, PhysicsSystem2D, v2, Node, game, director, tween, v3, CCString, sys, Enum, CCBoolean, Input, Button, Label } from 'cc';
import GameEvent from './GameEvent';
import { CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loader')
export default class Loader extends Component {

    @property(CCBoolean)
    loop = false;

    @property(CCBoolean)
    auto = false;

    @property(CCBoolean)
    directStore = false;

    @property(CCString)
    androidLink = "";

    @property(CCString)
    iosLink = "";

    @property(CCInteger)
    adsType = 0;

    @property(Node)
    panelComplete: Node = null;

    @property(Node)
    panelLose: Node = null;

    @property(Node)
    buttonFire: Node = null;

    @property(Node)
    buttonSmashDown: Node = null;

    @property(Node)
    buttonStore: Node = null;

    @property([Node])
    otherInput: Node[] = [];

    static finish: boolean = false;
    fired: boolean = false;

    onLoad() {
        game.frameRate = 59;
        director.on(GameEvent.GAME_FINISH, this.onFinish, this);
        director.on(GameEvent.GAME_LOSE, this.onLose, this);
        director.on(GameEvent.GAME_TRIGGER_FIRE, this.onFight, this);
        director.on(GameEvent.GAME_TRIGGER_SMASH_DOWN, this.onSmashDown, this);
        director.on(GameEvent.TRIGGER_BOSS_DUMMY, this.onBossDummy, this);
        director.on(GameEvent.GAME_STORE_BUTTON, this.onStoreButton, this);
        if (this.directStore || Loader.finish) {
            if (this.buttonFire != null)
                this.buttonFire.getComponent(Button).interactable = false;
            if (this.buttonSmashDown != null)
                this.buttonSmashDown.getComponent(Button).interactable = false;
            this.node.on(Input.EventType.TOUCH_START, this.retryOnclick, this);
            this.node.getChildByName('press').on(Input.EventType.TOUCH_START, this.retryOnclick, this);
            return;
        }
        //
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.gravity = v2(0, -4000);
        //
        this.otherInput.forEach(e => {
            e.active = Loader.finish || !this.auto;
        });
        if (this.buttonFire != null)
            this.buttonFire.active = Loader.finish || !this.auto;
        if (this.buttonSmashDown != null)
            this.buttonSmashDown.active = Loader.finish || !this.auto;
    }

    onFinish() {
        if (this.loop) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
        this.panelComplete.active = true;
        let panel = this.panelComplete.getChildByName("panel");
        tween(panel).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    onFight() {
        if (Loader.finish)
            return;
        //
        this.otherInput.forEach(e => {
            e.active = false;
        });
        if (this.buttonSmashDown != null)
            this.buttonSmashDown.active = true;
        //
        if (this.buttonFire != null) {
            this.buttonFire.active = true;
            this.buttonFire.getChildByPath('hand').active = true;
        }
    }

    onSmashDown() {
        if (Loader.finish)
            return;
        //
        this.otherInput.forEach(e => {
            e.active = false;
        });
        if (this.buttonFire != null)
            this.buttonFire.active = false;
        //
        if (this.buttonSmashDown != null) {
            this.buttonSmashDown.active = true;
            let Hand = this.buttonSmashDown.getChildByPath('hand');
            if (Hand != null)
                Hand.active = true;
        }
    }

    onBossDummy() {
        this.otherInput.forEach(e => {
            e.active = false;
        });
        if (this.buttonSmashDown != null)
            this.buttonSmashDown.active = false;
        if (this.buttonFire != null)
            this.buttonFire.active = false;
    }

    onStoreButton() {
        this.buttonStore.active = true;
    }

    retryOnclick() {
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

    fireOnclick() {
        if (this.fired || !this.auto || Loader.finish || this.directStore)
            return;
        this.fired = true;
        this.otherInput.forEach(e => {
            e.active = true;
        });
        if (this.buttonSmashDown != null)
            this.buttonSmashDown.active = true;
        if (this.buttonFire != null) {
            this.buttonFire.active = true;
            let Hand = this.buttonFire.getChildByPath('hand')
            if (Hand != null)
                Hand.active = false;
        }
        director.off(GameEvent.GAME_TRIGGER_FIRE, this.onFight, this);
    }

    smashDownOnclick() {
        if (this.fired || !this.auto || Loader.finish || this.directStore)
            return;
        this.fired = true;
        this.otherInput.forEach(e => {
            e.active = true;
        });
        if (this.buttonFire != null)
            this.buttonFire.active = true;
        if (this.buttonSmashDown != null) {
            this.buttonSmashDown.active = true;
            let Hand = this.buttonSmashDown.getChildByPath('hand')
            if (Hand != null)
                Hand.active = false;
        }
        director.off(GameEvent.GAME_TRIGGER_SMASH_DOWN, this.onSmashDown, this);
    }

    onLose() {
        if (this.loop) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
        this.panelLose.active = true;
        let panel = this.panelLose.getChildByName("panel");
        tween(panel).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    storeOnLick() {

    }
}
