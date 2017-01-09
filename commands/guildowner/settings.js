const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

const settings = [{ name: "prefix", type: "text" },
{ name: "modlog", type: "textChannel" },
{ name: "userlog", type: "textChannel" },
{ name: "userjoin", type: "text" },
{ name: "userleave", type: "text" }];
exports.settings = settings;

function handleConfig(message, args) {
	return new Promise((resolve, reject) => {
		if(!args || !args[0] || args[0].toLowerCase() === "help") {
			resolve("Provide what setting to see or set, via `setting get <name>`" +
			" or `setting set <name> <value>`, or view `settings list` for a list of settings");
		} else if(args[0].toLowerCase() === "list") {
			resolve(`All Settings: ${settings.map(setting => `\`${setting.name}\``).join(", ")}`);
		} else if(args[0].toLowerCase() === "get") {
			let setting = settings.find(set => set.name === args[1].toLowerCase());
			if(!setting) {
				resolve("Invalid setting! Setting not found.");
				return;
			} else {
				framework.getSetting(message.guild, setting.name)
				.then(val => resolve(`Setting \`${setting.name}\` is \`${val}\``))
				.catch(() => resolve(`Setting \`${setting.name}\` is not set`));
			}
		} else if(args[0].toLowerCase() === "set") {
			let setting = settings.find(set => set.name === args[1].toLowerCase());
			if(!setting) {
				resolve("Invalid setting! Setting not found.");
				return;
			} else {
				let value = message.argsPreserved[0];
				value = value.substring(value.indexOf(setting.name) + setting.name.length + 1);
				value = configTypes[setting.type].validate(message.guild, value);
				if(value === null) {
					resolve(`Invalid input given -- please provide ${configTypes[setting.type].info}`);
				} else {
					framework.setSetting(message.guild, setting.name, value);
					resolve(`Set \`${setting.name}\` to \`${value}\``);
				}
			}
		}
	});
}

const configTypes = {
	textChannel: {
		info: "a text channel id or name within the guild",
		validate: (guild, value) => {
			let textChannels = guild.channels.filter(ch => ch.type === 0);
			let foundChannel = textChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) return true;
				else return false;
			});

			if(foundChannel) return foundChannel.id;
			else return null;
		}
	},
	voiceChannel: {
		info: "a voice channel id or name within the guild",
		validate: (guild, value) => {
			let voiceChannels = guild.channels.filter(ch => ch.type === 2);
			let foundChannel = voiceChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) return true;
				else return false;
			});

			if(foundChannel) return foundChannel.id;
			else return null;
		}
	},
	role: {
		info: "a role id or name within the guild",
		validate: (guild, value) => {
			let roles = guild.roles;
			let foundRole = roles.find(role => {
				if(value === role.id || value.toLowerCase() === role.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			if(foundRole) return foundRole.id;
			else return null;
		}
	},
	boolean: {
		info: "a true (yes/enable) or false (no/disable) value",
		validate: (guild, value) => {
			let trueWords = ["true", "yes", "enable"];
			let falseWords = ["false", "no", "disable"];
			if(trueWords.includes(value)) return true;
			else if(falseWords.includes(value)) return false;
			else return null;
		}
	},
	int: {
		info: "a whole positive or negative number",
		validate: (guild, value) => {
			value = parseInt(value);
			if(isNaN(value)) return null;
			else return value;
		}
	},
	text: {
		info: "any combination of words and letters",
		validate: (guild, value) => value
	}
};
exports.configTypes = configTypes;

var command = new Command("settings", (message, bot) => {
	let args = message.argsPreserved[0].split(" ");
	handleConfig(message, args)
	.then(val => message.channel.createMessage(val));
}, {
	cooldown: 2500,
	guildOnly: true,
	type: "guild owner",
	description: "Configurate Oxyl's settings per guild",
	args: [{
		type: "text",
		label: "help|list|get <setting>|set <setting>",
		optional: true
	}]
});
