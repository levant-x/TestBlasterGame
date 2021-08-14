
import { _decorator, Component, Prefab } from 'cc';
import { TileSpawner } from '../tools/tile-spawner';
import { ToolsInitializer } from '../tools/tools-initializer';
import { LevelConfig } from '../types';
import { Tile } from './tile';
const { ccclass, property } = _decorator;


@ccclass('Gameplay')
export class Gameplay extends Component {
  private _curLevel = 0;
  private _cnf: LevelConfig | null = null;
  private _tileSpawner?: TileSpawner;
  private _toolsInitializer = new ToolsInitializer();
  
  protected fieldMap: Tile[][] = []; // use as [row][col]

  @property({ type: [Prefab] })
  private tilePrefabs: Prefab[] = [];

  async start () {
    this._cnf = await this._toolsInitializer.loadLevelConfigAsync(this._curLevel);
    this._tileSpawner = this._toolsInitializer.createTileSpawner(
      this._cnf as LevelConfig, this.node, this.tilePrefabs);  
    this._tileSpawner.spawnAtEntireField(this.onTileSpawn);
  }
     
  protected onTileSpawn = (tileLogic: Tile) => {
    const { col } = tileLogic.getCellCoordinates();
    if (this.fieldMap.length < col + 1) this.fieldMap.push([]);
    this.fieldMap[col].push(tileLogic);
  }
}