const C_SCENES = require("../../../components/scenes/index.js");
const createReplacer = require("../replacer.js");

module.exports = function (RED) {

    function ScenesNode(config) {

        RED.nodes.createNode(this, config);

        this.status({
            fill: "red",
            shape: "dot",
            text: "invalid"
        });

        C_SCENES.get(config.scene).then((item) => {

            if (!item) {
                return;
            }

            this.status({
                fill: "green",
                shape: "dot",
                text: "valid"
            });

            const stateHandler = (state) => {
                if (state.running && state.index === 0) {

                    const replacer = createReplacer();

                    const msg = {
                        payload: JSON.parse(JSON.stringify(item, replacer))
                    };

                    this.send([
                        null,
                        msg
                    ]);

                } else {

                    const replacer = createReplacer();

                    const msg = {
                        payload: JSON.parse(JSON.stringify(state, replacer))
                    };

                    this.send([
                        msg,
                        null
                    ]);

                }
            };

            C_SCENES.events.on("state", stateHandler);

            this.on("input", (msg, send, done) => {

                if (!(msg?.payload instanceof Array)) {
                    msg.payload = [];
                }

                // msg.payload = input/params array
                item.trigger(msg?.payload || []);

                done();

            });

            this.on("close", (removed, done) => {

                C_SCENES.events.off("state", stateHandler);

                done();

            });

        });

    }

    RED.nodes.registerType("scene", ScenesNode, {
        inputs: 1,
        outputs: 2
    });

};