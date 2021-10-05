
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
import { BooleanGetter, Color, GridCellCoordinates, ITile } from '../types';
const { ccclass } = _decorator;

@ccclass('Tile-base')
export class TileBase extends Component implements ITile {    
    private static _size: Vec3 = Vec3.ZERO;
    private static _layoutOrigin?: Vec3; 

    protected cellCoords = { row: 0, col: 0, };
    protected color?: Color;

    public static onClick: (sender: TileBase) => void;
    public static is1stSeeding = true;

    onLoad() {
        this._setupColor();
        if (TileBase.is1stSeeding) this.setGreetingAnimationToPlay();    
        if (TileBase._size !== Vec3.ZERO) return;   
        this._computeSizeParams();    
    } 

    start() {
        this.node.on(Node.EventType.MOUSE_UP, this.onClick.bind(this));    
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_UP, this.onClick.bind(this));
    }

    getGroupID() {
        if (!this.color) throw 'Color was not init!';
        return Color[this.color];
    }   

    getCellCoordinates(): GridCellCoordinates {
        return this.cellCoords;
    }

    positionAtCell(coords: GridCellCoordinates) {
        const cellAbsPos = this.getCellAbsPosition(coords);
        this.node.setPosition(cellAbsPos);
        this.cellCoords = { ...coords };
    }

    moveToCellAsync(
        gridCoords: GridCellCoordinates
    ): BooleanGetter {
        this.positionAtCell(gridCoords);
        return () => true;
    } 

    destroyHitAsync() {
        this.node.destroy();
        return () => !this.isValid;
    }    

    protected onClick() {
        TileBase.onClick?.(this);
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

    private _computeSizeParams() {
        const size = this.getComponent(UITransform)?.contentSize as Size;
        const { width, height } = size;    
        const minDim = Math.min(width, height);

        TileBase._size = new Vec3(minDim, minDim);
        const hfSize = new Vec3(minDim / 2, minDim / 2);
        TileBase._layoutOrigin = Vec3
            .clone(CONFIG.LAYOUT_ORIGIN_LEFT_BOTTOM)
            .add(hfSize);
    }

    private _setupColor() {
        const { name } = this.node;
        const colorFromName = name.replace('tile-', '');
        this.color = colorFromName as unknown as Color;
    }
}