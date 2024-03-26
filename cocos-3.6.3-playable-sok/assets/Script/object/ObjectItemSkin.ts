import { _decorator, CCBoolean, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { BaseSpineCustom } from '../base/BaseSpineCustom';
import GameTag from '../GameTag';
import { BaseSpine } from '../base/BaseSpine';
const { ccclass, property } = _decorator;

@ccclass('ObjectItemSkin')
export class ObjectItemSkin extends Component {

    spine: BaseSpineCustom = null;

    protected onLoad(): void {
        this.spine = this.getComponent(BaseSpineCustom);
        //
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c => {
            c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.tag != GameTag.PLAYER)
            return;
        //
        var Player = otherCollider.body.getComponent(BaseSpineCustom);
        if (Player == null)
            return;
        //
        Player.SetSkin(this.spine.spineSkin, this.spine.spineWeapon);
    }
}