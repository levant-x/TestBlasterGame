import { _decorator, Component, game } from 'cc';
import { CONFIG } from '../../config';
import { LevelInfo } from '../../types';
const { ccclass } = _decorator;

@ccclass('ConfigStore')
export class ConfigStore extends Component {
    private static _currLevel = -1;
    private static _cfg?: LevelInfo;

    onLoad() {
        game.addPersistRootNode(this.node);
    }

    async loadNextConfigAsync(): Promise<void> {
        ConfigStore._currLevel++;
        ConfigStore._cfg = undefined;
        await ConfigStore._loadLvlInfoAsync();
    }

    static getLevelInfo(): LevelInfo | undefined {
        return ConfigStore._cfg;
    }

    static async loadLevelInfoAsync(): Promise<LevelInfo> {
        if (ConfigStore._cfg) return ConfigStore._cfg;

        ConfigStore._currLevel < 0 && ConfigStore._currLevel++;
        ConfigStore._cfg = await ConfigStore._loadLvlInfoAsync();
        return ConfigStore._cfg;
    }

    private static async _loadLvlInfoAsync(): Promise<LevelInfo> {
        const lvlInfo = await 
            CONFIG.loadLevelConfigAsync(this._currLevel); 
        return lvlInfo;
    }
}