
import { _decorator } from 'cc';
import { BooleanGetter } from '../../types';
import { ObservableCollection } from './observable-collection';

export class Task extends ObservableCollection<BooleanGetter> {
    public isComplete() {
        return this.getStatus(this.items);
    }
}

