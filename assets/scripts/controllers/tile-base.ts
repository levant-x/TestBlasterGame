
import { 
    _decorator, 
    Component, 
    Vec3, 
    UITransform, 
    Size,
    Node, 
    Animation 
} from 'cc';
import { CONFIG } from '../config';
import { 
    BooleanGetter, 
    Color, 
    GridCellCoordinates, 
    ITile 
} from '../types';
const { ccclass } = _decorator;

@ccclass('Tile-base')
export class TileBase extends Component implements ITile {    
    private static _size: Vec3 = Vec3.ZERO;
    private static _layoutOrigin?: Vec3; 

    private _cellCoords = { row: 0, col: 0, };

    protected color?: Color;

    static onClick: (sender: TileBase) => void;
    static is1stSeeding = true;
    static lastClickCoords?: GridCellCoordinates;

    get сellCoordinates(): GridCellCoordinates {
        return this._cellCoords;
    }

    get groupID(): string {
        if (!this.color) throw 'Color was not init!';
        return Color[this.color];
    }   

    onLoad() {
        this._setupColor();
        if (TileBase.is1stSeeding) this.setGreetingAnimationToPlay();    
        if (TileBase._size !== Vec3.ZERO) return;   
        this._computeSizeParams();    
    } 

    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    positionAtCell(
        coords: GridCellCoordinates
    ): void {
        const cellAbsPos = this.getCellAbsPosition(coords);
        this.node.setPosition(cellAbsPos);
        this.setCellCrds(coords);
    }

    moveToCellAsync(
        gridCoords: GridCellCoordinates
    ): BooleanGetter {
        this.positionAtCell(gridCoords);
        return () => true;
    } 

    destroyHitAsync(): BooleanGetter {
        this.node.destroy();
        return () => !this.isValid;
    }    

    protected onClick(): void {
        TileBase.onClick?.(this);
    }

    protected setCellCrds(
        crds: GridCellCoordinates
    ): void {
        this._cellCoords = {...crds};
    }

    protected setGreetingAnimationToPlay() {
        const anim = this.node.getComponent(Animation) as Animation;
        anim.playOnLoad = true;
    }

    protected getCellAbsPosition(
        { row, col }: GridCellCoordinates
    ): Vec3 {
        const cellPosInGrid = new Vec3(col, row).multiply(TileBase._size);    
        const cellAbsPos = Vec3
            .clone(TileBase._layoutOrigin as Vec3)
            .add(cellPosInGrid);
        return cellAbsPos;
    }

    private _computeSizeParams(): void {
        const size = this.getComponent(UITransform)?.contentSize as Size;
        const { width, height } = size;    
        const minDim = Math.min(width, height);

        TileBase._size = new Vec3(minDim, minDim);
        const hfSize = new Vec3(minDim / 2, minDim / 2);
        TileBase._layoutOrigin = Vec3
            .clone(CONFIG.LAYOUT_ORIGIN_LEFT_BOTTOM)
            .add(hfSize);
    }

    private _setupColor(): void {
        const { name } = this.node;
        const colorFromName = name.replace('tile-', '');
        this.color = colorFromName as unknown as Color;
    }
}