
import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { 
    inject, 
    injectable, 
    injectValueByKey 
} from '../../decorators';
import { 
    BoosterType, 
    IBooster, 
    IBoosterManager, 
    LevelConfig 
} from '../../types';
import { TileShuffler } from './tile-shuffler';

type BoosterInfo = {
    getCnt: () => number;
    apply: (args?: any) => void;
}

@injectable()
export class BoosterManager implements IBoosterManager {
    @injectValueByKey(CONFIG.VALUE_KEYS.config)
    private _cfg: LevelConfig;
    @inject('TileShuffler')
    private _tileShuffler: TileShuffler;    

    private _boosters: Record<string, IBooster> = {};  
    private _attributes: Record<
        BoosterType, BoosterInfo
    > = {
        shuffle: {
            getCnt: () => this._cfg.tileShufflesAvail,
            apply: () => this._tileShuffler.shuffle(),
        },
        bomb: {
            getCnt: () => { throw 'Not implemented yet' },
            apply: () => { throw 'Not implemented yet' },
        },
    };

    applyBooster(
        type: BoosterType
    ): void {
        const attributes = this._attributes[type];
        attributes.apply();
    }

    registerBooster = (
        booster: IBooster,
        name: string,
    ): BoosterType => {
        const typeFromName = name.replace('booster-panel-', '');
        const boosterType = typeFromName as BoosterType;
        const { getCnt } = this._attributes[boosterType];
        booster.setCount(getCnt());
        if (!this._boosters[boosterType]) 
            this._boosters[boosterType] = booster;
        return boosterType;
    }
}