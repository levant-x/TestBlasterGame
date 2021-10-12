import { inject, injectable } from "../../decorators";
import { BoosterType, IBoostNotifier, ITile } from "../../types";
import { GameFlow } from "./game-flow";

const BOOSTERS_ALLOWING_STEP: BoosterType[] = [
    'bomb', 'supertile',
];

@injectable()
export class GameFlowBoosted extends GameFlow {
    @inject('IBoostNotifier')
    protected boostNotifier: IBoostNotifier;

    isStepValid(
        hitTiles: ITile[]
    ): boolean {
        const currBooster = this.boostNotifier.getCurrentBooster();
        if (!currBooster) return super.isStepValid(hitTiles);
        return BOOSTERS_ALLOWING_STEP.includes(currBooster);
    }
}