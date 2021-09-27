
import { _decorator } from 'cc';
import { StepResult } from '../../types';
import { ModalBody } from './modal-body';
import { ModalOverlay } from './modal-overlay';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends ModalOverlay {
    protected _modals = {
        won: this.wonModal,
        complete: this.wonModal,
    };
   
    @property(ModalBody)
    protected wonModal?: ModalOverlay;
    @property(ModalBody)
    protected completeModal?: ModalOverlay;

    onLoad() {
        super.onLoad();
        this._modals.won = this.wonModal; 
        this._modals.complete = this.completeModal; 
        this.node.active = false;
    }

    public show(
        stepResult: StepResult
    ): void {
        super.show();
        const modal = this._getModalInfo(stepResult);
        modal.show();
    }    

    public addModalCloseHandler = (
        stepResult: StepResult,
        handler: () => void
    ): void => {
        const modal = this._getModalInfo(stepResult);
        modal.onHide = () => {
            this.hide();
            handler();
        }
    }   

    private _getModalInfo(
        stepRsl: StepResult
    ): ModalOverlay {
        const key = stepRsl as keyof typeof this._modals;
        const modalInfo = this._modals[key];
        if (!modalInfo) throw `There is no modal for ${stepRsl}`;
        return modalInfo;
    }
}