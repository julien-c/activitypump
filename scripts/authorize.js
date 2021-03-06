// authorize.js
//
// Get OAuth token
//
// Copyright 2011-2012, StatusNet Inc.
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
    common = require("./common"),
    clientCred = common.clientCred,
    setUserCred = common.setUserCred,
    OAuth = require("oauth").OAuth,
    readline = require('readline'),
    argv = require("optimist")
        .usage("Usage: $0 -u <username>")
        .demand(["u"])
        .alias("u", "username")
        .alias("s", "server")
        .alias("P", "port")
        .describe("u", "User nickname")
        .describe("s", "Server name (default 'localhost')")
        .describe("P", "Port (default 80)")
        .default("P", 80)
        .default("s", "localhost")
        .argv,
    username = argv.u,
    server = argv.s,
    port = argv.P,
    cl,
    oa,
    rt;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

Step(
    function() {
        clientCred(server, this);
    },
    function(err, cred) {
        if (err) throw err;
        oa = new OAuth("http://"+server+":"+port+"/oauth/request_token",
                       "http://"+server+":"+port+"/oauth/access_token",
                       cred.client_id,
                       cred.client_secret,
                       "1.0",
                       "oob",
                       "HMAC-SHA1",
                       null, // nonce size; use default
                       {"User-Agent": "activitypump-scripts/0.1.0"});
        oa.getOAuthRequestToken(this);
    },
    function(err, token, secret) {
        var url;
        var callback = this;
        var verifier = "";
        if (err) throw err;
        rt = {token: token, secret: secret};
        url = "http://"+server+":"+port+"/oauth/authorize?oauth_token=" + rt.token;
        console.log("Login here: " + url);
        rl.question("What is the 'verifier' value? ", function(verifier) {
            verifier.trim();
            callback(null, verifier);
        });
    },
    function(err, verifier) {
        if (err) throw err;
        oa.getOAuthAccessToken(rt.token, rt.secret, verifier, this);
    },
    function(err, token, secret, res) {
        if (err) throw err;
        setUserCred(username, server, {token: token, token_secret: secret}, this);
    },
    function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("OK");
            rl.close();
        }
    }
);
