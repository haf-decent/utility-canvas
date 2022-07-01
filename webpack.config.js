const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'utility-canvas.min.js',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	}
};