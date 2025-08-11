var http = require('http');
var express = require("express");
var RED = require("node-red");

const { rmSync } = require("fs");

rmSync("/tmp/OpenHaus/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d.sock");

// Create an Express app
var app = express();

// Add a simple route for static content served from 'public'
//app.use("/", express.static("nodes"));

// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    //userDir: "/home/marc/.nodered/",
    userDir: "./nodered",
    functionGlobalContext: {},    // enables global context
    nodesDir: "./nodes", // does not allow rto pass cumstom object/parameter
    externalModules: {
        palette: {
            allowInstall: true // oder true, wenn du Installationen erlauben willst
        },
        modules: [
            "lower-case",
            "uppercase",
            "nodes/lower-case.js",
            "nodes/uppercase.js"
        ]
    },
    editorTheme: {
        projects: {
            enabled: false
        },
        palette: {
            editable: true
        }
    }
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);



server.listen("/tmp/OpenHaus/plugins/09d24b11-041f-4d4b-911c-f2ab04b4f60d.sock");
//server.listen(8081);

// Start the runtime
RED.start().then(() => {

    console.log("require nodes")

    //require("./nodes/lower-case.js")(RED);
    //require("./nodes/uppercase.js")(RED);

});