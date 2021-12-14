
import { _decorator, Component, Label, ProgressBar } from 'cc';
import { Task } from '../../tools/common/task';
import { IScore, ISteps } from '../../types';
const { ccclass, property } = _decorator;

@ccclass('UI')
export class UI extends Component implements IScore, ISteps {
    private _currValue = 0;
    private _currDisplayedValue = 0;
    private _trgScore = 0;
    private _dt = 0;

    @property(Label)
    protected pointsNumLabel: Label;
    @property(Label)
    protected stepsNumLabel: Label;    
    @property(ProgressBar)
    protected scoreProgBar: ProgressBar;

    @property
    updateRate: number = 0.15;
    stepsNum = 0;

    get targetScore(): number {
        return this._trgScore;
    }

    set targetScore(val: number) {
        this._trgScore = val;
        this._updateScoreProgBar();
    }

    get value(): number {
        return this._currDisplayedValue;
    }

    update(dt: number) {
        this._updateLbl(this.stepsNum, this.stepsNumLabel);
        if (this._currDisplayedValue === this._currValue) return;

        this._dt += dt;
        if (this._dt < this.updateRate) return;
        else this._updateScore();
    }

    gainPoints(
        deltaValue: number
    ): Task {
        this._currValue += deltaValue;
        this._updateScoreProgBar();
        const scoreUpdateStatus = this._wasScoreUpdated.bind(this);
        return new Task(scoreUpdateStatus);
    }
    
    reset(): void {
        this._currDisplayedValue = this._currValue = 0;
    }

    private _wasScoreUpdated(): boolean {
        return this._currDisplayedValue === this._currValue;
    }

    private _updateScore(): void {
        this._dt = 0;
        this._currDisplayedValue++;
        this._updateLbl(this._currDisplayedValue, this.pointsNumLabel);
    }

    private _updateLbl(
        val: any, 
        lbl: Label, 
    ): void {
        lbl.string = val.toString();
    }

    private _updateScoreProgBar(): void {
        const { targetScore, _currValue } = this;
        this.scoreProgBar.progress = _currValue / targetScore; 
    }
}