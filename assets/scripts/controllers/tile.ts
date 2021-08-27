
import { _decorator, Component, Vec3, UITransform, Size, Node, Animation } from 'cc';
import { Config } from '../config';
import { Color, GridCellCoordinates, IClassifyable, ITile } from '../types';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component implements IClassifyable, ITile {    
    private static _size: Vec3 = Vec3.ZERO;
    private static _layoutOrigin?: Vec3; 

    private _cellCoords = { row: 0, col: 0, };
    
    @property
    public color: Color = Color.blue;

    public static onClick: (sender: Tile) => void;
    public static is1stSeeding = true;

    onLoad() {
        if (Tile.is1stSeeding) this.setGreetingAnimationToPlay();    
        if (Tile._size !== Vec3.ZERO) return;   
        this._computeSizeParams();    
    } 

    start() {
        this.node.on(Node.EventType.MOUSE_UP, this.onClick);    
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_UP, this.onClick);
    }

    public getGroupID() {
        return Color[this.color];
    }

    public positionAtCell(coords: GridCellCoordinates) {
        const cellAbsPos = this.getCellAbsPosition(coords);
        this.node.setPosition(cellAbsPos);
        this._cellCoords = {...coords};
    }

    public moveToCell(
        gridCoords: GridCellCoordinates, 
        onComplete: (sender: ITile) => void
    ) {
        this.positionAtCell(gridCoords);
        onComplete(this);
    }

    public getCellCoordinates = (): GridCellCoordinates => {
        return this._cellCoords;
    }

    protected onClick = () => {
        Tile.onClick?.(this);
    }

    protected setGreetingAnimationToPlay() {
        const anim = this.node.getComponent(Animation) as Animation;
        anim.playOnLoad = true;
    }

    protected getCellAbsPosition({ 
        row, col }: GridCellCoordinates
    ) {
        const cellPosInGrid = new Vec3(col, row).multiply(Tile._size);    
        const cellAbsPos = Vec3.clone(Tile._layoutOrigin as Vec3)
            .add(cellPosInGrid);
        return cellAbsPos;
    }

    private _computeSizeParams() {
        const size = this.getComponent(UITransform)?.contentSize as Size;
        const { width, height } = size;    
        const minDim = Math.min(width, height);

        Tile._size = new Vec3(minDim, minDim);
        const hfSize = new Vec3(minDim / 2, minDim / 2);
        Tile._layoutOrigin = Vec3.clone(
            Config.LAYOUT_ORIGIN_LEFT_BOTTOM
        ).add(hfSize);
    }
}