
import { _decorator, Component, Label, Button } from 'cc';
import { CONFIG } from '../config';
import { inject, injectable } from '../decorators';
import { loadLevelInfoAsync } from '../tools/common/load-level-info-task';
import { BoosterType, IBooster, IBoosterManager } from '../types';
const { ccclass, property } = _decorator;

@ccclass('Booster')
@injectable()
export class Booster extends Component implements IBooster {
    private _count = 0;
    private _type: BoosterType;

    @inject('IBoosterManager')
    private _boostersMng: IBoosterManager;

    protected toUseUI = true;

    @property(Label)
    protected numLabel: Label;
    @property(Button)
    protected button: Button;

    start() {
        if (!this._boostersMng) throw 'Booster manager not set';
        loadLevelInfoAsync(() => this._init());
    }
    
    tryApply(): boolean {
        if (!this._count) return false;
        this.toUseUI && this._updateCnt(this._count - 1);
        if (!this._count) 
            this.button.interactable = false;
        return true;
    }

    onClick(): void {
        this._boostersMng.tryApplyBooster(this._type);
    }

    private _init() {
        const mng = this._boostersMng;
        const { type, count } = mng.registerBooster(this);
        this._type = type;
        this.toUseUI && this._updateCnt(count);
    }

    private _updateCnt(
        count: number
    ): void {
        this._count = count;
        this.numLabel.string = this._count.toString();
    }
}