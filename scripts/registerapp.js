// registerapp.js
//
// Make a new app key and secret
//
// Copyright 2012, StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _ = require("underscore"),
    Step = require("step"),
    url = require("url"),
    common = require("./common"),
    postArgs = common.postArgs,
    setClientCred = common.setClientCred;

var argv = require("optimist")
        .usage("Usage: $0 -t title -e email [-w|-n]")
        .demand(["t"])
        .alias("t", "title")
        .alias("e", "email")
        .alias("w", "web")
        .alias("n", "native")
        .alias("s", "server")
        .alias("P", "port")
        .describe("t", "Title of the app")
        .describe("e", "Contact email")
        .describe("w", "Web application")
        .describe("n", "Native application")
        .describe("s", "Server name")
        .describe("P", "Port")
        .default("P", 80)
        .default("s", "localhost")
        .argv;

var server = argv.server,
    port = argv.port;

var args = {
    type: "client_associate",
    application_name: argv.title
};

if (argv.web) {
    args.application_type = "web";
} else if (argv["native"]) {
    args.application_type = "native";
}

if (argv.email) {
    args.contacts = argv.email;
};

Step(
    function() {
        var endpoint = url.format({
            protocol: "http",
            host: ((port == 80) ? server : server + ":" + port),
            pathname: "/api/client/register"
        });
        postArgs(endpoint, args, this);
    },
    function(err, res, body) {
        if (err) throw err;
        var cred = JSON.parse(body);
        setClientCred(server, cred, this);
    },
    function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("OK");
        }
    }
);
