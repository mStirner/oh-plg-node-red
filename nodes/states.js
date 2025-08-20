const C_ENDPOINTS = require("../../../components/endpoints/index.js");

module.exports = function (RED) {

    function StateNode(config) {

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

            let state = item.states.find((cmd) => {
                return cmd._id === config.state;
            });

            if (item && state) {
                this.status({
                    fill: "green",
                    shape: "dot",
                    text: "valid"
                });
            }

            const stateHandler = (obj) => {
                if (obj._id === state._id) {

                    let msg = {
                        payload: JSON.parse(JSON.stringify(state))
                        //payload: obj
                    };

                    this.status({
                        fill: "blue",
                        shape: "dot",
                        text: `value = ${state.value}`
                    });

                    this.send(msg);

                }
            };

            C_ENDPOINTS.events.on("state", stateHandler);

            this.on("input", (msg, send, done) => {

                state.value = msg.payload;
                msg.payload = JSON.parse(JSON.stringify(state));

                this.status({
                    fill: "blue",
                    shape: "dot",
                    text: `value = ${state.value}`
                });

                send(msg);
                done();

            });

            this.on("close", (removed, done) => {

                C_ENDPOINTS.events.off("state", stateHandler);

                done();

            });

        });

    }

    RED.nodes.registerType("states", StateNode);

};