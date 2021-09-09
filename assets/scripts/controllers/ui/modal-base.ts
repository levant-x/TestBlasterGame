
import { _decorator, Component, UIOpacity, tween, Tween } from 'cc';
import { IModal } from '../../types';

export abstract class ModalBase extends Component implements IModal {
    protected overlay?: UIOpacity;  
    protected targetOpacity = 0;
    protected transitionDuration = 1.2;
    protected opacityTween?: Tween<UIOpacity>;

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
    
    public show(
        target?: any
    ): void {
        this.node.active = true;
        this.animateOverlay();
    }

    public hide() {
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