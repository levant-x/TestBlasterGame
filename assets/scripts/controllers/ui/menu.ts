
import { _decorator } from 'cc';
import { IModal, StepResult } from '../../types';
import { ModalBody } from './modal-body';
import { ModalOverlay } from './modal-overlay';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends ModalOverlay {
    @property(ModalBody)
    protected wonModal?: ModalBody;
    @property(ModalBody)
    protected completeModal?: ModalBody;
    @property(ModalBody)
    protected lostModal?: ModalBody;

    onLoad() {
        super.onLoad();
        this.node.active = false;
    }

    /**Pass stepResult or {stepResult, summary}*/
    show(
        arg: any
    ): void {
        const stepResult = arg['stepResult'] || arg;
        super.show();
        const modal = this._getModalInfo(stepResult);        
        modal.show(arg['summary']);
    }    

    addModalCloseHandler(
        stepResult: StepResult,
        handler: () => void
    ): void {
        const modal = this._getModalInfo(stepResult);
        modal.onHide = () => {
            this.hide();
            handler();
        }
    }   

    private _getModalInfo(
        stepRsl: StepResult
    ): ModalBody {
        const modalInfo = (this as any)[`${stepRsl}Modal`];
        if (!modalInfo) throw `There is no modal for ${stepRsl}`;
        return modalInfo;
    }
}