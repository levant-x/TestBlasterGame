
import { _decorator, tween, UIOpacity } from 'cc';
import { IModal } from '../../types';
import { ModalBase } from './modal-base';
import { ModalBody } from './modal-body';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends ModalBase {
    protected _modes = {
        win: this.winModal,
    };

    public onWinModalClose?: Function;
   
    @property(ModalBody)
    protected winModal?: ModalBase;

    onLoad() {
        super.onLoad();
        this._modes.win = this.winModal;
        console.log(this.winModal);
        
        this.bubbleHideCbck();
    }

    public show(
        target: keyof typeof this._modes
    ): void {
        super.show();
        (this._modes[target] as ModalBase).show();
    }

    protected bubbleHideCbck() {
        const winModal = this.winModal as IModal;
        const baseHide = winModal.onHide;
        winModal.onHide = () => {
            baseHide?.();
            this.hide();            
        }
    }
}