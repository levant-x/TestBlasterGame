import { _decorator, Component, game } from 'cc';
import { CONFIG } from '../../config';
import { LevelInfo } from '../../types';
const { ccclass } = _decorator;

@ccclass('ConfigStore')
export class ConfigStore extends Component {
    private static _currLevel = -1;
    private static _cfg: LevelInfo;

    onLoad() {
        game.addPersistRootNode(this.node);
    }

    public async loadNextConfigAsync() {
        ConfigStore._currLevel++;
        await ConfigStore._loadConfigAsync();
    }

    public static getConfig(): LevelInfo {
        if (!ConfigStore._cfg) {
            ConfigStore._currLevel++;
            ConfigStore._loadConfigAsync();
        }
        return ConfigStore._cfg as LevelInfo;
    }

    public static async _loadConfigAsync() {
        const cfg = await 
            CONFIG.loadLevelConfigAsync(this._currLevel); 
        ConfigStore._cfg = cfg;
    }
}