
import { _decorator } from 'cc';

export function removeFromArray<T>(array: T[], item: T) {
    const itemIndex = array.indexOf(item);
    array.splice(itemIndex, 1);      
}