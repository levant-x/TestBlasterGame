
import { _decorator, Component, Label, Button, CCString, CCBoolean } from 'cc';
import { CONFIG } from '../config';
import { injectable, injectValueByKey } from '../decorators';
import { loadLevelInfoAsync } from '../tools/common/load-level-info-task';
import { BooleanGetter, BoosterType, IBooster, LevelInfo } from '../types';
const { ccclass, property } = _decorator;

@ccclass('Booster')
@injectable()
export class Booster extends Component implements IBooster {
    /**Self count or drop probability */
    private _count = 0;
    private _type: BoosterType;

    private static _current?: IBooster;
    private static _instances: Record<string, IBooster>;    

    @property(Label)
    protected numLabel?: Label;
    @property(Button)
    protected button?: Button;
    @property(CCString)
    protected pathToValue: string;
    @property(CCBoolean)
    protected hasProbability = false;
    @injectValueByKey('stepCooldown')
    protected isCooldownMoment: BooleanGetter;

    get type(): BoosterType {
        return this._type;
    }

    static get current(): IBooster | undefined {
        return Booster._current;
    }

    static tryApply(
        type: BoosterType
    ): boolean {
        if (!Booster._instances[type]) throw 'Unknown booster type';
        return Booster._instances[type].tryApply();
    }

    start() {
        if (!Booster._instances) Booster._instances = {};
        loadLevelInfoAsync(lvlInfo => this._init(lvlInfo));
    }

    onDestroy() {
        Booster._instances = {};
    }
    
    tryApply(): boolean {
        if (!this._count || this.isCooldownMoment() ||
            Booster.current) return false;
        if (this.hasProbability) return this._drawLots();

        this._count--;
        this._updateUI();

        Booster._current = this;
        return true;
    }
    
    drop(): void {
        Booster._current = undefined;
    }

    private _init(
        lvlInfo: LevelInfo
    ): void {
        this._detectType();
        this._count = +lvlInfo[this.pathToValue];
        this._updateUI();
    }

    private _detectType(): void {
        const { name } = this.node;
        const typeFromName = name.replace(CONFIG.BOOSTER_NAME_TMPL, '');
        this._type = <BoosterType>typeFromName;
        Booster._instances[this._type] = this;   
    }

    private _updateUI(): void {
        if (!this._count && this.button) this.button.interactable = false;
        if (!this.numLabel) return;
        this.numLabel.string = this._count.toString();
    }

    private _drawLots(): boolean {
        const probability = this._count;
        const fortune = Math.random();
        return fortune <= probability;  
    }
}