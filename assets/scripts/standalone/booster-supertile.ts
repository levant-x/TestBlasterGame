
import { _decorator } from 'cc';
import { CONFIG } from '../config';
import { Booster } from '../controllers/booster';
import { injectable } from '../decorators';
const { ccclass } = _decorator;

@ccclass('BoosterSupertile')
@injectable()
export class BoosterSupertile extends Booster {
    start() {
        this.toUseUI = false;
        super.start();
    }

    tryApply(): boolean {
        const probability = CONFIG.SUPERTILE_APPEAR_PROBAB;
        const fortune = Math.random();
        return fortune <= probability;        
    }    
}