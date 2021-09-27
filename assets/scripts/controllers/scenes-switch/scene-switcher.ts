
import { _decorator, director, Component } from 'cc';
import { CONFIG } from '../../config';
import { ConfigStore } from './config-store';
const { ccclass, property } = _decorator;

@ccclass('SceneSwitcher')
export class SceneSwitcher extends Component {
    private static _instance?: SceneSwitcher;

    @property(ConfigStore)
    configStore?: ConfigStore;

    onLoad() {
        SceneSwitcher._instance = this;
    }

    start () {
        SceneSwitcher.switchLevel();
    }
    
    public static switchLevel = (
        newSceneName = CONFIG.DEFAULT_SCENE_NAME
    ): void => {
        SceneSwitcher._instance?._switchLvlAsync(newSceneName);
    }

    private async _switchLvlAsync(
        newSceneName: string
    ): Promise<void> {
        await this.configStore?.loadNextConfigAsync();
        director.loadScene(newSceneName, (er, scene) => {
            if (er) throw er;
            else if (!scene) throw 'Scene not found';
        });
    }
}