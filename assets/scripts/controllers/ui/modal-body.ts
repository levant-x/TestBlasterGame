
import { _decorator, Vec3, tween } from 'cc';
import { ModalOverlay } from './modal-overlay';
const { ccclass } = _decorator;

@ccclass('Modal-body')
export class ModalBody extends ModalOverlay {
    protected transitionDuration = 0.4;

    onEnable() {
        super.onEnable();
        this.node.scale = new Vec3(0.2, 0.2, 1);
    }
    
    protected animateOverlay() {
        super.animateOverlay();
        tween(this.node)
            .to(this.transitionDuration,
            { scale: new Vec3(1, 1, 1) })
            .start();
    }
}