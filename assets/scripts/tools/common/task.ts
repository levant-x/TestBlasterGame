
import { _decorator } from 'cc';
import { BooleanGetter, IClassifyable } from '../../types';
import { ObservableCollection } from './observable-collection';

export class Task extends ObservableCollection<BooleanGetter>
    implements IClassifyable {
    private _id = Math.round(Math.random() * 1000000);
    
    get groupID(): number | string {
        return this._id;
    }
        
    get isComplete(): boolean {
        return this.getStatus(this.items);
    }
}

