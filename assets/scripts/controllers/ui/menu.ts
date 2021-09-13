
import { _decorator } from 'cc';
import { IModal } from '../../types';
import { ModalBase } from './modal-base';
import { ModalBody } from './modal-body';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends ModalBase {
    protected _modes = {
        win: {
            modal: this.winModal,
            closeHdlr: () => {},
        },
    };
   
    @property(ModalBody)
    protected winModal?: ModalBase;

    onLoad() {
        super.onLoad();
        this._modes.win.modal = this.winModal; 
        this.bubbleHideEvents();
    }

    public show(
        target: keyof typeof this._modes
    ): void {
        super.show();
        (this._modes[target].modal as ModalBase).show();
    }    

    public addCloseEventHandler = (
        target: keyof typeof this._modes,
        handler: () => void
    ): void => {
        const modalRef = this._modes[target];
        modalRef.closeHdlr = handler;
    }    

    protected bubbleHideEvents(): void {
        Object.values(this._modes)
            .forEach(({ modal, closeHdlr }) => this
            ._bubbleHideEvent(modal as IModal, closeHdlr));
    }

    private _bubbleHideEvent(
        modal: IModal, handler: Function
    ): void {
        modal.onHide = () => {
            handler();
            this.hide();
        }
    }
}