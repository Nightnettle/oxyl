const exec = Promise.promisify(require("child_process").exec);
const path = require("path");

module.exports = {
	byeMom: async text => {
		const stdout = await exec(`node ${path.resolve(`${__dirname}/byemom.js`)}`, {
			env: { TEXT: text },
			maxBuffer: Infinity
		});

		return module.exports.imageFromURI(stdout);
	},
	needsMoreJpeg: async image => {
		const stdout = await exec(`node ${path.resolve(`${__dirname}/neesdmorejpeg.js`)}`, {
			env: { IMAGE: image.toString("base64") },
			maxBuffer: Infinity
		});

		return module.exports.imageFromURI(stdout);
	},
	imageFromURI: data => {
		let [, ext, buffer] = data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
		buffer = Buffer.from(buffer, "base64");

		return { buffer, ext };
	}
};