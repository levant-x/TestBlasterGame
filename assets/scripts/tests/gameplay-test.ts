
import { _decorator } from 'cc';
import { GameplayBase } from '../controllers/main/gameplay-base';
const { ccclass } = _decorator;

@ccclass('Gameplay Test')
export class GameplayTest extends GameplayBase {
  async start() {
    await super.start();
    this._tileAt12hasCoordsCol1Row2();
  }

  private _tileAt12hasCoordsCol1Row2() {
    const tileAt12 = this.gamefield[1][2];
    const { col, row } = tileAt12.сellCoordinates;
    if (col !== 1) throw `Tile column equals ${col}`;
    if (row !== 2) throw `Tile row equals ${row}`;
    console.warn('Tile at (1;2): position is correct');    
  }
}