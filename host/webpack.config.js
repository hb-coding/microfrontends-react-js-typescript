const env = require('dotenv').config();
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const pkg = require("./package.json");
require("dotenv").config({ path: "./.env" });

if (env && env.parsed) {
	console.log('environment config:', env.parsed);
}

function getRemotesFromConfiguration() {
	let obj = {};
	var remotes = Object.entries(env.parsed);
	remotes.forEach((rem) => {
		var name = rem[0].toLowerCase();
		var url = rem[1];
		obj[name] = `${name}@${url}`;
	});
	console.log(obj);
	return obj;
};

module.exports = (env, argv) => {
	return {
		entry: "./src/index.ts",
		output: {
			publicPath: 'http://localhost:3000/'
		},
		mode: process.env.NODE_ENV || "development",
		devServer: {
			port: 3000,
			open: true,
			historyApiFallback: true,
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".jsx"],
			alias: {
				'@shared': path.resolve(__dirname, '../shared')
			}
		},
		module: {
			rules: [
				{ test: /\.(js|jsx|tsx|ts)$/, loader: "ts-loader", exclude: /node_modules/ },
				{ test: /\.css$/, use: ["style-loader", "css-loader"] }
			],
		},
		plugins: [
			new ModuleFederationPlugin({
				name: "container",
				filename: "remoteEntry.js",
				exposes: {
					"./store": "./src/components/store"
				},
				remotes: [{
					remote_home: 'remote_home@http://localhost:3001/remote.js',
					remote_profile: 'remote_profile@http://localhost:3003/remote.js',
					remote_sample: 'remote_sample@http://localhost:3002/remote.js',
					container: 'container@http://localhost:3000/remoteEntry.js',
					ai_instrumentation_key: 'ai_instrumentation_key@'

				}],
				shared: {
					...pkg.dependencies,
					react: { singleton: true, eager: true, requiredVersion: pkg.dependencies["react"] },
					"react-dom": {
						singleton: true,
						eager: true,
						requiredVersion: pkg.dependencies["react-dom"],
					},
				},
			}),
			new HtmlWebpackPlugin({
				template: "./public/index.html",
			}),
		],
	};
};
