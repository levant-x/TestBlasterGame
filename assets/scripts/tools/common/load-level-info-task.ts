import { ConfigStore } from "../../controllers/scenes-switch/config-store";
import { LevelConfig } from "../../types";
import { Task } from "./task";

export function loadLevelInfoAsync(
    onLoad?: (levelInfo: LevelConfig) => void,
): Task {
    const isCfgLoaded = () => ConfigStore.isConfigLoaded;
    const wait4ConfigTask = new Task()
        .bundleWith(isCfgLoaded);
    ConfigStore.get.getLevelInfoAsync('current')
        .then(lvlInfo => onLoad?.(lvlInfo));
    return wait4ConfigTask;
}