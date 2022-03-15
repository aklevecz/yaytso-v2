const { Client, Intents, MessageManager } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const config = require("./src/dev.json");
// When the client is ready, run this code (only once)
const owner_room = "917833356757041172";
const eggStream = "921097758365061142";
const messageId = "942848335541313558";
client.once("ready", () => {
  console.log("Ready!");
  const channel = client.channels.cache.get(eggStream);
  channel.messages.edit(messageId, {
    content: "A new egg has been created!",
    files: [
      {
        attachment: "./lostEgg.png",
        name: "lostEgg.png",
      },
    ],
    embeds: [
      {
        title: "Bao bowl",
        description:
          "Bao bowl, a uniquely patterned яйцо with a pattern hash of 0x08bec19ba9f27105226e18671f019f0304e9a89fbed1956a619bde4132d7ce29",
        image: {
          url: "attachment://lostEgg.png",
        },
      },
    ],
  });
});

// Login to Discord with your client's token
client.login(config.discord.bot_token);
