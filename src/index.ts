import {mongoose} from "@typegoose/typegoose";
import { Client } from "@typeit/discord";
import * as dotenv from "dotenv";
dotenv.config({path: __dirname+'/.env'})

mongoose.connect(process.env.DATABASE_URL as string)



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

  await client.login(process.env.DISCORD_BOT_TOKEN as string);

  console.log("Logged into Bot.")
  console.log(Client.getCommands());

}


main();
