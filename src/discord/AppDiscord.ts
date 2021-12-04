import {Command, CommandMessage, Description, Discord} from "@typeit/discord";
import {Global} from "../globals";
import {GameState} from "../models/game-state";
import {Game} from "../models/game";
import {MessageEmbed} from "discord.js";
import didYouMean from "didyoumean2";
import {Player} from "../models/player";
import {DocumentType} from "@typegoose/typegoose";
import tinygradient from "tinygradient";
import i18n from "i18n";

interface PlayerNameResult {
  name: string
  originalName: string | undefined
  failed: boolean
}

@Discord("!") // Decorate the class
abstract class AppDiscord {

  private static async checkPlayerName(name: string): Promise<PlayerNameResult> {

    let returnObject: PlayerNameResult = {
      name: "",
      originalName: undefined,
      failed: false
    }

    let playerNames = await Global.getPlayerList();

    if (!playerNames.includes(name)) {
      let bestMatch = didYouMean(name, playerNames);
      if (bestMatch == null || bestMatch.startsWith("tf2pickup.")) {
        returnObject.failed = true;
      } else {
        returnObject.originalName = name;
        returnObject.name = bestMatch;
      }
    } else {
      returnObject.name = name;
    }

    return returnObject;
  }

  // Reachable with the command: !hello
  @Command("winrate")
  @Description("Get the winrate of a single player. Optional arguments are time, players which were in the enemy team and players which were in the own team. !winrate <player> [<team mate][>enemy][!<not team mate][!> not enemy][|dayssince]")
  private async winrate(message: CommandMessage) {
    let command = message.commandContent.replace("winrate", "").trim();

    console.log(`${new Date().toLocaleString()}: User ${message.author.tag} running: ${command}`);

    if (["?", "help", "hilfe"].includes(command.trim().toLowerCase())) {
      message.reply(i18n.__("HELP_MESSAGE"));
    } else {
      let name: string = "";
      let days = 0;
      let additionalPlayers: { enemy: boolean, exclude: boolean, playerName: PlayerNameResult }[] = [];


      let commandParts = command.split(/(?=[<>|!])/g).map(part => part.trim());
      if (!["|", "<", ">", "!"].includes(commandParts[0][0])) {
        name = commandParts[0];
        commandParts = commandParts.slice(1);
      }

      for (let i = 0; i < commandParts.length; i++) {
        const part = commandParts[i];
        let exclude = false;
        if (i > 0 && commandParts[i - 1] === "!") {
          exclude = true;
        }

        if (part.startsWith("|")) {
          days = parseFloat(part.substr(1));
        } else if (part.startsWith("<")) {
          additionalPlayers.push({enemy: false, exclude, playerName: await AppDiscord.checkPlayerName(part.substr(1))});
        } else if (part.startsWith(">")) {
          additionalPlayers.push({enemy: true, exclude, playerName: await AppDiscord.checkPlayerName(part.substr(1))});
        }
      }

      let filteredAdditionalPlayers: { enemy: boolean, exclude: boolean, playerName: PlayerNameResult, player: DocumentType<Player> }[] = [];

      for (let i = 0; i < additionalPlayers.length; i++) {
        const player = additionalPlayers[i];

        if (!player.playerName.failed) {
          const playerObject = await Global.playerModel.findOne({name: player.playerName.name})
          if (playerObject != null) {
            filteredAdditionalPlayers.push({...player, player: playerObject})
          }
        }
      }


      if (name.length === 0) {
        name = message.author.username.trim();
        if (message.guild != null) {
          name = message.guild.member(message.author)?.nickname || name;
        }
      }


      let originalName: string | undefined = undefined;

      let info = await AppDiscord.checkPlayerName(name);

      if (info.failed) {
        await message.reply(i18n.__("PLAYER_NOT_FOUND", name.replace(/`/, ""), process.env.DOMAIN || ".org"));
        return;
      } else {
        originalName = info.originalName;
        name = info.name;
      }

      const player = await Global.playerModel.findOne({name});

      if (player != null) {
        const games: Game[] = (await Global.gameModel.find({
          "slots.player": player._id,
          "state": GameState.ended,
          "launchedAt": {"$gte": (days == 0) ? new Date(0) : new Date(Date.now() - (days * 24 * 60 * 60 * 1000))}
        })).filter(game => {

          if (filteredAdditionalPlayers.length == 0) {
            return true;
          } else {

            const playerInfo = game.slots.filter(slot => {
              return player._id.equals(slot.player);
            })[0];

            for (let i = 0; i < filteredAdditionalPlayers.length; i++) {
              const additionalPlayer = filteredAdditionalPlayers[i];
              const additionalPlayerInfo = game.slots.filter(slot => {
                return additionalPlayer.player._id.equals(slot.player);
              });

              if (!additionalPlayer.exclude) {

                if (additionalPlayerInfo.length == 0) {
                  return false;
                }

                if (!additionalPlayer.enemy ? playerInfo.team != additionalPlayerInfo[0].team : playerInfo.team == additionalPlayerInfo[0].team) {
                  return false;
                }
              } else {
                if (additionalPlayerInfo.length > 0) {
                  if (additionalPlayer.enemy ? playerInfo.team != additionalPlayerInfo[0].team : playerInfo.team == additionalPlayerInfo[0].team) {
                    return false;
                  }
                }
              }

            }
          }
          return true;
        })


        const infos: { [key: string]: { wins: number, ties: number, losses: number, total: number, winrate: number } } = {};

        games.forEach(game => {
          const playerInfo = game.slots.filter(slot => {
            return player._id.equals(slot.player);
          })[0];

          if (!infos.hasOwnProperty(playerInfo.gameClass)) {
            infos[playerInfo.gameClass] = {
              wins: 0,
              ties: 0,
              losses: 0,
              total: 0,
              winrate: 0,
            }
          }

          if (game.score?.get("red") == game.score?.get("blu")) {
            infos[playerInfo.gameClass].ties++;
          } else {
            if ((game.score?.get(playerInfo.team) || 0) > (game.score?.get(playerInfo.team == "red" ? "blu" : "red") || 0)) {
              infos[playerInfo.gameClass].wins++;
            } else {
              infos[playerInfo.gameClass].losses++;
            }
          }

        })

        let total = {
          wins: 0,
          ties: 0,
          losses: 0,
          total: 0,
          winrate: 0,
        };

        for (let key in infos) {
          let data = infos[key];
          data.total = data.ties + data.losses + data.wins;
          data.winrate = (data.wins + 0.5 * data.ties) / data.total;
          total.wins += data.wins;
          total.losses += data.losses;
          total.ties += data.ties;
          total.total += data.total;
        }

        total.winrate = (total.wins + 0.5 * total.ties) / total.total;

        let embed = new MessageEmbed().setTitle(name)

        if (!isNaN(total.winrate)) {
          let gradient = tinygradient([{color: "#881f1f", pos: 0.25}, {color: "#48af48", pos: 0.5}, {
            color: "#00ff1e",
            pos: 1.0
          }])
          embed.setColor(gradient.rgbAt(total.winrate).toString("hex"))
        }

        if (player.avatar != undefined) {
          embed.setThumbnail(player.avatar.large)
        }

        if (originalName != undefined) {
          embed.setDescription(i18n.__("PLAYER_SEARCH_REPLACEMENT", originalName.replace(/`/, ""), name.replace(/`/, "")));
        }

        let fields = [];

        Object.keys(infos).sort().forEach((key, index) => {
          fields.push({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            inline: true,
            value: `W: ${infos[key].wins} T: ${infos[key].ties} L: ${infos[key].losses}\nWinrate: ${infos[key].winrate.toFixed(2)}`
          })

          /*
          if((index+1) % 2 == 0){
            fields.push({name: '\u200b', value: '\u200b'});
          }
          */
        });
        fields.push({
          name: i18n.__("TOTAL"),
          inline: true,
          value: `W: ${total.wins} T: ${total.ties} L: ${total.losses}\nWinrate: ${total.winrate.toFixed(2)}`
        });

        if (days != 0) {

          fields.push({name: i18n.__("TIME"), inline: true, value: i18n.__n("LAST_N_DAYS", days)});
        }

        if (filteredAdditionalPlayers.length > 0) {

          let enemies = filteredAdditionalPlayers.filter(player => player.enemy && !player.exclude);
          let teamMates = filteredAdditionalPlayers.filter(player => !player.enemy && !player.exclude);

          let notEnemies = filteredAdditionalPlayers.filter(player => player.enemy && player.exclude);
          let notTeamMates = filteredAdditionalPlayers.filter(player => !player.enemy && player.exclude);

          if (enemies.length > 0) {
            fields.push({
              name: i18n.__("ENEMY_PLAYERS"),
              inline: true,
              value: `${enemies.map(player => player.playerName.name).join(", ")}`
            });
          }
          if (teamMates.length > 0) {
            fields.push({
              name: i18n.__("OWN_PLAYERS"),
              inline: true,
              value: `${teamMates.map(player => player.playerName.name).join(", ")}`
            });
          }

          if (notEnemies.length > 0) {
            fields.push({
              name: i18n.__("NOT_ENEMY_PLAYERS"),
              inline: true,
              value: `${notEnemies.map(player => player.playerName.name).join(", ")}`
            });
          }
          if (notTeamMates.length > 0) {
            fields.push({
              name: i18n.__("NOT_OWN_PLAYERS"),
              inline: true,
              value: `${notTeamMates.map(player => player.playerName.name).join(", ")}`
            });
          }

        }

        embed.addFields(fields);

        await message.channel.send(embed);

      }


    }
  }


  // Reachable with the command: !hello
  @Command("medcheck")
  @Description("Get some medic statistics of a single player.")
  private async medCheck(message: CommandMessage) {
    let command = message.commandContent.replace("medcheck", "").trim();

    console.log(`${new Date().toLocaleString()}: User ${message.author.tag} running: ${command}`);

    let name: string = command;

    if (name.length === 0) {
      name = message.author.username.trim();
      if (message.guild != null) {
        name = message.guild.member(message.author)?.nickname || name;
      }
    }


    let originalName: string | undefined = undefined;

    let info = await AppDiscord.checkPlayerName(name);

    if (info.failed) {
      await message.reply(i18n.__("PLAYER_NOT_FOUND", name.replace(/`/, ""), process.env.DOMAIN || ".org"));
      return;
    } else {
      originalName = info.originalName;
      name = info.name;
    }

    const player = await Global.playerModel.findOne({name});

    if (player != null) {
      const games: Game[] = (await Global.gameModel.find({
        "slots": {
          $elemMatch: {
            "player": player._id,
            "gameClass": "medic"
          }
        },
        "slots.player": player._id,
      })).reverse();

      const game_count: number = (await Global.gameModel.find({
        "slots.player": player._id,
      }).count())

      const medic_rate = games.length/game_count;

      let medic_last_week = 0;
      let medic_last_month = 0;

      let medic_last_time: Date | undefined;

      games.forEach(game => {

        if(game.endedAt != undefined){

          if(medic_last_time == undefined) {
            medic_last_time = game.endedAt
          }

          if (game.endedAt?.getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7) {
            medic_last_week++;
          }

          if (game.endedAt?.getTime() > Date.now() - 1000 * 60 * 60 * 24 * 31) {
            medic_last_month++;
          }
        }
      })

      let embed = new MessageEmbed().setTitle(name)


      let gradient = tinygradient([{color: "#881f1f", pos: 0.0}, {color: "#48af48", pos: 0.1}, {
        color: "#00ff1e",
        pos: 1.0
      }])
      embed.setColor(gradient.rgbAt(medic_rate).toString("hex"))


      if (player.avatar != undefined) {
        embed.setThumbnail(player.avatar.large)
      }

      if (originalName != undefined) {
        embed.setDescription(i18n.__("PLAYER_SEARCH_REPLACEMENT", originalName.replace(/`/, ""), name.replace(/`/, "")));
      }

      embed.addFields([
        {
          name: i18n.__("TOTAL"),
          inline: true,
          value: `Games: ${game_count} | Medic: ${games.length} \nMedicrate: ${medic_rate.toFixed(2)}`
        },
        {
          name: i18n.__("MED_LAST_MONTH"),
          inline: true,
          value: medic_last_month
        },
        {
          name: i18n.__("MED_LAST_WEEK"),
          inline: true,
          value: medic_last_week
        },
        {
          name: i18n.__("MED_LAST_TIME"),
          inline: true,
          value: medic_last_time != undefined ? medic_last_time?.toISOString().substr(0, 10) : i18n.__("NEVER_MED")
        },
      ]);
      await message.channel.send(embed);
    }
  }

}