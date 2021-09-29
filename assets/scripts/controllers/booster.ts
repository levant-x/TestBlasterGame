
import { _decorator, Component, Node, Label } from 'cc';
import { inject, injectable } from '../decorators';
import { BoosterType, IBooster, IBoosterManager } from '../types';
const { ccclass, property } = _decorator;

@ccclass('Booster')
@injectable()
export class Booster extends Component implements IBooster {
    @inject('IBoosterManager')
    private _boostersMng: IBoosterManager;
    private _count = 0;
    private _type: string;

    @property(Label)
    protected numLabel: Label;

    start () {
        if (!this._boostersMng) throw 'Booster manager not set';
        const { registerBooster } = this._boostersMng;
        this._type = registerBooster(this, this.node.name);
    }
    
    setCount(
        count: number
    ): void {
        if (this._count) return;
        this._count = count;
        this.numLabel.string = this._count.toString();
    }

    apply<T>(args?: T): void {
        if (!this._count) return;
        this._count--;
        this.numLabel.string = this._count.toString();
        this._boostersMng.applyBooster(this._type as BoosterType);
    }
}