
import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { inject, injectable } from '../../decorators';
import { dispatchValue } from '../../tools/common/di';
import { Task } from '../../tools/common/task';
import { scanVertical } from '../../tools/game/field-analyzers/range-scanners.ts';
import { TileShuffler } from '../../tools/game/field-analyzers/tile-shuffler';
import { GridCellCoordinates, ISupertile, ITile } from '../../types';
import { Booster } from './booster';
import { GameplayBase } from './gameplay-base';
const { ccclass } = _decorator;

@ccclass('GameplayBoosted')
@injectable()
export class GameplayBoosted extends GameplayBase {
    @inject('TileShuffler')
    private _tileShuffler: TileShuffler;  
    private _wasSptileJustDrawn = false;
    private _lastClickCoords: GridCellCoordinates;

    start() {
        super.start();
        const cooldownStatus = () => !this.isStepPossible();
        dispatchValue('stepCooldown', cooldownStatus);
    }

    update() {
        super.update();
        this.tryApplyPassiveBoosters();
    }

    onDestroy() {
        Booster.current?.drop();
        super.onDestroy?.();        
    }

    protected init(): void {
        super.init();
        this._checkStepAfterDelay();
    }

    protected onTileClick(
        sender: ITile
    ): void {
        if (!this.isStepPossible()) return;

        this._lastClickCoords = sender.сellCoordinates;
        this._tryCreateSptile();
        super.onTileClick(sender);
    }

    protected introduceDelay(): Task {
        let toResume = false;    
        this.scheduleOnce(() => toResume = true, CONFIG.FLOW_DELAY_SEC);
        return new Task(() => toResume);
    }

    protected onStepEnd(): void {
        super.onStepEnd();

        if (this._wasSptileJustDrawn) {            
            const { col, row } = this._lastClickCoords;            
            const sptile = <ISupertile>this.gamefield[col][row];
            sptile.isSuper = true;
            this._reorderTilesToShowSptile(sptile);
        }
        this.tryApplyPassiveBoosters();
        Booster.current?.drop();
    }

    protected tryApplyPassiveBoosters(): void {
        const currBooster = Booster.current?.type;
        currBooster === 'shuffle' && this._applyShuffle();
    }

    private _checkStepAfterDelay(): void {        
        const stepRslCheckTask = this.onStepEnd.bind(this);
        this.taskMng.bundleWith(this.introduceDelay(), stepRslCheckTask);
    }

    private _applyShuffle(): void {
        const shuffleTask = this._tileShuffler.shuffle();
        const checkStep = this._checkStepAfterDelay.bind(this);

        this._wasSptileJustDrawn = false;
        this.taskMng.bundleWith(shuffleTask, checkStep);
        Booster.current?.drop();
    }

    private _tryCreateSptile(): void {
        if (this._wasSptileJustDrawn) this._wasSptileJustDrawn = false;
        else this._wasSptileJustDrawn = Booster.tryApply('supertile');
    }

    private _reorderTilesToShowSptile(
        sptile: ITile
    ): void {
        const itemsCnt = this.mask.children.length || 0;
        sptile.node.setSiblingIndex(itemsCnt);
        const { col } = sptile.сellCoordinates;

        const setToTop = (row: number) => this.gamefield[col][row]
            .node.setSiblingIndex(itemsCnt);
            
        scanVertical({
            top: this.height - 1,
            bottom: this._lastClickCoords.row + 1, 
        }, setToTop);
    }
}