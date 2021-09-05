
import { _decorator } from 'cc';
import { BooleanGetter } from '../types';

abstract class CheckableCollection<T> {
    protected items: T[] = [];
    
    public bundleWith(item: T) {
        this.items.push(item);
    }

    public abstract isComplete(): boolean;

    protected getStatus(statusGetters: BooleanGetter[]) {
        return statusGetters.every(isTrue => isTrue());
    }
}

export class Task extends CheckableCollection<
    BooleanGetter> {
    public isComplete() {
        return this.getStatus(this.items);
    }
}

export class TaskManager {
    private _currTask?: Task;
    private _currCbck?: () => void;

    private constructor() { }

    public runCurrent() {
        if (!this.isComplete()) return;
        this._currTask = undefined;
        this._currCbck?.();
    }

    public isComplete(): boolean {
        const task = this._currTask;
        return !task || !task.isComplete();
    }

    public setTask(task: Task, callback?: () => void) {
        this._currTask = task;
        this._currCbck = callback;
    }

    public static create() {
        return new TaskManager();
    }
}