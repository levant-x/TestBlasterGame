
import { _decorator } from 'cc';
import { injectable } from '../../../decorators';
import { GridCellCoordinates, ITile } from '../../../types';
import { pickRandomItem, removeFromArray } from '../../common/array-tools';
import { Task } from '../../common/task';
import { GamefieldContext } from '../gamefield-context';

@injectable()
export class TileShuffler extends GamefieldContext {
    private _cellIndexes: number[] = [];
    private _shuffleTask: Task = new Task();

    shuffle() {     
        this._cellIndexes = [];
        this._shuffleTask = new Task();   
        const { totalLength } = GamefieldContext.get();
        this._cellIndexes = new Array(totalLength);
        
        for (let i = 0; i < totalLength; i++) this._cellIndexes[i] = i;
        for (let i = 0; i < totalLength / 2; i++) this._pickCellIndex();
        return this._shuffleTask;
    }

    private _pickCellIndex() {
        const cell1 = pickRandomItem(this._cellIndexes);
        removeFromArray(this._cellIndexes, cell1);
        const cell2 = pickRandomItem(this._cellIndexes);
        removeFromArray(this._cellIndexes, cell2);
        this._swapTiles(cell1, cell2);
    }

    private _swapTiles(
        formerCell: number,
        newCell: number,
    ): void {
        const cell1 = this._getDecartCrds(formerCell);
        const cell2 = this._getDecartCrds(newCell); 
        const tile1 = this.gamefield[cell1.col][cell1.row];
        const tile2 = this.gamefield[cell2.col][cell2.row];  

        GamefieldContext.swapItems(cell1, cell2); 
        this._shuffleTask.bundleWith(tile1.moveToCellAsync(cell2, true));
        this._shuffleTask.bundleWith(tile2.moveToCellAsync(cell1, true));
        this._orderTileInTree(tile1, cell2);
        this._orderTileInTree(tile2, cell1);
    }

    private _getDecartCrds(
        index: number
    ): GridCellCoordinates {
        const { row, col } = GamefieldContext.get();   
        const r = row(index);
        const c = col(index);
        return { row: r, col: c };
    }

    private _orderTileInTree(
        tile: ITile,
        newCrds: GridCellCoordinates,
    ): void {
        const { linear } = GamefieldContext.get();
        const linearIndex = linear(newCrds);
        tile.node.setSiblingIndex(linearIndex);
    }
}
