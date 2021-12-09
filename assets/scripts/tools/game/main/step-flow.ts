import { _decorator } from 'cc';
import { 
    StepResultByColsInfo,
    IClassifyable, 
    IItemsGapAnalyzer, 
    IItemsGroupAnalyzer, 
    IStepFlow, 
    ITile,
} from '../../../types';
import { inject, injectable } from '../../../decorators';
import { Task } from '../../common/task';
import { TileAsyncRespawner } from './tile-async-respawner';
import { TileOffsetter } from './tile-offsetter';
import { ItemType } from '../field-analyzers/hit-tiles-finder-base';

@injectable('StepFlow')
export class StepFlow implements IStepFlow {
    private _hitTiles: ITile[];
    private _stepRslInfo: StepResultByColsInfo;

    @inject('IItemsGroupAnalyzer')
    protected hitTilesFinder: IItemsGroupAnalyzer<ItemType>;
    @inject('IItemsGapAnalyzer')
    protected tilesGapFinder: IItemsGapAnalyzer;
    @inject('TileOffsetter')
    protected tileOffsetter: TileOffsetter;
    @inject('TileAsyncRespawner')
    protected asyncRespawner: TileAsyncRespawner;

    detectHitTiles(
        clickedTile: ITile
    ): ITile[] {
        const selectorCbck = (other: IClassifyable) => (
            other.groupID === clickedTile.groupID);
        const tilesFinder = this.hitTilesFinder;

        const collect = tilesFinder.collectItemsGroup.bind(tilesFinder);
        const clickedCrds = clickedTile.сellCoordinates;

        this._hitTiles = <ITile[]>collect([clickedCrds], selectorCbck);
        return this._hitTiles;
    }

    destroyHitTilesAsync(
        hitTiles?: ITile[]
    ): Task {
        if (!hitTiles) throw 'Invalid tiles array';

        this._stepRslInfo = this.tilesGapFinder
            .getStepResultByColsInfo(this._hitTiles);
        const massDestroyTask = new Task();        

        for (let i = 0; i < hitTiles.length; i++) {
            const hitTile = hitTiles[i];
            massDestroyTask.bundleWith(hitTile.destroyHitAsync());
        }
        return massDestroyTask;
    }

    offsetLooseTilesAsync(): Task {
        const offsetter = this.tileOffsetter;
        const offset = offsetter.offsetLooseTilesAsync;
        return offset.bind(offsetter)(this._stepRslInfo);
    }

    spawnNewTilesAsync(): Task {
        return this.asyncRespawner.respawnAsync(this._stepRslInfo);
    }
}