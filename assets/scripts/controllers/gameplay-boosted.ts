
import { _decorator } from 'cc';
import { CONFIG } from '../config';
import { inject, injectable } from '../decorators';
import { Task } from '../tools/common/task';
import { TileShuffler } from '../tools/game/field-analyzers/tile-shuffler';
import { IBoostNotifier } from '../types';
import { GameplayBase } from './gameplay-base';
const { ccclass } = _decorator;

@ccclass('GameplayBoosted')
@injectable()
export class GameplayBoosted extends GameplayBase {
    @inject('TileShuffler')
    private _tileShuffler: TileShuffler;  
    @inject('IBoostNotifier')
    protected boostNotifier: IBoostNotifier;  
    
    start() {
        super.start();
        this._checkStepAfterDelay();
    }

    update() {
        super.update();
        this.checkCurrBooster();
    }

    protected checkCurrBooster() {
        const currBooster = this.boostNotifier.getCurrentBooster();
        if (!currBooster || currBooster !== 'shuffle') return;
        this._applyShuffle();
        this.boostNotifier.dropBoosterStatus();
    }

    private _checkStepAfterDelay() {
        let toResume = false;    
        this.scheduleOnce(() => toResume = true, CONFIG.FLOW_DELAY_SEC);
        const waitingTask = new Task().bundleWith(() => toResume);

        const { gameFlowMng } = this;
        const stepRslCheck = gameFlowMng.runStepResult.bind(gameFlowMng);
        this.taskMng.bundleWith(waitingTask, stepRslCheck);
    }

    private _applyShuffle(): void {
        const shuffleTask = this._tileShuffler.shuffle();
        const checkStep = this._checkStepAfterDelay.bind(this);
        this.taskMng.bundleWith(shuffleTask, checkStep);
    }
}