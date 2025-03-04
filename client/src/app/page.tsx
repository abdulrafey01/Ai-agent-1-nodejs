"use client";
import React, { useEffect, useRef, useState } from "react";
import Bulb from "./components/Bulb";
import axios from "axios";

interface message {
  role: string;
  content: string;
}
const page = () => {
  const [messages, setMessages] = useState<message[]>([
    {
      role: "assistant",
      content:
        "Hello, I am the light bulb controller. How can I help you today?",
    },
    {
      role: "user",
      content: "I want to change the brightness of the light bulb.",
    },
    {
      role: "assistant",
      content:
        "Hello, I am the light bulb controller. How can I help you today?",
    },
    {
      role: "user",
      content: "I want to change the brightness of the light bulb.",
    },
    {
      role: "assistant",
      content:
        "Hello, I am the light bulb controller. How can I help you today?",
    },
    {
      role: "user",
      content: "I want to change the brightness of the light bulb.",
    },
    {
      role: "assistant",
      content:
        "Hello, I am the light bulb controller. How can I help you today?",
    },
    {
      role: "user",
      content: "I want to change the brightness of the light bulb.",
    },
  ]);
  const [input, setInput] = useState("");
  const [lightControl, setLightControl] = useState({
    brightness: 0,
    temperature: "warm",
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
        { role: "user", content: input },
      ]);
      setInput("");
      const response = await axios.post("http://localhost:5000/api/lighting", {
        message: input,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: response.data.message },
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
        className="w-full relative h-screen overflow-y-auto flex flex-col justify-start items-center border-t-2 sm:border-r-4 border-gray-300"
      >
        <div className="w-full flex flex-col gap-8 justify-center items-center  pb-40 pt-8">
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
                {message.content}
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
      <div className="w-full flex justify-center items-center">
        <Bulb
          className=" h-90"
          brightness={lightControl.brightness}
          temperature={lightControl.temperature}
        />
      </div>
    </div>
  );
};

export default page;
