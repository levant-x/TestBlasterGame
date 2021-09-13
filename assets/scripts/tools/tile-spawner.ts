import { Node, instantiate, Prefab } from "cc";
import { TileBase } from "../controllers/tile-base";
import { 
  GridCellCoordinates, 
  ITile, 
  LevelConfig, 
  TileSpawnCallback 
} from "../types";
import { Task } from "./common/task";

export type TileSpawnerArgs = Pick<
  LevelConfig, 'fieldWidth' | 'fieldHeight'> & {
  fieldNode: Node;
  prefabs: Prefab[];
}

export class TileSpawner {
  private _rows: number;
  private _cols: number;
  private _fieldNode: Node;
  private _prefabs: Prefab[];
  private _onTileSpawn?: TileSpawnCallback;

  constructor(args: TileSpawnerArgs) {
    Object.values(args).forEach(argVal => {
      if (!argVal) throw `${argVal} missing`;
    });
    this._rows = args.fieldHeight;
    this._cols = args.fieldWidth;                
    this._fieldNode = args.fieldNode;
    this._prefabs = args.prefabs;
  }

  public seedGamefield(onTileSpawn?: TileSpawnCallback) {
    this._onTileSpawn = onTileSpawn;
    for (let row = 0; row < this._rows; row++) this.spawnObjAtRow(row);
  }

  /** Will always spawn tile outside of the field area */
  public spawnNewTile(
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
    for (let col = 0; col < this._cols; col++) this.spawnObjAtCell({
      row, col 
    });
  }

  protected spawnObjAtCell(
    { row, col }: GridCellCoordinates
  ): ITile {
    const indexLimit = this._prefabs.length - 1;
    const rndIndex = Math.round(Math.random() * indexLimit);
    const prefSelected = this._prefabs[rndIndex];
    const newTileNode = instantiate(prefSelected);
    return this.setupNewItemFireCbck(newTileNode, { row, col });
  }

  protected setupNewItemFireCbck(
    itemNode: Node, 
    coords: GridCellCoordinates
  ): ITile {
    this._fieldNode.addChild(itemNode);
    const newTileCtrl = itemNode.getComponent(TileBase) as ITile;
    newTileCtrl.positionAtCell(coords);
    this._onTileSpawn?.(newTileCtrl);
    return newTileCtrl;
  }
}