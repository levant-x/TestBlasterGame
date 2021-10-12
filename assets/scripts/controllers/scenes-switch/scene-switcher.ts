
import { _decorator, director, Component, game, Director } from 'cc';
import { ConfigStore } from './config-store';
const { ccclass } = _decorator;

const LOADER_SCENE_NAME = 'scene-switcher';
const GAME_SCENE_NAME = 'game';

@ccclass('SceneSwitcher')
export class SceneSwitcher extends Component {
    private static _instance: SceneSwitcher;
    private static _currSceneName?: string;

    private _configStore = ConfigStore.get();

    onLoad() {
        console.warn('loader loaded');
        
        SceneSwitcher._instance = this;
        game.addPersistRootNode(this.node);
        const eventKey = Director.EVENT_AFTER_SCENE_LAUNCH;
        director.on(eventKey, this._onSceneLoaded);
    }    
    
    static switchLevel(): void {
        const trgSceneName = this._currSceneName === LOADER_SCENE_NAME ?
            GAME_SCENE_NAME : LOADER_SCENE_NAME;
        SceneSwitcher._switchLvlAsync(trgSceneName);
    }

    private _onSceneLoaded(): void {
        console.warn('scene loaded');
        
        SceneSwitcher._currSceneName = director.getScene()?.name;     
        if (SceneSwitcher._currSceneName !== LOADER_SCENE_NAME) return;
        SceneSwitcher.switchLevel();
    }

    private static async _switchLvlAsync(
        trgSceneName: string
    ): Promise<void> {
        const switcher = SceneSwitcher._instance;
        // debugger
        console.warn('loading scene ', trgSceneName);
        
        trgSceneName === GAME_SCENE_NAME && 
            await switcher._configStore.getLevelInfoAsync('next');
        director.loadScene(trgSceneName, (er) => {
            if (er) throw er;
        });
    }
}