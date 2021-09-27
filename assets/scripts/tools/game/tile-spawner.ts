import { Node, instantiate, Prefab } from "cc";
import { TileBase } from "../../controllers/tile-base";
import { 
    GridCellCoordinates, 
    ITile, 
    ITileSpawner,
    TileSpawnCallback,
} from "../../types";
import { injectable } from "../../decorators";
import { Task } from "../common/task";

@injectable()
export class TileSpawner implements ITileSpawner {
    rowsNum: number;
    colsNum: number;
    prefabs: Prefab[];
    targetNode: Node;
    onTileSpawn?: TileSpawnCallback;

    seedGamefield() {
        const rows = this.rowsNum;        
        if (!rows) throw 'Rows for seeding not set';
        if (!this.colsNum) throw 'Cols for seeding not set';
        for (let row = 0; row < rows; row++) this.spawnObjAtRow(row);
    }

    /** Will always spawn tile outside of the field area */
    spawnNewTile(
        finalCoords: GridCellCoordinates,
        fieldHeight: number,
    ): Task {
        const newTile = this.spawnObjAtCell({
            col: finalCoords.col,
            row: fieldHeight + 1,
        });
        const tileMove = newTile.moveToCellAsync(finalCoords);
        return new Task().bundleWith(tileMove);
    }

    protected spawnObjAtRow(row: number) {
        const cols = this.colsNum;
        for (let col = 0; col < cols; col++) this.spawnObjAtCell({
            row, col 
        });
    }

    protected spawnObjAtCell(
        { row, col }: GridCellCoordinates
    ): ITile {
        const { prefabs } = this;
        if (!this.targetNode) throw 'Parent node not set';
        if (!prefabs || !prefabs.length) throw 'Prefabs not set';        
        const indexLimit = prefabs.length - 1;
        const rndIndex = Math.round(Math.random() * indexLimit);
        const newTileNode = instantiate(prefabs[rndIndex]);
        return this.setupNewItemFireCbck(newTileNode, { row, col });
    }

    protected setupNewItemFireCbck(
        itemNode: Node, 
        coords: GridCellCoordinates
    ): ITile {
        this.targetNode.addChild(itemNode);
        const newTileCtrl = itemNode.getComponent(TileBase) as ITile;
        newTileCtrl.positionAtCell(coords);
        this.onTileSpawn?.(newTileCtrl);
        return newTileCtrl;
    }
}