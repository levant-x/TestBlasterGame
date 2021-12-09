
import { _decorator, Component, UIOpacity, tween, Tween } from 'cc';
import { IModal } from '../../types';
const { property } = _decorator;

export abstract class ModalOverlay extends Component implements IModal {
    protected overlay?: UIOpacity;  
    protected opacityTween?: Tween<UIOpacity>;

    @property
    protected targetOpacity = 0;
    @property
    protected transitionDuration = 1.2;
    
    public onHide?: Function;

    onLoad() {
        this.overlay = 
            this.node.getComponent(UIOpacity) as UIOpacity;
        this.targetOpacity = this.overlay.opacity;
        this.createOpacityTween(this.transitionDuration);
    }

    onEnable() {
        (this.overlay as UIOpacity).opacity = 0;
    }

    onDisable() {
        this.onHide?.();
    }

    show(
        args?: any
    ): void {
        this.node.active = true;
        this.animateOverlay();
    }

    hide() {
        this.node.active = false;
    }

    protected animateOverlay() {
        this.opacityTween?.start();
    };

    protected createOpacityTween(
        duration: number
    ): void {
        this.opacityTween = tween(this.overlay)
            .to(duration, { 
                opacity: this.targetOpacity 
            });
    }
}