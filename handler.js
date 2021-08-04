"use strict";
require("dotenv").config();
let nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const memes = require("random-memes");
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
const { decode } = require("base64-arraybuffer");

const DISCORD_TYPE = {
  PING: 1,
};

const IS_DEV = process.env.ENV == "dev";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports.generate = async (event) => {
  const body = JSON.parse(event.body);
  let statusCode = 200;
  let responseBody = {};

  try {
    // verify discord crypto headers
    if (!(await verifySignature(event)) && !IS_DEV) {
      statusCode = 401;
      responseBody = { error: "invalid request signature" };
      throw Error(JSON.stringify(responseBody));
    }

    // respond to discord 'ping'
    if (body?.type == DISCORD_TYPE.PING) {
      responseBody = { type: DISCORD_TYPE.PING };
      return { statusCode, body: JSON.stringify(responseBody) };
    }

    // grab a random template from Supabase
    let values = await Promise.all([
      getRandomTemplateUrl(),
      getRandomTopText(),
      getRandomBottomText(),
    ]);

    const templateUrl = values[0];
    const topText = values[1];
    const bottomText = values[2];

    if (!templateUrl) {
      statusCode = 404;
      responseBody = { error: "no template found" };
      throw Error(JSON.stringify(responseBody));
    }

    // add the text to the template
    const meme = await generateMeme(topText, bottomText, templateUrl);

    // upload the result to supabase storage
    const memeUrl = await uploadAndGetUrl(meme);
    if (!memeUrl) {
      statusCode = 500;
      responseBody = { error: "error uploading meme to bucket" };
      throw Error(JSON.stringify(responseBody));
    }

    return {
      statusCode,
      body: JSON.stringify({
        type: 4,
        data: {
          tts: false,
          content: "",
          embeds: [{ image: { url: memeUrl } }],
          allowed_mentions: {},
        },
      }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode, body: JSON.stringify(responseBody) };
  }
};

const verifySignature = async (event) => {
  const authSig = Buffer.from(event.headers["x-signature-ed25519"], "hex");
  const authTs = event.headers["x-signature-timestamp"];
  const message = Buffer.from(authTs + event.body);
  const publicKey = Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex");
  return nacl.sign.detached.verify(message, authSig, publicKey);
};

const getRandomTemplateUrl = async () => {
  let { data, error } = await supabase.rpc("get_random_template_name");
  if (error || !data) false;
  else return process.env.TEMPLATE_BUCKET_BASE_URL + "/" + data;
};

const uploadAndGetUrl = async (meme) => {
  const { data, error } = await supabase.storage
    .from("memes")
    .upload(uuidv4() + ".png", decode(meme.split(",")[1]), {
      contentType: "image/png",
    });
  if (error || !data) {
    console.error(error);
    return false;
  }
  return process.env.MEMES_BUCKET_BASE + "/" + data.Key.split("/")[1];
};

const generateMeme = async (topText, bottomText, imgUrl) => {
  let memecontent = {
    toptext: topText,
    bottomtext: bottomText,
    getdataurl: true,
  };
  const meme = await memes.createMeme(imgUrl, memecontent);
  return meme;
};

const getRandomTopText = async () => {
  let { data, error } = await supabase.rpc("get_random_top_text");
  if (error) {
    console.error(error);
    return false;
  }
  return data;
};

const getRandomBottomText = async () => {
  let { data, error } = await supabase.rpc("get_random_bottom_text");
  if (error) {
    console.error(error);
    return false;
  }
  return data;
};
