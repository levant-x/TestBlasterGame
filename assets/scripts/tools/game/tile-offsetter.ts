
import { Component } from 'cc';
import { 
    BooleanGetter, 
    GridCellCoordinates, 
    ITile, 
    TileOffsetInfo 
} from '../../types';
import { inject, injectable } from '../../decorators';
import { Task } from '../common/task';
import { GamefieldContext } from './gamefield-context';
import { LooseTilesFinder } from './field-analyzers/loose-tiles-finder';

@injectable('TileOffsetter')
export class TileOffsetter extends GamefieldContext {
    onTileOffset?: (tile: ITile) => void;

    @inject('LooseTilesFinder')
    private _looseTilesFinder: LooseTilesFinder;

    getTaskOffsetLooseTiles(
        hitCellsCoords: GridCellCoordinates[]
    ): Task {
        const selectorCbck = (tile: Component) => tile.isValid;
        const tilesOffsInfos = this
            ._looseTilesFinder
            .collectItemsGroup(hitCellsCoords, selectorCbck);
        const tilesOffsetTask = new Task();
        tilesOffsInfos
            .forEach(tileOffsInfo => tilesOffsetTask
            .bundleWith(this._getTileOffsetTask(tileOffsInfo)));
        return tilesOffsetTask;            
    }

    private _getTileOffsetTask(
        { tile, rowToSettleTo }: TileOffsetInfo
    ): BooleanGetter {
        const { col, row } = tile.сellCoordinates;
        GamefieldContext.swapItems({ col, row }, {
            col, row: rowToSettleTo,
        })
        return tile.moveToCellAsync({ 
            col, row: rowToSettleTo 
        });
    }
}