
import { _decorator, director, Component, game } from 'cc';
import { ConfigStore } from './config-store';
const { ccclass } = _decorator;

const LOADER_SCENE_NAME = 'scene-switcher';
const GAME_SCENE_NAME = 'game';

@ccclass('SceneSwitcher')
export class SceneSwitcher extends Component {
    private static _instance: SceneSwitcher;

    private _configStore = ConfigStore.get();

    onLoad() {
        SceneSwitcher._instance = this;
        game.addPersistRootNode(this.node);
    }

    start () {
        SceneSwitcher.switchLevel();
    }
    
    static switchLevel(): void {
        const currSceneName = director.getScene()?.name;        
        const trgSceneName = currSceneName === LOADER_SCENE_NAME ?
            GAME_SCENE_NAME : LOADER_SCENE_NAME;
        SceneSwitcher._switchLvlAsync(trgSceneName);
    }

    private static async _switchLvlAsync(
        trgSceneName: string
    ): Promise<void> {
        const switcher = SceneSwitcher._instance;
        trgSceneName === GAME_SCENE_NAME && 
            await switcher._configStore.loadNextLevelInfoAsync();
        director.loadScene(trgSceneName, (er) => {
            if (er) throw er;
        });
    }
}