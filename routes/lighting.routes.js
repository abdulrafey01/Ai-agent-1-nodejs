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

    const calls = result.response.functionCalls();

    // cant access length of undefined var therfore, first check if it is not undefined
    if (calls && calls.length > 0) {
      const call = calls[0];
      const selectedFunction = functions[call.name];
      const apiResponse = await selectedFunction({ ...call.args });
      let record = apiResponse;

      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: "controlLight",
            response: apiResponse,
          },
        },
      ]);

      res.status(200).send({ message: result2.response.text(), record });
    } else {
      res.status(200).send({ message: result.response.text() });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to control light" });
  }
});

export default router;
