import { _decorator } from 'cc';
import { loadLevelConfigAsync } from '../../tools/common/config-reader';
import { LevelConfig } from '../../types';

export class ConfigStore {
    private static _instance = new ConfigStore();

    private _cfg?: LevelConfig;
    private _loadTask?: Promise<LevelConfig>;

    private constructor() { }

    static get isConfigLoaded(): boolean {
        return this._instance._cfg ? true : false;
    }

    static get get(): ConfigStore {     
        return this._instance;
    }

    async getLevelInfoAsync(
        targetLevel: 'current' | 'next'
    ): Promise<LevelConfig> {
        
        targetLevel === 'next' && this._increaseLevel();
        if (this._cfg) return this._cfg;

        if (!this._loadTask) this._loadTask = this._loadLvlInfoAsync();
        this._cfg = await this._loadTask;
        return this._cfg;
    }

    private _increaseLevel(): void {
        this._cfg = this._loadTask = undefined;
    }

    private async _loadLvlInfoAsync(): Promise<LevelConfig> {
        const lvlInfo = await loadLevelConfigAsync(); 
        return lvlInfo;
    }
}