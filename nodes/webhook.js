const C_WEBHOOKS = require("../../../components/webhooks/index.js");

module.exports = function (RED) {

    function WebhookNode(config) {

        RED.nodes.createNode(this, config);

        this.status({
            fill: "red",
            shape: "dot",
            text: "invalid"
        });

        C_WEBHOOKS.get(config.webhook).then((item) => {

            if (!item) {
                return;
            }

            this.status({
                fill: "green",
                shape: "dot",
                text: "valid"
            });

            const handler = () => {

                let msg = {
                    //payload: item // gives "[object object]" in debugger
                    payload: JSON.parse(JSON.stringify(item))
                };

                this.send(msg);

            };

            item.handle(handler);

            this.on("close", (removed, done) => {

                let index = item._handler.indexOf(handler);
                item._handler.splice(index, 1);

                done();

            });

        });

    }

    RED.nodes.registerType("webhook", WebhookNode);

};