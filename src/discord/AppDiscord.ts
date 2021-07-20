import {Command, CommandMessage, Description, Discord} from "@typeit/discord";
import {Global} from "../globals";
import stringSimilarity from "string-similarity";
import {GameState} from "../models/game-state";
import {Game} from "../models/game";
import {MessageEmbed} from "discord.js";

@Discord("!") // Decorate the class
abstract class AppDiscord {

  // Reachable with the command: !hello
  @Command("winrate")
  @Description("Get the winrate of a single player. Optional Argument is time. !winrate <player> [|dayssince]")
  private async winrate(message: CommandMessage) {
    let command = message.commandContent.replace("winrate", "").trim();

    if (command.trim().length === 0) {
      message.reply("Bitte verwende den Befehl folgendermaßen: !winrate <Spieler> [|<Tage>].\nBeispiele: `!winrate Jack` oder `!winrate Jack |30`");
    } else {
      let name: string;
      let days = 0;

      if (command.includes("|")) {
        name = command.split("|")[0].trim();
        days = parseInt(command.split("|")[1].trim());
      } else {
        name = command.trim();
      }

      let playerNames = await Global.getPlayerList();

      if (playerNames.includes(name)) {

        const player = await Global.playerModel.findOne({name});

        if (player != null) {
          const games: Game[] = await Global.gameModel.find({
            "slots.player": player._id,
            "state": GameState.ended,
            "launchedAt": {"$gte": (days == 0) ? new Date(0) : new Date(Date.now() - (days * 24 * 60 * 60 * 1000))}
          });

          const infos: { [key: string]: { wins: number, ties: number, losses: number, total: number, winrate: number } } = {};

          games.forEach(game => {
            const playerinfo = game.slots.filter(slot => {
              return player._id.equals(slot.player);
            })[0];

            if (!infos.hasOwnProperty(playerinfo.gameClass)) {
              infos[playerinfo.gameClass] = {
                wins: 0,
                ties: 0,
                losses: 0,
                total: 0,
                winrate: 0,
              }
            }

            if (game.score?.get("red") == game.score?.get("blu")) {
              infos[playerinfo.gameClass].ties++;
            } else {
              if ((game.score?.get(playerinfo.team) || 0) > (game.score?.get(playerinfo.team == "red" ? "blu" : "red") || 0)) {
                infos[playerinfo.gameClass].wins++;
              } else {
                infos[playerinfo.gameClass].losses++;
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
            data.winrate = data.wins / (data.losses + data.wins);
            total.wins += data.wins;
            total.losses += data.losses;
            total.ties += data.ties;
            total.total += data.total;
          }

          total.winrate = total.wins / (total.losses + total.wins);

          let embed = new MessageEmbed().setTitle(name)

          if (player.avatar != undefined) {
            embed.setThumbnail(player.avatar.large)
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
            name: "Gesamt",
            inline: true,
            value: `W: ${total.wins} T: ${total.ties} L: ${total.losses}\nWinrate: ${total.winrate.toFixed(2)}`
          });

          if (days != 0) {

            fields.push({name: "Zeitraum", inline: true, value: `Letzte ${days} Tage`});
          }

          embed.addFields(fields);

          message.channel.send(embed);

        }
      } else {
        message.reply(`Spieler \`${name.replace(/`/, "")}\` konnte nicht gefunden werden, meintest du \`${playerNames[stringSimilarity.findBestMatch(name, playerNames).bestMatchIndex]}\`?`);
      }

    }
  }

}