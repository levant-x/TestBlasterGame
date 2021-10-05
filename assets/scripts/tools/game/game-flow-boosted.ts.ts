import { inject, injectable } from "../../decorators";
import { IBoostNotifier, ITile } from "../../types";
import { GameFlow } from "./game-flow";

@injectable()
export class GameFlowBoosted extends GameFlow {
    @inject('IBoostNotifier')
    protected boostNotifier: IBoostNotifier;

    isStepValid(
        hitTiles: ITile[]
    ): boolean {
        const currBooster = this.boostNotifier.getCurrentBooster();
        if (currBooster) return ['bomb'].includes(currBooster);
        return super.isStepValid(hitTiles);
    }
}