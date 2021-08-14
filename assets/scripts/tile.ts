
import { _decorator, Component, Vec3, UITransform, Size } from 'cc';
import { Config } from './config';
import { Color } from './types';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {      
  private static _size?: Vec3 = undefined;
  private static _layoutOrigin?: Vec3 = undefined; 
  
  @property
  public color: Color = 'blue';

  onLoad() {
    if (Tile._size) return;   
    this._computeSizeParams();
  } 

  public positionAtCell(col: number, row: number) {
    if (!Tile._size) throw 'Tile size not initialized';

    const cellPosInGrid = new Vec3(col, row).multiply(Tile._size);    
    const cellAbsPos = Vec3.clone(Tile._layoutOrigin as Vec3).add(cellPosInGrid);
    this.node.setPosition(cellAbsPos);
  }

  private _computeSizeParams() {
    const size = this.getComponent(UITransform)?.contentSize as Size;
    const { width, height } = size;    
    const minDim = Math.min(width, height);

    Tile._size = new Vec3(minDim, minDim);
    const hfSize = new Vec3(minDim / 2, minDim / 2);
    Tile._layoutOrigin = Vec3.clone(Config.layoutOriginLeftBottom).add(hfSize);
  }
}