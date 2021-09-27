import { _decorator } from 'cc';
import { 
    GridCellCoordinates, 
    IClassifyable, 
    IStepFlow, 
    ITile 
} from '../../types';
import { inject, injectable } from '../../decorators';
import { Task } from '../common/task';
import { HitTilesFinder } from './hit-tiles-finder';
import { TileAsyncRespawner } from './tile-async-respawner';
import { TileOffsetter } from './tile-offsetter';

@injectable()
export class StepFlow implements IStepFlow {
    protected hitTilesCrds: GridCellCoordinates[] = [];
    @inject('HitTilesFinder')
    protected hitTilesFinder: HitTilesFinder;
    @inject('TileOffsetter')
    protected tileOffsetter: TileOffsetter;
    @inject('TileAsyncRespawner')
    protected asyncRespawner: TileAsyncRespawner;

    detectHitTiles = (
        clickedTile: ITile
    ): ITile[] => {
        const selectorCbck = (other: IClassifyable) => (
            other.getGroupID() === clickedTile.getGroupID());
        const collect = this.hitTilesFinder.collectItemsGroup;
        const clickedCrds = clickedTile.getCellCoordinates();
        const hitTiles = collect([clickedCrds], selectorCbck);
        return hitTiles as ITile[];
    }

    destroyHitTiles = (
        hitTiles?: ITile[]
    ): Task => {
        if (!hitTiles) throw 'Invalid tiles array';
        this.hitTilesCrds = hitTiles
            .map(hitTile => hitTile.getCellCoordinates());
        const task = new Task();        
        hitTiles.forEach(tile => task
            .bundleWith(tile.destroyHitAsync()));
        return task;
    }

    offsetLooseTiles = (): Task => {
        const offsetter = this.tileOffsetter;
        const offset = offsetter.getTaskOffsetLooseTiles;
        return offset(this.hitTilesCrds);
    }

    spawnNewTiles = (): Task => {
        const empCellsInfo = this.hitTilesFinder
            .getEmptyCellsGroupedByColumn();
        return this.asyncRespawner.respawnAsync(empCellsInfo);
    }
}