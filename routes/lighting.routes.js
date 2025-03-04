import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();
// for ai models, you just need functionDeclarations, all else setup is for you. You have to call function yourself.

async function setLightValues(brightness, colorTemp) {
  // This mock API returns the requested lighting values
  return {
    brightness: brightness,
    colorTemperature: colorTemp,
  };
}

const controlLightFunctionDeclarations = {
  name: "controlLight",
  parameters: {
    type: "OBJECT",
    description: "Set the brightness and color temperature of a room light",
    properties: {
      brightness: {
        type: "NUMBER",
        description:
          "Light level from 0 to 100. Zero is off and 100 is full brightness.",
      },
      colorTemperature: {
        type: "STRING",
        description:
          "Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.",
      },
    },
    required: ["brightness", "colorTemperature"],
  },
};

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const functions = {
  controlLight: ({ brightness, colorTemperature }) => {
    return setLightValues(brightness, colorTemperature);
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a light controller.",
  tools: {
    functionDeclarations: [controlLightFunctionDeclarations],
  },
});

const chat = model.startChat();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await chat.sendMessage(message);
    // For simplicity, this uses the first function call found.
    const call = result.response.functionCalls()[0];
    // Call the executable function named in the function call
    // with the arguments specified in the function call and
    // let it call the hypothetical API.
    if (call) {
      const apiResponse = await functions[call.name][call.args];

      console.log(apiResponse);
      // Send the API response back to the model so it can generate
      // a text response that can be displayed to the user.
      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: "controlLight",
            response: call.args,
          },
        },
      ]);

      res.status(200).send({ message: result2.response.text() });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to control light" });
  }
});

export default router;
