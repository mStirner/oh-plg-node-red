const RED = require('node-red');
const express = require("express");
const path = require("path");
const { randomBytes } = require("crypto");

const {
    HTTP_ADDRESS,
    HTTP_PORT
} = process.env;

module.exports = (self, logger, init) => {
    return init([
        "store",
        "vault"
    ], async (scope, [
        C_STORE,
        C_VAULT
    ]) => {

        const store = await new Promise((resolve, reject) => {
            C_STORE.found({
                name: "NODE-RED",
                labels: [
                    `plugin=${self.uuid}`,
                    "node-red=true"
                ]
            }, resolve, async (filter) => {
                try {

                    let store = await C_STORE.add({
                        ...filter,
                        config: [{
                            name: "Logging level",
                            description: "Logger level - off|trace|debug|info|warn|error",
                            type: "string",
                            value: "info",
                            key: "level"
                        }, {
                            name: "Logging Enabled",
                            description: "Logging enabled - true|false",
                            type: "boolean",
                            value: true,
                            key: "enabled"
                        }]
                    });

                    logger.info("New store added", store);

                } catch (err) {

                    logger.warn(err, "Could not add store item");
                    reject(err);

                }
            });
        });

        const vault = await new Promise((resolve, reject) => {
            C_VAULT.found({
                name: "NODE-RED",
                labels: [
                    `plugin=${self.uuid}`,
                    "node-red=true"
                ]
            }, resolve, async (filter) => {
                try {

                    let store = await C_VAULT.add({
                        ...filter,
                        secrets: [{
                            name: "Credential Secret",
                            key: "credentialSecret",
                            value: randomBytes(32).toString("hex")
                        }]
                    });

                    logger.info("New vault added", store);

                } catch (err) {

                    logger.warn(err, "Could not add vault item");
                    reject(err);

                }
            });
        });

        Promise.all([store, vault]).then(() => {

            const app = express();
            const server = self.httpServer(app);
            // or server.on("request", app);

            // fix #3
            app.get("/", (req, res) => {
                res.redirect("/red");
            });

            const config = store.lean();
            const secrets = vault.decrypt();

            server.once("listening", () => {

                logger.info(`node-red listening on http://${HTTP_ADDRESS}:${HTTP_PORT}/api/plugins/${self._id}/proxy/red`);

                RED.start();

            });

            const levelLookup = {
                10: logger.error,
                20: logger.error,
                30: logger.warn,
                40: logger.info,
                50: logger.debug,
                60: logger.trace,
                98: logger.trace,
                99: logger.trace
            };

            // https://nodered.org/docs/user-guide/runtime/configuration#node-configuration
            const settings = {
                credentialSecret: secrets.credentialSecret, //mySuperSecretKey123!
                httpAdminRoot: "/red",
                httpNodeRoot: "/api",
                //httpAdminRoot: false, may be make configrable the same as secret above, for security reasons?
                // on the other hand anything under /api is protected
                userDir: path.join(__dirname + "/nodered"),
                nodesDir: path.join(__dirname + "/nodes"),
                functionGlobalContext: {},
                //flowFile: "flows_OpenHaus.json",
                logging: {
                    console: {
                        level: config.level,
                        enabled: config.enabled,
                        handler: function (settings) {
                            return function (msg) {
                                if (settings.enabled) {
                                    if (msg.level in levelLookup) {

                                        levelLookup[msg.level](msg.msg);

                                    } else {

                                        console.log(`[${msg.level}] ${msg.msg}`);

                                    }
                                } else if (settings.disabled && process.env.NODE_ENV === "development") {

                                    console.log(msg.msg);

                                } else {

                                    // log nothing

                                }
                            };
                        }
                    }
                },
                editorTheme: {
                    page: {
                        title: "OpenHaus"
                    }
                }
            };

            RED.init(server, settings);

            app.use(settings.httpAdminRoot, RED.httpAdmin);
            app.use(settings.httpNodeRoot, RED.httpNode);

        }).catch((err) => {

            logger.error(err, "Could not init plugin");

        });

    });
};