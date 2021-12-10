
import { _decorator, director, Component, game, Director } from 'cc';
import { CONFIG } from '../../config';
import { ConfigStore } from './config-store';
const { ccclass } = _decorator;
const { LOADER_SCENE_NAME, GAME_SCENE_NAME } = CONFIG;

@ccclass('SceneSwitcher')
export class SceneSwitcher extends Component {
    private static _instance: SceneSwitcher;
    private static _currSceneName?: string;

    private _configStore = ConfigStore.get;

    onLoad() {
        SceneSwitcher._instance = this;
        game.addPersistRootNode(this.node);
        director.on(Director.EVENT_AFTER_SCENE_LAUNCH, this._onSceneLoaded);
    }    
    
    static switchLevel(): void {
        const trgSceneName = this._currSceneName === LOADER_SCENE_NAME ?
            GAME_SCENE_NAME : LOADER_SCENE_NAME;
        SceneSwitcher._switchLvlAsync(trgSceneName);
    }

    private _onSceneLoaded(): void {
        SceneSwitcher._currSceneName = director.getScene()?.name;     
        if (SceneSwitcher._currSceneName !== LOADER_SCENE_NAME) return;
        SceneSwitcher.switchLevel();
    }

    private static async _switchLvlAsync(
        trgSceneName: string
    ): Promise<void> {
        const switcher = SceneSwitcher._instance;
        trgSceneName === GAME_SCENE_NAME && 
            await switcher._configStore.getLevelInfoAsync('next');
            
        director.loadScene(trgSceneName, er => {
            if (er) throw er;
        });
    }
}