
import { _decorator } from 'cc';
import { removeFromArray } from './array-tools';
import { ObservableCollection } from './observable-collection';
import { Task } from './task';

const _CALLBACKS_NUM_2CLEANUP = 50;

export class TaskManager extends ObservableCollection<Task> {      
    private _cbcks: Record<number | string, Function | null> = {};
    private _cbcksNum = 0;

    private constructor() {
        super();
    }

    static create() {
        return new TaskManager();
    }

    get isComplete(): boolean {
        if (!this.items.length) return true;
        for (const task of this.items) 
            if (!task.isComplete) return false;

        for (const task of [...this.items]) this._clearCompleteTask(task);
        return true;
    }

    bundleWith(
        task: Task, 
        callback?: Function
    ): this {        
        const result = super.bundleWith(task);
        if (callback) {
            this._cbcks[task.groupID] = callback;
            this._cbcksNum++;
        }
        return result;
    }

    private _clearCompleteTask(
        task: Task
    ): void {
        removeFromArray(this.items, task);
        const cbck = this._cbcks[task.groupID];
        cbck?.();

        this._cbcks[task.groupID] = null;
        this._cleanupCbcksStore();
    }

    private _cleanupCbcksStore(): void {
        if (this._cbcksNum <= _CALLBACKS_NUM_2CLEANUP ||
            Object.values(this._cbcks).some(cbck => cbck)) return;
        this._cbcks = {};
        this._cbcksNum = 0;
    }
}