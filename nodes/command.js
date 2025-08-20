const C_ENDPOINTS = require("../../../components/endpoints/index.js");

module.exports = function (RED) {

    function CommandNode(config) {

        RED.nodes.createNode(this, config);

        this.status({
            fill: "red",
            shape: "dot",
            text: "invalid"
        });

        C_ENDPOINTS.get(config.endpoint).then((item) => {

            if (!item) {
                return;
            }

            let cmd = item.commands.find((cmd) => {
                return cmd._id === config.command;
            });

            if (item && cmd) {
                this.status({
                    fill: "green",
                    shape: "dot",
                    text: "valid"
                });
            }

            this.on("input", (msg, send, done) => {

                if (config?.ignoreParams) {
                    msg.payload = null;
                }

                cmd.trigger(msg?.payload || [], (err, success) => {

                    msg.payload = {
                        error: err,
                        success,
                        command: cmd
                    };

                    send(msg);
                    done();

                });

            });

        });


    }

    RED.nodes.registerType("command", CommandNode);

};