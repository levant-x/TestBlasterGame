
import { _decorator, Component, resources, JsonAsset, Prefab } from 'cc';
import { Config } from './config';
import { TileSpawner } from './tile-spawner';
import { LevelConfig, LevelSystemConfig } from './types';
const { ccclass, property } = _decorator;


@ccclass('Gameplay')
export class Gameplay extends Component {
  private curLevel = 0;
  private cnf: LevelConfig | null = null;
  private tileSpawner?: TileSpawner;

  @property({ type: [Prefab] })
  private tilePrefabs: Prefab[] = []

  async start () {
    await this._loadLvlCnfAsync(); 
    this._createTileSpawner();
    this.tileSpawner?.spawnAtEntireField();
  }
   
  private _loadLvlCnfAsync(): Promise<void> {
    return new Promise<void>(resolve => this._loadLvlCnf(resolve));
  }

  private _loadLvlCnf(resolve: () => void) {
    resources.load('level-sys-config', (er, config: JsonAsset) => {
      this._onLvlCnfLoaded(er, config);
      resolve();
    });   
  }

  private _onLvlCnfLoaded(error: Error | null, config: JsonAsset) {
    if (error) throw error;
    
    const cnf = Config.Parse4Level(
      config.json as LevelSystemConfig, this.curLevel);
    this.cnf = cnf;
  }

  private _createTileSpawner() {
    if (!this.cnf) throw 'Config has not been initialized';

    this.tileSpawner = new TileSpawner({
      rows: this.cnf.fieldHeight,
      cols: this.cnf.fieldWidth,
      fieldNode: this.node,
      prefabs: this.tilePrefabs,
    });
  }
}