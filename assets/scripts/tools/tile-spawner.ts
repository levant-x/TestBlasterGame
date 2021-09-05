import { Node, instantiate, Prefab } from "cc";
import { TileBase } from "../controllers/tile-base";
import { GridCellCoordinates, ITile, TileSpawnCallback } from "../types";

export type TileSpawnerArgs = {
  rows: number;
  cols: number;
  fieldNode: Node;
  prefabs: Prefab[];
}

export class TileSpawner {
  private rows: number;
  private cols: number;
  private fieldNode: Node;
  private prefabs: Prefab[];
  private onTileSpawn?: TileSpawnCallback;

  constructor(args: TileSpawnerArgs) {
    this.rows = args.rows;
    this.cols = args.cols;                
    this.fieldNode = args.fieldNode;
    this.prefabs = args.prefabs;
  }

  public seedGamefield(onTileSpawn?: TileSpawnCallback) {
    this.onTileSpawn = onTileSpawn;
    for (let row = 0; row < this.rows; row++) this.spawnObjAtRow(row);
  }

  protected spawnObjAtRow(row: number) {
    for (let col = 0; col < this.cols; col++) this.spawnObjAtCell({
      row, col 
    });
  }

  protected spawnObjAtCell({ row, col }: GridCellCoordinates) {
    const indexLimit = this.prefabs.length - 1;
    const rndIndex = Math.round(Math.random() * indexLimit);
    const prefSelected = this.prefabs[rndIndex];
    const newTileNode = instantiate(prefSelected);
    this.setupNewItem(newTileNode, { row, col });
  }

  protected setupNewItem(
    itemNode: Node, coords: GridCellCoordinates) {
    this.fieldNode.addChild(itemNode);
    const newTileMainLogic = itemNode.getComponent(TileBase) as ITile;
    newTileMainLogic.positionAtCell(coords);
    this.onTileSpawn?.(newTileMainLogic);
  }
}