const { Notification } = require("../../../system/notifications/index.js");
const createReplacer = require("../replacer.js");

module.exports = function (RED) {

    function NotificationNode(config) {

        RED.nodes.createNode(this, config);

        let notifcation = null;
        let events = Notification.events();


        const publishHandler = (event) => {
            if (event.uuid !== notifcation?.uuid) {

                const replacer = createReplacer();

                const msg = {
                    payload: JSON.parse(JSON.stringify(event, replacer))
                };

                this.send(msg)

            }
        };


        events.on("publish", publishHandler);

        this.on("input", (msg, send, done) => {

            notifcation = new Notification(msg.payload);
            notifcation?.publish();

        });


        this.on("close", (removed, done) => {

            events.off("publish", publishHandler);

            done();

        });


    }

    RED.nodes.registerType("notification", NotificationNode);

};