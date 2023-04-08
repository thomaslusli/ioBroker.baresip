"use strict";
const net = require("net");
const Netstring = require("netstring-stream");

function BaresipClient(adapter) {
	if (!(this instanceof BaresipClient)) {
		return new BaresipClient(adapter);
	}

	let client = null;
	let connected = false;
	let dtmf = "";
	let tout;
	let tout1;
	let tout2;
	let tout_dtmf;
	let tout_error;
	let tout_close;
	let tout_timeout;

	this.destroy = () => {
		if (client) {
			clearTimeout(tout);
			clearTimeout(tout1);
			clearTimeout(tout2);
			clearTimeout(tout_dtmf);
			clearTimeout(tout_error);
			clearTimeout(tout_close);
			clearTimeout(tout_timeout);
			tout = null;
			tout1 = null;
			tout2 = null;
			tout_dtmf = null;
			tout_error = null;
			tout_close = null;
			tout_timeout = null;
			client.destroy();
			client = null;
		}
	};

	this.onStateChange = (id, state) => send2Server(id, state);

	function send2baresip(command, str) {
		client.write(Netstring.write('{"command":"' + command + '","params":"' + str + '"}'));
	}

	function send2Server(id, state) {
		if ((!client) || (!connected) || (!state.val)) return;
		adapter.log.debug("stateChange" + id + ": " + JSON.stringify(state));
		const dp = (id.split("."));
		switch (dp[2]) {
			case ("accept"):
				send2baresip("accept", "");
				break;
			case ("hangup"):
				send2baresip("hangup", "");
				break;
			case ("dial"):
				adapter.getState("NUMBER", function (err, state) {
					const nummer = state.val;
					if (nummer || "") {
						send2baresip("dial", nummer);
					}
				});
				break;
			case ("sendDTMFcode"):
				adapter.getState("DTMFcode", function (err, state) {
					const DTMFcode = state.val;
					send2baresip("sndcode", DTMFcode);
				});
				break;

		}
	}

	(function _constructor(config) {
		client = new net.Socket();
		client.connect(config.BareSIP_port, config.BareSIP_url, () => { });
		client.setKeepAlive(true, 30000);
		// create connected object and state
		adapter.getObject("info.connection", (err, obj) => {
			if (!obj || !obj.common || obj.common.type !== "boolean") {
				obj = {
					_id: "info.connection",
					type: "state",
					common: {
						role: "indicator.connected",
						name: "If connected to Baresip",
						type: "boolean",
						read: true,
						write: false,
						def: false
					},
					native: {}
				};
				adapter.setObject("info.connection", obj, () => adapter.setState("info.connection", connected, true));
			}
		});

		client.on("data", function (data) {
			try {
				adapter.log.debug(data);
				adapter.log.debug("Netstring : " + Netstring.read(data));
				const jsonContent = JSON.parse(Netstring.read(data));
				let ch = jsonContent.param;
				switch (jsonContent.type) {
					case ("REGISTER_OK"):
						adapter.setState("REGISTER_OK", true, true);
						break;
					case ("REGISTER_FAIL"):
						adapter.setState("REGISTER_OK", false, true);
						break;
					case ("CALL_DTMF_END"):
						adapter.log.debug("CALL_DTMF_END");
						break;
					case ("CALL_DTMF_START"):
						if (dtmf.length == 0) {
							tout_dtmf = setTimeout(() => {
								tout_dtmf = null;
								dtmf = "";
								adapter.log.debug("DTMF Timeout");
							}, 5000);
						}
						ch = ch.toString("utf8");
						if (ch != "\u0004") dtmf = dtmf + ch;
						adapter.log.debug("CALL_DTMF_START : " + dtmf);
						adapter.setState("recDTMFcode",dtmf,true);
						break;
					case ("CALL_ESTABLISHED"):
						clearTimeout(tout_timeout);
						tout_timeout = null;
						adapter.setState("CALL_PROGRESS", false, true);
						if (adapter.config.call_active) { adapter.setForeignState(adapter.config.call_active, true); }
						adapter.setState("CALL_ACTIVE", true, true);
						if (adapter.config.call_established) { adapter.setForeignState(adapter.config.call_established, true); }
						adapter.setState("CALL_ESTABLISHED", true, true);
						adapter.log.debug("CALL_ESTABLISHED");
						clearTimeout(tout1);
						tout1 = setTimeout(() => {
							tout1 = null;
							if (adapter.config.call_established) { adapter.setForeignState(adapter.config.call_established, false); }
							adapter.setState("CALL_ESTABLISHED", false, true);
						}, 1000);
						break;
					case ("CALL_PROGRESS"):
						adapter.setState("CALL_PROGRESS", true, true);
						clearTimeout(tout_timeout);
						tout_timeout = setTimeout(() => {
							tout_timeout = null;
							send2baresip("hangup", "");
						}, adapter.config.ringtimeout * 1000);
						break;
					case ("CALL_CLOSED"):
						dtmf = "";
						adapter.setState("CALL_PROGRESS", false, true);
						if (adapter.config.call_active) { adapter.setForeignState(adapter.config.call_active, false); }
						adapter.setState("CALL_ACTIVE", false, true);
						if (adapter.config.call_closed) { adapter.setForeignState(adapter.config.call_closed, true); }
						adapter.setState("CALL_CLOSED", true, true);
						adapter.setState("CALLING_NUMBER", "none", true);
						adapter.log.debug("CALL_CLOSED");
						clearTimeout(tout2);
						tout2 = setTimeout(() => {
							tout2 = null;
							if (adapter.config.call_closed) { adapter.setForeignState(adapter.config.call_closed, false); }
							adapter.setState("CALL_CLOSED", false, true);
						}, 1000);
						break;
					case ("CALL_INCOMING"): {
						let callerID = jsonContent.peeruri;
						let pos = callerID.indexOf(":");
						if (pos >= 0) {
							callerID = callerID.substring(pos + 1);
						}
						pos = callerID.indexOf("@");
						if (pos >= 0) {
							callerID = callerID.substring(0, pos);
						}
						adapter.log.debug("incoming call from:" + callerID);
						adapter.setState("CALLING_NUMBER", callerID, true);

						break;
					}
				}
			} catch (err) {
				adapter.log.debug(err);
			}
		});

		client.on("connect", () => {
			adapter.log.info("Connected to " + config.BareSIP_url);
			connected = true;
			adapter.setState("info.connection", connected, true);
		});

		client.on("error", err => {
			adapter.log.error("Client error:" + err);

			if (connected) {
				adapter.log.info("Disconnected from " + config.BareSIP_url);
				connected = false;
				adapter.setState("info.connection", connected, true);
			}
			tout_error = setTimeout(() => {
				tout_error = null;
				_constructor(config);
			}, 10000);
		});

		client.on("close", () => {
			if (connected) {
				adapter.log.info("Disconnected from " + config.BareSIP_url);
				connected = false;
				adapter.setState("info.connection", connected, true);
				tout_close = setTimeout(() => {
					tout_close = null;
					_constructor(config);
				}, 10000);
			}
		});
	})(adapter.config);

	process.on("uncaughtException", err => adapter.log.error("uncaughtException: " + err));

	return this;
}

module.exports = BaresipClient;

