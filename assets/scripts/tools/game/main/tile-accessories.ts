
import { _decorator, Component, Node, Prefab, ParticleSystem2D, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileAccessories')
export class TileAccessories extends Component {
    private static _instance?: TileAccessories;

    @property(Prefab)
    supertileGlow: Node;
    @property(Prefab)
    destroyParticleEffect: ParticleSystem2D;
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