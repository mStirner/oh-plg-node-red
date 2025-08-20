const { emitter, emitted } = require("../../../system/component/class.events.js");

module.exports = function (RED) {

    function EventsNode(config) {

        RED.nodes.createNode(this, config);

        const emittedHandler = ({ component, event, args }) => {
            if (event !== "get") {

                const msg = {
                    /*
                    payload: JSON.stringify({
                        component,
                        event,
                        args
                    })
                    */
                    // without stringify/parse 
                    // TypeError: Class constructor Labels cannot be invoked without "new"
                    /*
                        at initCloneArray (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:1235:22)
                        at baseClone (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:854:14)
                        at /home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:897:30
                        at arrayEach (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:140:9)
                        at baseClone (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:891:3)
                        at /home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:897:30
                        at arrayEach (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:140:9)
                        at baseClone (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:891:3)
                        at /home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:897:30
                        at arrayEach (/home/marc/projects/OpenHaus/backend/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d/node_modules/lodash.clonedeep/index.js:140:9)
                    */
                    payload: JSON.parse(JSON.stringify({
                        component,
                        event,
                        args
                    }))
                };

                this.send(msg);

            }
        };

        emitter.on(emitted, emittedHandler);

        this.on("close", (removed, done) => {

            emitter.off("state", emittedHandler);

            done();

        });


    }

    RED.nodes.registerType("events", EventsNode);

};