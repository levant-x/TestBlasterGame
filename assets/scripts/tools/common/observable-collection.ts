
import { _decorator } from 'cc';
import { BooleanGetter } from '../../types';

export abstract class ObservableCollection<T> {
    protected items: T[] = [];
    
    bundleWith(item: T) {
        this.items.push(item);
        return this;
    }

    abstract get isComplete(): boolean;

    protected getStatus(statusGetters: BooleanGetter[]) {
        return statusGetters.every(isTrue => isTrue());
    }
}