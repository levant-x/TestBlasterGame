import { _decorator } from 'cc';
import { CONFIG } from '../../config';
import { LevelInfo } from '../../types';

export class ConfigStore {
    private static _instance = new ConfigStore();

    private _currLevel = -1;
    private _cfg?: LevelInfo;
    private _loadTask?: Promise<LevelInfo>;

    private constructor() { }

    async loadNextLevelInfoAsync(): Promise<void> {
        this._currLevel++;
        this._cfg = this._loadTask = undefined;
        await this._loadLvlInfoAsync();
    }

    async getLevelInfoAsync(): Promise<LevelInfo> {
        if (this._cfg) return this._cfg;
        this._currLevel < 0 && this._currLevel++;

        if (!this._loadTask) 
            this._loadTask = this._loadLvlInfoAsync();
        this._cfg = await this._loadTask;
        return this._cfg;
    }

    static isConfigLoaded(): boolean {
        return this._instance._cfg !== undefined;
    }

    static get(): ConfigStore {     
        return this._instance;
    }

    private async _loadLvlInfoAsync(): Promise<LevelInfo> {
        const lvlInfo = await 
            CONFIG.loadLevelConfigAsync(this._currLevel); 
        return lvlInfo;
    }
}