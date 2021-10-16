
import { _decorator } from 'cc';
import { CONFIG } from '../config';
import { Booster } from './booster';
import { injectable } from '../decorators';
const { ccclass } = _decorator;

@ccclass('BoosterSupertile')
@injectable()
export class BoosterSupertile extends Booster {
    private _wasJustApplied = false;    

    start() {
        this.toUseUI = false;
        super.start();
    }

    tryApply(): boolean {
        const wasApplied = this._wasJustApplied;
        this._wasJustApplied = false;
        if (wasApplied) return false;

        const probability = CONFIG.SUPERTILE_APPEAR_PROBAB;
        const fortune = Math.random();
        if (fortune <= probability) this._wasJustApplied = true;
        return fortune <= probability;                
    }    
}