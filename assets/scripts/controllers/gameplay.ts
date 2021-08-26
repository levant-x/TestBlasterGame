
import { _decorator, Prefab } from 'cc';
import { GamefieldContext } from '../tools/gamefield-context';
import { ItemGroupsAnalizer } from '../tools/item-groups-analizer';
import { TileSpawner, TileSpawnerArgs } from '../tools/tile-spawner';
import { ToolsFactory } from '../tools/tools-factory';
import { GridCellCoordinates, IClassifyable, ITile, LevelConfig } from '../types';
import { Tile } from './tile';
const { ccclass, property } = _decorator;

@ccclass('Gameplay')
export class Gameplay extends GamefieldContext {
    private _toolsInitializer = new ToolsFactory();

    protected curLevel = 0;
    protected cfg?: LevelConfig;
    protected tileSpawner?: TileSpawner;
    protected groupsAnalizer?: ItemGroupsAnalizer;
    protected gamefield: ITile[][] = []; 

    @property({ type: [Prefab] })
    private tilePrefabs: Prefab[] = [];

    async start () {
        this.cfg = await this._toolsInitializer.loadLevelConfigAsync(
            this.curLevel
        );
        this.initCtx({
            gamefield: [],
            w: this.cfg.fieldWidth,
            h: this.cfg.fieldHeight,
        });

        // AFTER CONFIG INIT
        this.tileSpawner = ToolsFactory.get(TileSpawner, {
            rows: this.height,
            cols: this.witdh,
            fieldNode: this.node,
            prefabs: this.tilePrefabs,
        } as TileSpawnerArgs);
        
        Tile.is1stSeeding = true;
        this.tileSpawner.seedGamefield(this.onTileSpawn);
        Tile.is1stSeeding = false;

        this.groupsAnalizer = ToolsFactory.get(ItemGroupsAnalizer);
        Tile.onClick = this.onTileClick;
    }
        
    protected onTileSpawn = (tileLogic: Tile) => {
        const { col } = tileLogic.getCellCoordinates();
        if (this.gamefield.length < col + 1) this.gamefield.push([]);
        this.gamefield[col].push(tileLogic);
    }

    protected onTileClick = (sender: Tile) => {
        const senderCellCoords = sender.getCellCoordinates();        
        const groupHit = this._getTilesAroundPoint(senderCellCoords, sender);
        this.onGroupHitCollect(groupHit);
    }

    protected onGroupHitCollect(groupHit: IClassifyable[]) {
        const cfg = this.cfg as LevelConfig;
        if (groupHit.length < cfg.tilesetVolToDstr) return;    
        groupHit.forEach(tile => this.destroyHitTile(tile as Tile));
    }

    protected destroyHitTile(tile: ITile) {
        tile.node.destroy();
    }

    private _getTilesAroundPoint({ 
        col, row }: GridCellCoordinates, targetTile: IClassifyable) {  
        const tilesAroundPoint = this.groupsAnalizer?.collectItemsGroup({
            col, row }, targetTile) || [];
        return tilesAroundPoint;
    }
}