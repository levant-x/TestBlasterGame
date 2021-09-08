
import { _decorator, Component, Node, RichText } from 'cc';
import { Task } from '../tools/common/task';
import { IScore } from '../types';
const { ccclass, property } = _decorator;

@ccclass('UI')
export class UI extends Component implements IScore {
    private _currValue = 0;
    private _trgValue = 0;
    private _dt = 0;

    @property(RichText)
    scoreLabel?: RichText;
    @property
    useStrict: boolean = true;
    @property
    updateRate: number = 0.15;

    update(dt: number) {
        if (this._currValue === this._trgValue) return;
        this._dt += dt;
        if (this._dt < this.updateRate) return;
        else this._updateScore();
    }

    public gainPoints(
        deltaPoints: number
    ): Task {
        const strictErr = this.useStrict && !this.scoreLabel;
        if (strictErr) throw 'Score display not specified';
        this._trgValue += deltaPoints;
        return new Task().bundleWith(this._wasScoreUpdated);
    }

    private _updateScore() {
        if (!this.scoreLabel) return;
        this._dt = 0;
        this._currValue++;
        this.scoreLabel.string = this._currValue.toString();
    }

    private _wasScoreUpdated = () => {
        return this._currValue === this._trgValue;
    }
}