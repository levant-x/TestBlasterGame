
import { _decorator } from 'cc';
import { BooleanGetter } from '../../types';

export abstract class ObservableCollection<T> {
    protected items: T[] = [];
    
    public bundleWith(item: T) {
        this.items.push(item);
        return this;
    }

    public abstract isComplete(): boolean;

    protected getStatus(statusGetters: BooleanGetter[]) {
        return statusGetters.every(isTrue => isTrue());
    }
}