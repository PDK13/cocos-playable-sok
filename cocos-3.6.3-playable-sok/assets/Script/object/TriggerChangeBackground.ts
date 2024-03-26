import { _decorator, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node } from 'cc';
import GameTag from '../GameTag';
import { BaseSpineCustom } from '../base/BaseSpineCustom';
const { ccclass, property } = _decorator;

@ccclass('TriggerChangeBackground')
export class TriggerChangeBackground extends Component {

    static TRIGGER_CHANGE_BACKGROUND: string = 'TRIGGER_CHANGE_BACKGROUND';

    @property(CCInteger)
    contactSelf: number = 0;

    @property(CCInteger)
    contactOther: number = 0;

    changed: boolean = false;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c => {
            c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.changed)
            return;
        //
        if (selfCollider.tag == this.contactSelf && otherCollider.tag == this.contactOther) {
            director.emit(TriggerChangeBackground.TRIGGER_CHANGE_BACKGROUND);
            this.changed = true;
        }
    }
}