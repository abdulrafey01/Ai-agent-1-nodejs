"use client";
import React, { useEffect, useRef, useState } from "react";
import Bulb from "./components/Bulb";
import axios from "axios";

interface message {
  role: string;
  parts: {
    text: string;
  }[];
}

const temperatureColors: Record<string, string> = {
  daylight: "#ffd600",
  cool: "#94d1e0",
  warm: "#ffa000",
};

const page = () => {
  const [messages, setMessages] = useState<message[]>([]);
  const [input, setInput] = useState("");
  const [lightControl, setLightControl] = useState({
    brightness: 0,
    temperature: "",
  });

  const refScroll = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (refScroll.current) {
      // scrollTop → The vertical position of the scrollbar inside the container
      refScroll.current.scrollTop = refScroll.current.scrollHeight;
    }
  }, [messages]); // Runs every time messages update

  const sendBtnClick = async () => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", parts: [{ text: input }] },
      ]);
      setInput("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lighting`,
        {
          message: input,
          history: messages,
        }
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          parts: [
            {
              text: response.data.message,
            },
          ],
        },
      ]);
      if (response.data.record) {
        setLightControl({
          brightness: response.data.record.brightness,
          temperature: response.data.record.colorTemperature,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" flex flex-col-reverse sm:flex-row  min-h-screen justify-center items-center">
      {/* Chat Container */}
      <div
        ref={refScroll}
        className="w-full relative h-screen overflow-y-auto flex flex-col justify-start items-center border-t-2 sm:border-r-4 sm:border-t-0 border-gray-300"
      >
        <div className="w-full flex flex-col gap-8 justify-center items-center  pb-40 pt-8 px-4">
          {/* First message */}
          <div className={`flex w-full justify-start items-center`}>
            <span className="text-2xl">🤖</span>
            <p className="bg-[#2f7889] max-w-[70%] text-white p-4 rounded-2xl">
              Hello, I am the light bulb controller. How can I help you today?
            </p>
          </div>
          {messages.map((message, index) => (
            <div
              className={`flex w-full justify-start items-center ${
                message.role === "user" && " flex-row-reverse"
              }`}
            >
              {message.role === "user" ? (
                <span className="text-2xl">👦🏻</span>
              ) : (
                <span className="text-2xl">🤖</span>
              )}
              <p className="bg-[#2f7889] max-w-[70%] text-white p-4 rounded-2xl">
                {message.parts.map((part) => (
                  <span key={part.text}>{part.text}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
        {/* input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendBtnClick();
          }}
          className="flex fixed bottom-10 justify-center items-center gap-3"
        >
          <input
            className="p-2 rounded-2xl outline-none border-2 bg-amber-200 text-black"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="py-2 px-4 bg-[#2f7889] text-white rounded-2xl"
          >
            Send
          </button>
        </form>
      </div>
      {/* Bulb Container */}
      <div className="w-full flex justify-center items-center relative">
        <div
          className="absolute -top-10  w-50 h-50 rounded-full"
          style={{
            backgroundColor: temperatureColors[lightControl.temperature],
            filter:
              lightControl.brightness >= 30
                ? `blur(${lightControl.brightness}px)`
                : "blur(0px)",
            display: lightControl.brightness >= 30 ? "block" : "none",
          }}
        ></div>
        <Bulb
          className=" h-90 z-100"
          brightness={lightControl.brightness}
          temperature={lightControl.temperature}
        />
      </div>
    </div>
  );
};

export default page;
