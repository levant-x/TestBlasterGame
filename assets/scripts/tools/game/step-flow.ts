import { _decorator } from 'cc';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    IItemsGapAnalyzer, 
    IItemsGroupAnalyzer, 
    IStepFlow, 
    ITile 
} from '../../types';
import { inject, injectable } from '../../decorators';
import { Task } from '../common/task';
import { TileAsyncRespawner } from './tile-async-respawner';
import { TileOffsetter } from './tile-offsetter';

@injectable('StepFlow')
export class StepFlow implements IStepFlow {
    protected hitTilesCrds: GridCellCoordinates[] = [];
    @inject('IItemsGroupAnalyzer')
    protected hitTilesFinder: IItemsGroupAnalyzer<ITile>;
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
            other.getGroupID() === clickedTile.getGroupID());
        const tilesFinder = this.hitTilesFinder;

        const collect = tilesFinder.collectItemsGroup.bind(tilesFinder);
        const clickedCrds = clickedTile.getCellCoordinates();
        const hitTiles = collect([clickedCrds], selectorCbck);
        return hitTiles as ITile[];
    }

    destroyHitTiles(
        hitTiles?: ITile[]
    ): Task {
        if (!hitTiles) throw 'Invalid tiles array';

        this.hitTilesCrds = hitTiles
            .map(hitTile => hitTile.getCellCoordinates());
        const massDestroyTask = new Task();        
        hitTiles.forEach(tile => massDestroyTask
            .bundleWith(tile.destroyHitAsync()));
        return massDestroyTask;
    }

    offsetLooseTiles(): Task {
        const offsetter = this.tileOffsetter;
        const offset = offsetter.getTaskOffsetLooseTiles;
        return offset.bind(offsetter)(this.hitTilesCrds);
    }

    spawnNewTiles(): Task {
        const empCellsInfo = this.tilesGapFinder
            .getEmptyCellsGroupedByColumn();
        return this.asyncRespawner.respawnAsync(empCellsInfo);
    }
}