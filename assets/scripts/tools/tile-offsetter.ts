
import { GridCellCoordinates, ITile } from '../types';
import { GamefieldContext } from './gamefield-context';
import { ItemGroupsAnalizer } from './item-groups-analizer';
import { TileSpawner } from './tile-spawner';

type Col2RowsMap = Record<number, number[]>;

export class TileOffsetter extends GamefieldContext {
    public onTileOffset?: (tile: ITile) => void;

    private _tilesInMove: ITile[] = [];    

    public async offsetUpperTilesAsync(
        emptyCellsCoords: GridCellCoordinates[]) {

        const colsInvolved = emptyCellsCoords
            .filter(({ row }) => row < this.height)
            .reduce(this._groupCrdsByCol, {} as Col2RowsMap);
        const ofsCol = this._offsetTilesCol;
        for (const col in colsInvolved) ofsCol(+col, colsInvolved[col]);
        await this._waitForOffsetToCompleteAsync();
    }

    private _groupCrdsByCol(
        colCrdsMap: Col2RowsMap, crds: GridCellCoordinates) {
        const trgCol = colCrdsMap[crds.col];
        if (trgCol) trgCol.push(crds.row);
        else colCrdsMap[crds.col] = [crds.row];
        return colCrdsMap;
    }

    private _offsetTilesCol(col: number, rowNumsStack: number[]) {   
        let rowOfLowestTileAbv = col;
        const rowNumsSorted = rowNumsStack.sort();

        for (let i = 0; i < rowNumsSorted.length; i++) {
            const crrEmptyRow = rowNumsSorted[i];
            const { wasFound, rowAbv } = this._findClosestTileAbove({
                col: rowOfLowestTileAbv, 
                row: crrEmptyRow,
            });
            if (!wasFound) break;
            rowOfLowestTileAbv = rowAbv;
            this._setupTileForOffset({ 
                row: rowAbv, col }, 
                crrEmptyRow
            );
        }
    }

    private _findClosestTileAbove({ col, row }: GridCellCoordinates) {
        const result = { 
            wasFound: false, 
            rowAbv: -1
        };
        for (let r = row + 1; r < this.height; r++) {
            const tileAbove = this.gamefield[col][r];

            if (!tileAbove.node.active) continue;
            result.wasFound = true;
            result.rowAbv = r;
            break;
        }
        return result;
    }

    private _setupTileForOffset({
        col, row }: GridCellCoordinates, newRow: number) {
        const tileToMove = this.gamefield[col][row];
        this._tilesInMove.push(tileToMove);
        tileToMove.moveToCell({ col, row: newRow }, () => {
            this._onTileOffsetComplete(tileToMove);
        })
        this.gamefield[col][newRow] = this.gamefield[col][row];
    }

    private _onTileOffsetComplete(tile: ITile) {
        this._removeTileFromPool(tile);
        this.onTileOffset?.(tile);
    }

    private _removeTileFromPool(tile: ITile) {
        const tileIdxInPool = this._tilesInMove.indexOf(tile);
        this._tilesInMove.splice(tileIdxInPool, 1);
    }

    private async _waitForOffsetToCompleteAsync() {
        while (this._tilesInMove.length > 0) { }
    }
}