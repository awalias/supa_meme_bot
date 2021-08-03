"use strict";
require("dotenv").config();
let nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");

const DISCORD_TYPE = {
  PING: 1,
};

module.exports.generate = async (event) => {
  const body = JSON.parse(event.body);
  let statusCode = 200;
  let responseBody = {};

  // verify discord crypto headers
  if (!(await verifySignature(event))) {
    statusCode = 401;
    responseBody = { error: "invalid request signature" };
    return { statusCode, body: JSON.stringify(responseBody) };
  }

  // respond to discord 'ping'
  if (body?.type == DISCORD_TYPE.PING) {
    responseBody = { type: DISCORD_TYPE.PING };
    return { statusCode, body: JSON.stringify(responseBody) };
  }

  return {
    statusCode,
    body: JSON.stringify({
      type: 4,
      data: {
        tts: false,
        content: "Congrats on sending your command!",
        embeds: [],
        allowed_mentions: {},
      },
    }),
  };
};

const verifySignature = (event) => {
  const authSig = Buffer.from(event.headers["x-signature-ed25519"], "hex");
  const authTs = event.headers["x-signature-timestamp"];
  const message = Buffer.from(authTs + event.body);
  const publicKey = Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex");
  return nacl.sign.detached.verify(message, authSig, publicKey);
};

