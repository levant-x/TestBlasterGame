
import { 
    BooleanGetter, 
    ITile, 
    StepResultByColsInfo, 
} from '../../types';
import { injectable } from '../../decorators';
import { Task } from '../common/task';
import { GamefieldContext } from './gamefield-context';

@injectable('TileOffsetter')
export class TileOffsetter extends GamefieldContext {
    private _row2SettleTo = 0;
    private _col = 0;
    private _tilesOffsetTask: Task;

    offsetLooseTilesAsync(
        { colsIndex, colsInfo }: StepResultByColsInfo
    ): Task {
        this._tilesOffsetTask = new Task();
        for (let i = 0; i < colsIndex.length; i++) {
            this._col = colsIndex[i];
            this._checkColStack({ colsInfo });
        }
        return this._tilesOffsetTask;            
    }

    private _checkColStack(
        { colsInfo }: Pick<StepResultByColsInfo, 'colsInfo'>
    ): void {
        const { 
            lowestRow, highestRow, tiles2Spawn 
        } = colsInfo[this._col];

        this._row2SettleTo = lowestRow;
        const dySpan = highestRow - lowestRow + 1;

        if (dySpan > tiles2Spawn) 
            this._offsetSubcolStack(lowestRow + 1, highestRow);
        this._offsetSubcolStack(highestRow + 1, this.height - 1);
    }

    private _offsetSubcolStack(
        rStart: number,
        rEnd: number,        
    ): void {
        for (let row = rStart; row <= rEnd; row++) {
            const tile = this.gamefield[this._col][row];
            if (!tile.isValid) continue;

            this._tilesOffsetTask
                .bundleWith(this._getTileOffsetTask(tile));
            this._row2SettleTo++;
        }
    }

    private _getTileOffsetTask(
        tile: ITile,
    ): BooleanGetter {
        const { col, row } = tile.сellCoordinates;
        GamefieldContext.swapItems({ col, row }, { // register swap
            col, row: this._row2SettleTo,
        })
        return tile.moveToCellAsync({ // move tiles themself
            col, row: this._row2SettleTo 
        });
    }
}