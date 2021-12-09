import { injectable, injectValueByKey } from "../../../../decorators";
import { LevelConfig } from "../../../../types";
import { HitTilesFinderBase } from "../hit-tiles-finder-base";
import { HitTilesFinderWrappable } from "../hit-tiles-finder-wrappable";
import { Bomb } from "./bomb";
import { Supertile } from "./supertile";

@injectable('HitTilesFinderBoosted')
export class HitTilesFinderBoosted extends HitTilesFinderWrappable {
    private _bomb: Bomb;
    private _sptile: Supertile;

    @injectValueByKey('config')
    private _cfg: LevelConfig;

    protected get canBeApplied(): boolean {
        this._bomb.config = this._sptile.config = this._cfg;
        return false;
    }

    constructor() {        
        const sptileWithBase = new Supertile(new HitTilesFinderBase());
        const bombWithSptile = new Bomb(sptileWithBase);
        super(bombWithSptile);

        this._bomb = bombWithSptile;
        this._sptile = sptileWithBase;
    }
}