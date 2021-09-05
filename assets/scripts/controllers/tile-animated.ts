
import { _decorator, Vec3, tween } from 'cc';
import { Config } from '../config';
import { GridCellCoordinates } from '../types';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('Tile-animated')
export class TileAnimated extends TileBase {
    private _hasMoveCompleted = false;
    private _gridNewCrds?: GridCellCoordinates;

    public moveToCellAsync = (
        gridNewCoords: GridCellCoordinates
    ) => {
        this._hasMoveCompleted = false; 
        this._gridNewCrds = gridNewCoords;
        const cellAbsPosition = this.getCellAbsPosition(gridNewCoords);
        const moveDuration = (this.cellCoords.row - gridNewCoords.row) * 
            Config.TILES_OFFSET_DURATION_SEC;
        this.setupMovement(cellAbsPosition, moveDuration);
        return () => this._hasMoveCompleted;
    }

    protected setupMovement = (
        cellAbsPos: Vec3, dur: number
    ) => {
        tween(this.node).to(
            dur, { position: cellAbsPos }
        ).call(
            this._onMoveCompleted
        ).start();
    }

    private _onMoveCompleted = () => {
        this._hasMoveCompleted = true; 
        const newCrds = this._gridNewCrds as GridCellCoordinates;
        this.cellCoords = { ...newCrds };
        this._gridNewCrds = undefined;
    }
}