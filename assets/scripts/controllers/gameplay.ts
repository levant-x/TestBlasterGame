
import { _decorator, Component, Prefab } from 'cc';
import { TileSpawner } from '../tools/tile-spawner';
import { ToolsInitializer } from '../tools/tools-initializer';
import { Color, GridCellCoordinates, LevelConfig } from '../types';
import { Tile } from './tile';
const { ccclass, property } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends Component {
  private _curLevel = 0;
  private _cnf: LevelConfig | null = null;
  private _tileSpawner?: TileSpawner;
  private _toolsInitializer = new ToolsInitializer();
  private _tileCoordsSearchSwitchers = [
    ({ row, col }: GridCellCoordinates) => ({ row, col: col + 1, }),
    ({ row, col }: GridCellCoordinates) => ({ row, col: col - 1, }),
    ({ row, col }: GridCellCoordinates) => ({ row: row + 1, col, }),
    ({ row, col }: GridCellCoordinates) => ({ row: row - 1, col, }),
  ]
  
  protected fieldMap: Tile[][] = []; // use as [col][row]

  @property({ type: [Prefab] })
  private tilePrefabs: Prefab[] = [];

  async start () {
    this._cnf = await this._toolsInitializer.loadLevelConfigAsync(this._curLevel);
    this._tileSpawner = this._toolsInitializer.createTileSpawner(
      this._cnf as LevelConfig, this.node, this.tilePrefabs);  
    Tile.is1stSeeding = true;
    this._tileSpawner.seedGamefield(this.onTileSpawn);
    Tile.is1stSeeding = false;
    Tile.onClick = this.onTileClick;
  }
     
  protected onTileSpawn = (tileLogic: Tile) => {
    const { col } = tileLogic.getCellCoordinates();
    if (this.fieldMap.length < col + 1) this.fieldMap.push([]);
    this.fieldMap[col].push(tileLogic);
  }

  protected onTileClick = (sender: Tile) => {
    const senderCellCoords = sender.getCellCoordinates();
    this.tryDestroyTilesAroundPoint(senderCellCoords, sender.color);
  }

  protected tryDestroyTilesAroundPoint(
    { col, row }: GridCellCoordinates, targetColor: Color) {  

    const tilesGroupToDstr: Tile[] = [];
    this._collectTileGroup({ col, row }, targetColor, tilesGroupToDstr);
    
    const cnf = this._cnf as LevelConfig;
    if (tilesGroupToDstr.length < cnf.tilesetVolToDstr) return;    
    tilesGroupToDstr.forEach(tile => tile.node.destroy());
  }

  private _collectTileGroup(
    tileGCC: GridCellCoordinates, trgColor: Color, tiles: Tile[]) {

    if (!this._areGridCellCoordsValid(tileGCC)) return;
    const tileAtPoint: Tile = this.fieldMap[tileGCC.col][tileGCC.row];

    if (tileAtPoint.color !== trgColor || 
      tiles.find(tile => tile == tileAtPoint)) return; 
    tiles.push(tileAtPoint);
    
    for (const sw of this._tileCoordsSearchSwitchers) this._collectTileGroup(
      sw(tileGCC), trgColor, tiles
    );
  }

  private _areGridCellCoordsValid({ col, row }: GridCellCoordinates) {
    const cnf = this._cnf as LevelConfig;
    const areCoordsValid = col >= 0 && col < cnf.fieldWidth &&
      row >= 0 && row < cnf.fieldHeight;
    return areCoordsValid;
  }
}