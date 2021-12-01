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
import { pickRandomItem } from "../common/array-tools";
import { scanGrid } from "./field-analyzers/range-scanners.ts";
import { CONFIG } from "../../config";

@injectable('TileSpawner')
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

        scanGrid({
            left: 0, 
            right: this.colsNum - 1,
        }, {
            bottom: 0, 
            top: this.rowsNum - 1,
        }, this.spawnObjAtCell.bind(this));
    }

    /** Will always spawn tile outside of the field area */
    spawnNewTile(
        finalCoords: GridCellCoordinates,
        fieldHeight: number,
        originElevation?: number,
    ): Task {
        const newTile = this.spawnObjAtCell({
            col: finalCoords.col,
            row: fieldHeight + CONFIG.TILES_FALL_SIZE_FR_DELAY +
            (originElevation ?? 0),
        });
        const tileMoveProcess = newTile.moveToCellAsync(finalCoords);
        const tileMoveTask = new Task().bundleWith(tileMoveProcess);
        tileMoveTask.item = newTile;
        return tileMoveTask;
    }

    protected spawnObjAtCell(
        crds: GridCellCoordinates
    ): ITile {
        const { prefabs } = this;
        if (!this.targetNode) throw 'Parent node not set';
        if (!prefabs || !prefabs.length) throw 'Prefabs not set';   

        const trgPrefab = pickRandomItem(prefabs);
        const newTileNode = instantiate(trgPrefab);
        return this.setupNewItemFireCbck(newTileNode, crds);
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