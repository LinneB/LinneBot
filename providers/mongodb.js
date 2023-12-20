const mongoose = require("mongoose");
const { log } = require("../misc/utils");

const ChannelSchema = new mongoose.Schema({
  channel: { type: String, required: true },
  subscriptions: [{
    channel: { type: String, required: true },
    subscribers: { type: [String], default: [] }
  }],
  commands: [{
    name: { type: String },
    reply: { type: String },
    cooldown: { type: Number, default: 1000 }
  }]
});

mongoose.connection.on("connected", () => log("info", "Connected to database"));
mongoose.connect(process.env.MONGODB_URL);

exports.ChannelModel = mongoose.model("channels", ChannelSchema);

exports.getChannelData = async function(channel) {
  let result = await this.ChannelModel.findOne({ channel: channel });
  if (!result) {
    result = await this.ChannelModel.create({ channel: channel });
  }
  return result;
};
