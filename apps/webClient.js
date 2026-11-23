const { frameName, frameVer, frameID } = require("#config/core/core");
const { pluginName, pluginVer } = require("#config/cosmetic/config");
const { apiServer } = require("#config/discord/api/NexAPI");
const { log } = require("#functions/core/log.mjs");
const WebSocket = require("ws");

let socket = null;
let reconnectTimer = null;
let shuttingDown = false;

function connect() {
    if (shuttingDown) return;

    socket = new WebSocket(apiServer);
    const ws = socket;

    ws.on("open", () => {
        log.event(`Connected to ${frameName} API.`);
    });

    ws.on("message", (raw) => {
        let data;

        try {
            data = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (data.type === "getName") {
            ws.send(JSON.stringify({
                type: "name",
                value: `${frameName} v${frameVer} (${pluginName} v${pluginVer}) / Version ID: ${frameID}`
            }));
        }
    });

    ws.on("error", (error) => {
        log.warn(`WebSocket error: ${error.message}`);
    });

    ws.on("close", () => {
        if (shuttingDown || socket !== ws) return;

        log.warn("WebSocket disconnected. Retrying in 5 seconds...");

        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
        }, 5000);
    });
}

module.exports = {
    get socket() {
        return socket;
    },

    async execute() {
        shuttingDown = false;
        connect();
    },

    async refresh() {
        await this.close();
        await this.execute();
    },

    async close() {
        shuttingDown = true;

        clearTimeout(reconnectTimer);
        reconnectTimer = null;

        if (!socket) return;

        const oldSocket = socket;
        socket = null;
        oldSocket.terminate();
    }
};