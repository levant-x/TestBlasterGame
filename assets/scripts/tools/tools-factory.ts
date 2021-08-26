
import { _decorator, Node, resources, JsonAsset, Prefab, __private } from 'cc';
import { Config } from '../config';
import { LevelConfig, LevelSystemConfig } from '../types';
import { ItemGroupsAnalizer } from './item-groups-analizer';
import { TileSpawner, TileSpawnerArgs } from './tile-spawner';

type Type<T> = __private.Constructor<T>;
const LEVEL_SYS_CFG_PATH = 'level-sys-config';

export class ToolsFactory {
  private _gamelevel: number = 0;
  private static _typesFactory: Record<
    string, (args?: any) => any> = {
    TileSpawner: (args: TileSpawnerArgs) => new TileSpawner(args),
    ItemGroupsAnalizer: () => new ItemGroupsAnalizer(),
  }

  public static get<T>(type: Type<T>, args?: any): T {
    const typeName = type.name;
    const create = this._typesFactory[typeName];
    if (!create) throw 'Type creator not found!';
    else return create(args) as T;
  }

  public loadLevelConfigAsync(gamelevel: number): Promise<LevelConfig> {
    this._gamelevel = gamelevel;    
    return new Promise<LevelConfig>(resolve => this._loadLvlCnf(resolve));
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