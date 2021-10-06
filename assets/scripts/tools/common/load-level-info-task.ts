import { ConfigStore } from "../../controllers/scenes-switch/config-store";
import { LevelInfo } from "../../types";
import { Task } from "./task";

export function loadLevelInfoAsync(
    onLoad?: (levelInfo: LevelInfo) => void,
): Task {
    const getCfg = () => ConfigStore.getLevelInfo();
    const wait4ConfigTask = new Task()
        .bundleWith(() => getCfg() === undefined);

    ConfigStore.loadLevelInfoAsync().then(lvlInfo => {
        onLoad?.(lvlInfo);
    });
    return wait4ConfigTask;
}