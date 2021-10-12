
import { _decorator, Node } from 'cc';
import { CONFIG } from '../config';
import { Booster } from '../controllers/booster';
import { injectable } from '../decorators';
const { ccclass } = _decorator;

@ccclass('BoosterSupertile')
@injectable()
export class BoosterSupertile extends Booster {
    /* constructor() {
        super();
        // this.node = new Node(`${CONFIG.BOOSTER_NAME_TMPL}supertile`);
        this.toUseUI = false;
    } */

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