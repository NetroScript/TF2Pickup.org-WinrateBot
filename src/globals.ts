import {getModelForClass, ReturnModelType} from "@typegoose/typegoose";
import {Player} from "./models/player";
import {Game} from "./models/game";


class GlobalData {
  playerNames: string[] = [];
  private lastUpdate: Date;

  playerModel: ReturnModelType<typeof Player, {}>
  gameModel: ReturnModelType<typeof Game, {}>

  constructor() {
    this.lastUpdate = new Date(0);
    this.playerModel = getModelForClass(Player);
    this.gameModel = getModelForClass(Game);
  }

  async getPlayerList() : Promise<string[]>{
    await this.updatePlayerList();
    return this.playerNames;
  }

  async updatePlayerList() {
    if(Date.now() - this.lastUpdate.getTime() > 60000*20){
      console.log("Fetching Database Player Names")
      this.lastUpdate = new Date();
      this.playerNames = [];
      const players: Array<Player> = await this.playerModel.find();
      players.forEach(player => {
        this.playerNames.push(player.name);
      })
    }
  }


}

export let Global = new GlobalData();