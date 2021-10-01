
import { _decorator } from 'cc';
import { inject, injectable } from '../decorators';
import { BoosterType, IBoostNotifier } from '../types';
import { GameplayBase } from './gameplay-base';
import { CONFIG } from '../config';
import { Task } from '../tools/common/task';
const { ccclass } = _decorator;

@ccclass('GameplayBoosted')
@injectable()
export class GameplayBoosted extends GameplayBase {
    @inject('IBoostNotifier')
    protected boostNotifier: IBoostNotifier;

    start() {
        super.start();
        this.boostNotifier.onBoosterApply = this.onBoosterApply;
        this._checkStepAfterDelay();        
    }
    
    protected onBoosterApply = (
        task: Task,
        type: BoosterType,
    ): void => {
        const cbck = type === 'shuffle' ? 
            () => this._checkStepAfterDelay() : undefined;
        this.taskMng.bundleWith(task, cbck);
    }

    private _checkStepAfterDelay = () => {
        let toResume = false;
        this.scheduleOnce(() => toResume = true,
            CONFIG.FLOW_DELAY_SEC);
        const waitingTask = new Task().bundleWith(() => toResume);
        const stepRslCheck = this.gameFlowMng.runStepResult;
        this.taskMng.bundleWith(waitingTask, stepRslCheck);
    }
}