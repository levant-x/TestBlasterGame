
import { _decorator, Component, Label, Button } from 'cc';
import { inject, injectable } from '../decorators';
import { BoosterType, IBooster, IBoosterManager } from '../types';
const { ccclass, property } = _decorator;

@ccclass('Booster')
@injectable()
export class Booster extends Component implements IBooster {
    @inject('IBoosterManager')
    private _boostersMng: IBoosterManager;
    private _count = 0;
    private _type: BoosterType;

    @property(Label)
    protected numLabel: Label;
    @property(Button)
    protected button: Button;

    start() {
        if (!this._boostersMng) throw 'Booster manager not set';
        const { registerBooster } = this._boostersMng;
        const { type, count } = registerBooster(this);
        this._type = type;
        this._updateCnt(count);
    }
    
    tryApply(): boolean {
        if (!this._count) return false;
        this._updateCnt(this._count - 1);
        if (!this._count && this.button) 
            this.button.interactable = false;
        return true;
    }

    onClick(): void {
        this._boostersMng.applyBooster(this._type);
    }

    private _updateCnt(
        count: number
    ): void {
        this._count = count;
        this.numLabel.string = this._count.toString();
    }
}