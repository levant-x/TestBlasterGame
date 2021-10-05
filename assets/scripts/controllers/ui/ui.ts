
import { _decorator, Component, Label } from 'cc';
import { Task } from '../../tools/common/task';
import { IScore, ISteps } from '../../types';
const { ccclass, property } = _decorator;

@ccclass('UI')
export class UI extends Component implements IScore, ISteps {
    private _currValue = 0;
    private _trgValue = 0;
    private _dt = 0;

    public stepsNum = 0;
    @property(Label)
    pointsNumLabel?: Label;
    @property(Label)
    stepsNumLabel?: Label;    
    @property
    updateRate: number = 0.15;

    update(dt: number) {
        this._updateLbl(this.stepsNum, this.stepsNumLabel);
        if (this._currValue === this._trgValue) return;
        this._dt += dt;
        if (this._dt < this.updateRate) return;
        else this._updateScore();
    }

    public gainPoints(
        deltaPoints: number
    ): Task {
        this._trgValue += deltaPoints;
        const taskStatus = this._wasScoreUpdated.bind(this);
        return new Task().bundleWith(taskStatus);
    }

    public getPoints() {
        return this._currValue;
    }

    public reset(): void {
        this._currValue = this._trgValue = 0;
    }

    private _wasScoreUpdated() {
        return this._currValue === this._trgValue;
    }

    private _updateScore() {
        if (!this.pointsNumLabel) return;
        this._dt = 0;
        this._currValue++;
        this._updateLbl(this._currValue, this.pointsNumLabel);
    }

    private _updateLbl(
        val: any, 
        lbl?: Label, 
    ): void {
        if (!lbl) {
            console.warn('Text label undefined');    
            return;
        }    
        lbl.string = val.toString();
    }
}