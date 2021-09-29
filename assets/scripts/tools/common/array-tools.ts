
import { _decorator } from 'cc';

export function removeFromArray<T>(array: T[], item: T) {
    const itemIndex = array.indexOf(item);
    array.splice(itemIndex, 1);      
}

export function pickRandomItem<T>(array: T[]) {
    const rnd = Math.random() * (array.length - 1);
    const index = Math.round(rnd);
    return array[index];
}