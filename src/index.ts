import {mongoose} from "@typegoose/typegoose";
import { Client } from "@typeit/discord";

mongoose.connect("***REMOVED***")



async function main(){



  //return;
  const client = new Client({
    classes: [
      `${__dirname}/discord/*.ts`, // glob string to load the classes
      `${__dirname}/discord/*.js` // If you compile using "tsc" the file extension change to .js
    ],
    silent: false,
    variablesChar: ":"/*,
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
    ],
    slashGuilds: "692819625359966258"*/
  });

  //await client.login("***REMOVED***");
  await client.login("***REMOVED***");

  console.log("Logged into Bot.")
  console.log(Client.getCommands());

}


main();
