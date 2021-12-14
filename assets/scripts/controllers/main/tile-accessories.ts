
import { _decorator, Component, Prefab, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileAccessories')
export class TileAccessories extends Component {
    private static _instance?: TileAccessories;

    @property(Prefab)
    supertileGlow: Prefab;
    @property(Prefab)
    destroyParticleEffect: Prefab;
    @property(AnimationClip)
    destroyAnimation: AnimationClip;

    static get get(): TileAccessories {
        return <TileAccessories>TileAccessories._instance;
    }

    start () {
        if (TileAccessories._instance)
            throw 'Tile accessories must exist only single';
        TileAccessories._instance = this;
    }
    
    onDestroy() {
        TileAccessories._instance = undefined;
    }
}