
import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { inject, injectable, injectValueByKey } from '../../decorators';
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
    private _currBooster: BoosterType | null = null;    
    private _boosters: Record<string, IBooster> = {};  
    private _attributes: Record<
        string, BoosterAttributes
    > = {
        shuffle: {
            getCnt: () => this._cfg.shufflesAvail,
        },
        bomb: {
            getCnt: () => this._cfg.bombsAvail,
        },
    };

    @inject('BoosterSupertile')
    private _boosterSupertile: IBooster;
    @injectValueByKey('config')
    private _cfg: LevelConfig;

    getCurrentBooster(): BoosterType | null {
        return this._currBooster;
    }

    dropBoosterStatus(): void {
        this._currBooster = null;
    }

    tryApplyBooster(
        type: BoosterType
    ): boolean {
        if (this._currBooster) return false;
        
        const trgBooster = this._boosters[type]
        if (!trgBooster) throw `Booster ${type} not registered`;
        if (!trgBooster.tryApply()) return false;
        
        this._currBooster = type;
        return true;
    }

    registerBooster(
        booster: IBooster,
    ): BoosterInfo {
        const { name } = booster.node;
        const typeFromName = name.replace(CONFIG.BOOSTER_NAME_TMPL, '');
        const boosterType = typeFromName as BoosterType;

        this._boosters[boosterType] = booster;
        const attributes = this._attributes[boosterType];        
        return {
            type: boosterType, 
            count: attributes?.getCnt(),
        }
    }
}