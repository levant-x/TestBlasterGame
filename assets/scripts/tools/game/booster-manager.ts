
import { _decorator } from 'cc';
import { 
    inject, 
    injectable, 
    injectValueByKey 
} from '../../decorators';
import { 
    BoosterInfo,
    BoosterType, 
    IBooster, 
    IBoosterManager, 
    LevelConfig 
} from '../../types';
import { Task } from '../common/task';
import { TileShuffler } from './tile-shuffler';

type BoosterAttributes = {
    getCnt: () => number;
    apply: (args?: any) => Task;
}

@injectable()
export class BoosterManager implements IBoosterManager {
    @injectValueByKey('config')
    private _cfg: LevelConfig;
    @inject('TileShuffler')
    private _tileShuffler: TileShuffler;    

    private _boosters: Record<string, IBooster> = {};  
    private _attributes: Record<
        BoosterType, BoosterAttributes
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

    onBoosterApply?: (task: Task, type: BoosterType) => void;

    tryApplyBooster = (
        type: BoosterType
    ): boolean => {
        const attributes = this._attributes[type];
        const trgBooster = this._boosters[type]
        if (!attributes || !trgBooster) 
            throw `Booster ${type} not registered`;
        if (!trgBooster.tryApply()) return false;
        const boostTask = attributes.apply();
        this.onBoosterApply?.(boostTask, type);
        return true;
    }

    registerBooster = (
        booster: IBooster,
    ): BoosterInfo => {
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