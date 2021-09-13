import { _decorator, Component, game } from 'cc';
import { CONFIG } from '../../config';
import { LevelConfig } from '../../types';
const { ccclass } = _decorator;

@ccclass('ConfigStore')
export class ConfigStore extends Component {
    private static _currLevel = -1;
    private static _cfg: LevelConfig;

    onLoad() {
        game.addPersistRootNode(this.node);
    }

    public async loadNextConfigAsync() {
        ConfigStore._currLevel++;
        await ConfigStore._loadConfigAsync();
    }

    public static getConfig(): LevelConfig {
        if (!ConfigStore._cfg) {
            ConfigStore._currLevel++;
            ConfigStore._loadConfigAsync();
        }
        return ConfigStore._cfg as LevelConfig;
    }

    public static async _loadConfigAsync() {
        const cfg = await 
            CONFIG.loadLevelConfigAsync(this._currLevel); 
        ConfigStore._cfg = cfg;
    }
}