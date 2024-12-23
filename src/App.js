import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMoon, FaSun } from "react-icons/fa"; // Import icons
import "./App.css";
import ChatHistory from "./component/ChatHistory";
import Loading from "./component/Loading";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [theme, setTheme] = useState("dark"); // Theme state
  const [mode, setMode] = useState("Text"); // Mode state
  const chatEndRef = useRef(null);

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI("AIzaSyAWbTSPGoWa_VwOua4fhOoqfIx5YgLqXJ4");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Function to handle user input
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Function to send user message to Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    setShowChat(true);
    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;
      const botMessage = response.text();

      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: botMessage },
      ]);

      // Speak bot response if in Voice mode
      if (mode === "Voice") {
        speak(botMessage);
      }
    } catch {
      console.error("Error sending message");
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([]);
    setShowChat(false);
  };

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  // Function to toggle mode and handle actions
  const toggleMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "Voice") {
      alert("Switched to Voice mode. Bot responses will be read aloud.");
    }
  };


  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; 
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <img
            src="/JR-RJ-logo-design-vector-Graphics-17172117-1-1-580x386.jpg"
            alt="Logo"
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-lg font-bold">Danishah’s Personal AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme}>
            {theme === "light" ? <FaMoon size={24} /> : <FaSun size={24} />}
          </button>
          <div className="flex justify-center items-center">
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-md">
              {/* Left Side - Voice */}
              <button
                className={`px-4 py-2 text-sm rounded-full transition duration-300 ${
                  mode === "Voice"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => toggleMode("Voice")}
              >
                Voice
              </button>

              {/* Right Side - Text */}
              <button
                className={`px-4 py-2 text-sm rounded-full transition duration-300 ${
                  mode === "Text"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => toggleMode("Text")}
              >
                Text
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Box */}
      {showChat && (
        <div className="flex-grow w-full max-w-3xl mx-auto p-6">
          <div className="chat-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            <ChatHistory chatHistory={chatHistory} />
            <Loading isLoading={isLoading} />
            <div ref={chatEndRef}></div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex w-full max-w-3xl mx-auto space-x-4">
      <input
  type="text"
  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-400 transition duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  placeholder="Type your message..."
  value={userInput}
  onChange={handleUserInput}
/>

          <button
            className="px-6 py-3 bg-blue-500 dark:bg-indigo-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-400 transition duration-300"
            onClick={sendMessage}
            disabled={isLoading}
          >
            Send
          </button>
          <button
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
            onClick={clearChat}
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
