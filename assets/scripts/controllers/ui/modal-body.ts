
import { _decorator, Vec3, tween, Label } from 'cc';
import { ModalOverlay } from './modal-overlay';
const { ccclass } = _decorator;

const SUMM_LBL_NAME = 'lbl-summary';

@ccclass('ModalBody')
export class ModalBody extends ModalOverlay {
    protected transitionDuration = 0.4;
    protected lblSummary?: Label;

    onEnable() {
        super.onEnable();
        this.node.scale = new Vec3(0.2, 0.2, 1);
        const lblSummaryObj = this.node.getChildByName(SUMM_LBL_NAME);
        this.lblSummary = lblSummaryObj?.getComponent(Label) as Label;
    }

    show(arg?: any) {
        super.show();
        if (!arg || !this.lblSummary) return;
        const tmplFilling = Object.entries(arg);
        for (const entry of tmplFilling) 
            this._fillSummaryTmpl(this.lblSummary, entry);
    }
    
    protected animateOverlay() {
        super.animateOverlay();
        tween(this.node)
            .to(this.transitionDuration,
            { scale: new Vec3(1, 1, 1) })
            .start();
    }

    private _fillSummaryTmpl(
        lbl: Label,
        [key, value]: [string, any],
    ): void {
        const summaryTmpl = lbl.string;
        lbl.string = summaryTmpl.replace(`{${key}}`, value);
    }
}