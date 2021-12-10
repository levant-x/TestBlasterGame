import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { LevelInfo } from '../../types';

export class ConfigStore {
    private static _instance = new ConfigStore();

    private _cfg?: LevelInfo;
    private _loadTask?: Promise<LevelInfo>;

    private constructor() { }

    static get isConfigLoaded(): boolean {
        return this._instance._cfg ? true : false;
    }

    static get get(): ConfigStore {     
        return this._instance;
    }

    async getLevelInfoAsync(
        targetLevel: 'current' | 'next'
    ): Promise<LevelInfo> {
        
        targetLevel === 'next' && this._increaseLevel();
        if (this._cfg) return this._cfg;

        if (!this._loadTask) this._loadTask = this._loadLvlInfoAsync();
        this._cfg = await this._loadTask;
        return this._cfg;
    }

    private _increaseLevel(): void {
        this._cfg = this._loadTask = undefined;
    }

    private async _loadLvlInfoAsync(): Promise<LevelInfo> {
        const lvlInfo = await CONFIG.loadLevelConfigAsync(); 
        return lvlInfo;
    }
}