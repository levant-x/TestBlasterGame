import { RangeX, RangeY } from "../../../config";
import { GridCellCoordinates } from "../../../types";

/**Range bounds are included to the scanning */
export function scanHoriz(
    { left, right }: RangeX,
    callback: (x: number) => void,
): void {
    for (let col = left; col <= right; col++) callback(col);
}

/**Range bounds are included to the scanning */
export function scanVertical(
    { top, bottom }: RangeY,
    callback: (y: number) => void,
): void {
    for (let row = bottom; row <= top; row++) callback(row);
}

/**Range bounds are included to the scanning */
export function scanGrid(
    rangeX: RangeX,
    rangeY: RangeY,
    callback: (crds: GridCellCoordinates) => void,
): void {
    scanHoriz(rangeX, x => {
        scanVertical(rangeY, y => {
            callback({ row: y, col: x, });
        });
    });
}