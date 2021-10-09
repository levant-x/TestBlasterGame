import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { LevelInfo } from '../../types';

type TargetLevel = 'current' | 'next';

export class ConfigStore {
    private static _instance = new ConfigStore();

    private _currLevel = -1;
    private _cfg?: LevelInfo;
    private _loadTask?: Promise<LevelInfo>;

    private constructor() { }

    async getLevelInfoAsync(
        targetLevel: TargetLevel
    ): Promise<LevelInfo> {
        targetLevel === 'next' && this._increaseLevel();
        if (this._cfg) return this._cfg;

        this._currLevel < 0 && this._currLevel++;
        if (!this._loadTask) 
            this._loadTask = this._loadLvlInfoAsync();
        this._cfg = await this._loadTask;
        return this._cfg;
    }

    static isConfigLoaded(): boolean {
        return this._instance._cfg ? true : false;
    }

    static get(): ConfigStore {     
        return this._instance;
    }

    private _increaseLevel(): void {
        this._currLevel++;
        this._cfg = this._loadTask = undefined;
    }

    private async _loadLvlInfoAsync(): Promise<LevelInfo> {
        const lvlInfo = await 
            CONFIG.loadLevelConfigAsync(this._currLevel); 
        return lvlInfo;
    }
}