
import { _decorator } from 'cc';
import { injectable, injectValueByKey } from '../../decorators';
import { 
    BoosterInfo,
    BoosterType, 
    IBooster, 
    IBoosterManager, 
    LevelConfig 
} from '../../types';

type BoosterAttributes = {
    getCnt: () => number;
}

@injectable()
export class BoosterManager implements IBoosterManager {
    @injectValueByKey('config')
    private _cfg: LevelConfig;

    private _currBooster: BoosterType | null = null;
    private _boosters: Record<string, IBooster> = {};  
    private _attributes: Record<
        BoosterType, BoosterAttributes
    > = {
        shuffle: {
            getCnt: () => this._cfg.shufflesAvail,
        },
        bomb: {
            getCnt: () => this._cfg.bombsAvail,
        },
    };

    getCurrentBooster(): BoosterType | null {
        return this._currBooster;
    }

    dropBoosterStatus(): void {
        this._currBooster = null;
    }

    tryApplyBooster(
        type: BoosterType
    ): boolean {
        const attributes = this._attributes[type];
        const trgBooster = this._boosters[type]
        if (!attributes || !trgBooster) 
            throw `Booster ${type} not registered`;
        if (!trgBooster.tryApply()) return false;
        this._currBooster = type;
        return true;
    }

    registerBooster(
        booster: IBooster,
    ): BoosterInfo {
        const { name } = booster.node;
        const typeFromName = name.replace('booster-panel-', '');
        const boosterType = typeFromName as BoosterType;
        const { getCnt } = this._attributes[boosterType];
        this._boosters[boosterType] = booster;
        return {
            type: boosterType, 
            count: getCnt(),
        }
    }
}