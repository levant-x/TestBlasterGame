
import { _decorator, Node, resources, JsonAsset, Prefab } from 'cc';
import { Config } from '../config';
import { LevelConfig, LevelSystemConfig } from '../types';
import { TileSpawner } from './tile-spawner';

export class ToolsInitializer {
  private _gamelevel: number = 0;

  public loadLevelConfigAsync(gamelevel: number): Promise<LevelConfig> {
    this._gamelevel = gamelevel;    
    return new Promise<LevelConfig>(resolve => this._loadLvlCnf(resolve));
  }

  public createTileSpawner(
    config: LevelConfig, fieldNode: Node, tilePrefabs: Prefab[]) {
    return new TileSpawner({
      rows: config.fieldHeight,
      cols: config.fieldWidth,
      fieldNode: fieldNode,
      prefabs: tilePrefabs,
    });
  }

  private _loadLvlCnf(resolve: (cnf: LevelConfig) => void) {
    resources.load('level-sys-config', (er, config: JsonAsset) => {
      resolve(this._onLvlCnfLoaded(er, config));
    });   
  }

  private _onLvlCnfLoaded(error: Error | null, config: JsonAsset) {
    if (error) throw error;
    
    const cnf = Config.Parse4Level(
      config.json as LevelSystemConfig, this._gamelevel);
    return cnf;
  }
}