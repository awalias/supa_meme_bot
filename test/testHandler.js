"use strict";

const { generate } = require("../handler");

const generateMeme = async (event) => {
  const result = await generate(event);
  if (result.statusCode != 200 || !result.body.includes('.png')) {
    throw Error(`failed generateMeme\n${JSON.stringify(result)}`);
  } else {
    console.log("generateMeme pass");
  }
};

const discordPing = async (event) => {
  const result = await generate(event);
  if (result.statusCode != 200 || result.body != '{"type":1}') {
    throw Error(`failed discordPing\n${JSON.stringify(result)}`);
  } else {
    console.log("discordPing pass");
  }
};

generateMeme({
  headers: {
    "x-signature-ed25519":
      "2aad22021d2ecac65e485c81dd61048534768ce1aec61aeba91a8e07abcc811df4fe59721c97790304cfe4b86d52338798b424ccc1c807d1d30d105aa1460702",
    "x-signature-timestamp": "1627976667",
  },
  body: '{"application_id":"871996983890542592","id":"872022082265952276","token":"aW50ZXJhY3Rpb246ODcyMDIyMDgyMjY1OTUyMjc2OlZ5MWJsRUEzS0lMZG5hdGpIdmZKandqS2F0VHQzS3lNTzFLaUdISHIyb0hYQVFoSUoxbW01a0dnanhKblQ4eEYwQmdrdnl3UXd3Vk51RU9EaEtWWWFXakxTRldwcnlLYlR4a294aEY4S2MwYVcxOURmTGxQQlI4a0EyVmVvUjVD","type":2,"user":{"avatar":"4fbac9c2c76be990118b1186324db684","discriminator":"1403","id":"400623078259949579","public_flags":0,"username":"bobbybraun"},"version":1}',
});
discordPing({
  headers: {
    "x-signature-ed25519":
      "2aad22021d2ecac65e485c81dd61048534768ce1aec61aeba91a8e07abcc811df4fe59721c97790304cfe4b86d52338798b424ccc1c807d1d30d105aa1460702",
    "x-signature-timestamp": "1627976667",
  },
  body: '{"application_id":"871996983890542592","id":"872022082265952276","token":"aW50ZXJhY3Rpb246ODcyMDIyMDgyMjY1OTUyMjc2OlZ5MWJsRUEzS0lMZG5hdGpIdmZKandqS2F0VHQzS3lNTzFLaUdISHIyb0hYQVFoSUoxbW01a0dnanhKblQ4eEYwQmdrdnl3UXd3Vk51RU9EaEtWWWFXakxTRldwcnlLYlR4a294aEY4S2MwYVcxOURmTGxQQlI4a0EyVmVvUjVD","type":1,"user":{"avatar":"4fbac9c2c76be990118b1186324db684","discriminator":"1403","id":"400623078259949579","public_flags":0,"username":"bobbybraun"},"version":1}',
});
