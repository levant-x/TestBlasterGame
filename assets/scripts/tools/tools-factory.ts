
import { _decorator, Node, resources, JsonAsset, Prefab, __private } from 'cc';
import { Config } from '../config';
import { LooseTilesFinderTest } from '../tests/loose-tiles-finder-test';
import { LevelConfig, LevelSystemConfig } from '../types';
import { HitTilesFinder } from './hit-tiles-finder';
import { LooseTilesFinder } from './loose-tiles-finder';
import { TileOffsetter } from './tile-offsetter';
import { TileSpawner, TileSpawnerArgs } from './tile-spawner';

type Type<T> = __private.Constructor<T>;
const LEVEL_SYS_CFG_PATH = 'level-sys-config';

export class ToolsFactory {
  private _gamelevel: number = 0;
  private static _testsFactory: Record<
    string, (args?: any) => any> = {
    TileSpawner: (args: TileSpawnerArgs) => new TileSpawner(args),
    HitTilesFinder: () => new HitTilesFinder(),
    LooseTilesFinder : () => new LooseTilesFinder(),
    TileOffsetter: () => new TileOffsetter(),
  }

  public static get<T>(type: Type<T>, args?: any): T {
    const typeName = type.name;
    const create = this._testsFactory[typeName];
    if (!create) throw `Creator for ${typeName} not found!`;
    else return create(args);
  }

  public loadLevelConfigAsync(gamelevel: number): Promise<LevelConfig> {
    this._gamelevel = gamelevel;    
    return new Promise<LevelConfig>(resolve => 
      this._loadLvlCnf(resolve)
    );
  }

  private _loadLvlCnf(resolve: (cnf: LevelConfig) => void) {
    resources.load(LEVEL_SYS_CFG_PATH, (er, config: JsonAsset) => {
      resolve(this._onLvlCnfLoaded(er, config));
    });   
  }

  private _onLvlCnfLoaded(error: Error | null, config: JsonAsset) {
    if (error) throw error;
    
    const cfg = Config.Parse4Level(
      config.json as LevelSystemConfig, this._gamelevel);
    return cfg;
  }
}