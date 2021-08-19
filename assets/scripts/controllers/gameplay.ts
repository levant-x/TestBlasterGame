
import { _decorator, Component, Prefab } from 'cc';
import { ItemGroupsAnalizer } from '../tools/item-groups-analizer';
import { TileSpawner } from '../tools/tile-spawner';
import { ToolsInitializer } from '../tools/tools-initializer';
import { GridCellCoordinates, IClassifyable, LevelConfig } from '../types';
import { Tile } from './tile';
const { ccclass, property } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends Component {
    private _toolsInitializer = new ToolsInitializer();

    protected curLevel = 0;
    protected cnf?: LevelConfig;
    protected tileSpawner?: TileSpawner;
    protected groupsAnalizer?: ItemGroupsAnalizer;
    protected fieldMap: Tile[][] = []; // use as [col][row]

    @property({ type: [Prefab] })
    private tilePrefabs: Prefab[] = [];

    async start () {
        this.cnf = await this._toolsInitializer.loadLevelConfigAsync(this.curLevel);
        this.tileSpawner = this._toolsInitializer.createTileSpawner(
        this.cnf as LevelConfig, this.node, this.tilePrefabs);  

        Tile.is1stSeeding = true;
        this.tileSpawner.seedGamefield(this.onTileSpawn);
        Tile.is1stSeeding = false;

        this.groupsAnalizer = new ItemGroupsAnalizer(this.fieldMap);
        Tile.onClick = this.onTileClick;
    }
        
    protected onTileSpawn = (tileLogic: Tile) => {
        const { col } = tileLogic.getCellCoordinates();
        if (this.fieldMap.length < col + 1) this.fieldMap.push([]);
        this.fieldMap[col].push(tileLogic);
    }

    protected onTileClick = (sender: Tile) => {
        const senderCellCoords = sender.getCellCoordinates();        
        const groupHit = this._getTilesAroundPoint(senderCellCoords, sender);
        this.onGroupHitCollect(groupHit);
    }

    protected onGroupHitCollect(groupHit: IClassifyable[]) {
        const cnf = this.cnf as LevelConfig;
        if (groupHit.length < cnf.tilesetVolToDstr) return;    
        groupHit.forEach(tile => this.onTileHitIterate(tile as Tile));
    }

    protected onTileHitIterate(tile: Tile) {
        tile.node.destroy();
    }

    private _getTilesAroundPoint({ 
        col, row }: GridCellCoordinates, targetTile: IClassifyable) {  
        const tilesAroundPoint = this.groupsAnalizer?.collectItemsGroup({
            col, row }, targetTile) || [];
        return tilesAroundPoint;
    }
}