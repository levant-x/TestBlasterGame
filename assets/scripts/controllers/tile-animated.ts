
import { _decorator, Vec3, tween } from 'cc';
import { Config } from '../config';
import { GridCellCoordinates } from '../types';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('Tile-animated')
export class TileAnimated extends TileBase {
    private _hasMoveCompleted = false;

    public moveToCellAsync = (
        gridNewCoords: GridCellCoordinates
    ) => {
        this._hasMoveCompleted = false; 
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
        ).call(() => { 
            this._hasMoveCompleted = true; 
        }).start();
    }
}