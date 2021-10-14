
import { _decorator } from 'cc';
import { CONFIG } from '../config';
import { inject, injectable } from '../decorators';
import { Task } from '../tools/common/task';
import { TileShuffler } from '../tools/game/field-analyzers/tile-shuffler';
import { GridCellCoordinates, IBoosterManager, ITile } from '../types';
import { GameplayBase } from './gameplay-base';
import { TileBase } from './tile-base';
const { ccclass } = _decorator;

@ccclass('GameplayBoosted')
@injectable()
export class GameplayBoosted extends GameplayBase {
    @inject('TileShuffler')
    private _tileShuffler: TileShuffler;  
    @inject('IBoosterManager')
    protected boosterManager: IBoosterManager; 

    update() {
        super.update();
        this.checkCurrentBooster();
    }

    onDestroy() {
        TileBase.lastClickCoords = undefined;
        this.boosterManager.dropBoosterStatus();
        super.onDestroy?.();        
    }

    protected init(): void {
        super.init();
        this._checkStepAfterDelay();
    }

    protected checkCurrentBooster(): void {
        const currBooster = this.boosterManager.getCurrentBooster();
        if (!currBooster || !this.taskMng.isComplete()) return;

        currBooster === 'shuffle' && this._applyShuffle();
        currBooster === 'supertile' && this._applySupertile();
    }

    protected onTileClick(
        sender: ITile
    ): void {
        TileBase.lastClickCoords = sender.getCellCoordinates();
        super.onTileClick(sender);
    }

    protected introduceDelay(): Task {
        let toResume = false;    
        this.scheduleOnce(() => toResume = true, CONFIG.FLOW_DELAY_SEC);
        return new Task().bundleWith(() => toResume);
    }

    protected onStepEnd(): void {
        const lastBooster = this.boosterManager.getCurrentBooster();
        this.boosterManager.dropBoosterStatus();
        super.onStepEnd();
        if (lastBooster || this.gameFlowMng.isStepFinal()) return;
        this._tryCreateSupertile();
    }

    private _checkStepAfterDelay(): void {        
        const stepRslCheckTask = this.onStepEnd.bind(this);
        this.taskMng.bundleWith(this.introduceDelay(), stepRslCheckTask);
    }

    private _applyShuffle(): void {
        TileBase.lastClickCoords = undefined;
        const shuffleTask = this._tileShuffler.shuffle();
        const checkStep = this._checkStepAfterDelay.bind(this);
        this.taskMng.bundleWith(shuffleTask, checkStep);
    }

    private _applySupertile(): void {
        const { row, col, } =  
            TileBase.lastClickCoords as GridCellCoordinates;
        const supertile = this.gamefield[col][row];
        super.onTileClick(supertile);
    }

    private _tryCreateSupertile(): void {
        if (!TileBase.lastClickCoords) return;
        this.boosterManager.tryApplyBooster('supertile');
    }
}