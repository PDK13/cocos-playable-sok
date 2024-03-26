import { _decorator, Component, director, Node } from 'cc';
import { dir } from 'console';
import { TriggerChangeBackground } from './TriggerChangeBackground';
const { ccclass, property } = _decorator;

@ccclass('ChangeBackground')
export class ChangeBackground extends Component {

    @property(Node)
    childOn: Node = null;

    protected onLoad(): void {
        director.on(TriggerChangeBackground.TRIGGER_CHANGE_BACKGROUND, this.onChangeBackground, this);
    }

    onChangeBackground(): void {
        this.childOn.active = true;
    }
}