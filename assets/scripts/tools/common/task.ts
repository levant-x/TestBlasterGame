
import { _decorator } from 'cc';
import { BooleanGetter } from '../../types';
import { ObservableCollection } from './observable-collection';

export class Task extends ObservableCollection<BooleanGetter> {
    item?: any;

    isComplete() {
        return this.getStatus(this.items);
    }
}

