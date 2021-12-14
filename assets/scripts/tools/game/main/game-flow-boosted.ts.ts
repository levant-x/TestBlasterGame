import { Booster } from "../../../controllers/main/booster";
import { injectable } from "../../../decorators";
import { BoosterType, ITile } from "../../../types";
import { GameFlow } from "./game-flow";

const BOOSTERS_ALLOWING_STEP: BoosterType[] = [
    'bomb', 'supertile',
];

@injectable('GameFlowBoosted')
export class GameFlowBoosted extends GameFlow {
    isStepValid(
        hitTiles: ITile[]
    ): boolean {
        const currBooster = Booster.current?.type;
        if (!currBooster) return super.isStepValid(hitTiles);
        return BOOSTERS_ALLOWING_STEP.includes(currBooster);
    }
}