
import { _decorator } from 'cc';
import { ObservableCollection } from './observable-collection';
import { Task } from './task';

interface IIdentifiable {
    id: number;
}

export class TaskManager extends ObservableCollection<Task> {    
    private _cbcks: Record<number, Function | null> = {};
    private _lastID = 0;

    private constructor() {
        super();
    }

    public static create() {
        return new TaskManager();
    }

    public bundleWith(
        task: Task, callback?: Function
    ) {
        const result = super.bundleWith(task);
        if (!callback) return result;
        this._addID2Task(task);
        this._cbcks[this._lastID] = callback;
        this._lastID++;
        return result;
    }

    public isComplete(): boolean {
        if (!this.items.length) return true;
        for (const task of this.items) 
            if (!task.isComplete()) return false;
        for (const task of [...this.items]) this._clearCompleteTask(task);
        return true;
    }

    private _clearCompleteTask(
        task: Task
    ) {
        const taskIndex = this.items.indexOf(task);
        this.items.splice(taskIndex, 1);      
        const { id } = task as unknown as IIdentifiable;
        if (!this._cbcks[id]) return;
        (this._cbcks[id] as Function)();
        this._cbcks[id] = null;
    }

    private _addID2Task(
        task: Task
    ): void {
        Object.defineProperty(task, 'id', {
            value: this._lastID,
            enumerable: false,
            writable: false,
        });
    }
}