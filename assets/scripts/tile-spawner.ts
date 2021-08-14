import { Node, instantiate, Prefab } from "cc";
import { Tile } from "./tile";

export type InitArgs = {
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

  constructor(args: InitArgs) {
    this.rows = args.rows;
    this.cols = args.cols;                
    this.fieldNode = args.fieldNode;
    this.prefabs = args.prefabs;
  }

  public spawnAtEntireField() {
    for (let row = 0; row < this.rows; row++) this.spawnAtRow(row);
  }

  protected spawnAtRow(row: number) {
    for (let col = 0; col < this.cols; col++) this.spawnAtCell(row, col);
  }

  protected spawnAtCell(row: number, col: number) {
    const prefVariantIndex = Math.random() * (this.prefabs.length - 1);
    const prefSelected = this.prefabs[prefVariantIndex];
    const newTileNode = instantiate(prefSelected);

    this.fieldNode.addChild(newTileNode);
    const newTileMainScript = newTileNode.getComponent(Tile);
    newTileMainScript?.positionAtCell(col, row);
  }
}