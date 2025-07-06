import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { io } from "socket.io-client";

let socket;

const API_URL = "https://rps-server.onrender.com";

const Game = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loggedIn, setLoggedIn] = useState(!!token);
  const [choice, setChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(1200);
  const [leaderboard, setLeaderboard] = useState([]);
  const [music, setMusic] = useState(null);
  const [view, setView] = useState("login");
  const [matchFound, setMatchFound] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");

  useEffect(() => {
    if (token) {
      socket = io(API_URL, { auth: { token } });

      socket.on("connect", () => console.log("Connected to game server"));

      socket.on("match_found", () => setMatchFound(true));

      socket.on("game_result", ({ opponent, outcome, rating, leaderboard }) => {
        setOpponentChoice(opponent);
        setResult(outcome);
        setRating(rating);
        setLeaderboard(leaderboard);
      });

      socket.on("chat", (msg) => setChatMessages((prev) => [...prev, msg]));
    }
  }, [token]);

  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert("Registered! Now login");
      setView("login");
    } catch (e) {
      alert(e.response?.data?.error || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setLoggedIn(true);
    } catch (e) {
      alert(e.response?.data?.error || "Login failed");
    }
  };

  const play = (userChoice) => {
    setChoice(userChoice);
    socket.emit("play", userChoice);
  };

  const sendMessage = () => {
    socket.emit("chat", { user: email, text: message });
    setMessage("");
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) setMusic(URL.createObjectURL(file));
  };

  if (!loggedIn) {
    return (
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold">{view === "register" ? "Register" : "Login"}</h2>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {view === "register" ? (
          <Button onClick={register}>Register</Button>
        ) : (
          <Button onClick={login}>Login</Button>
        )}
        <Button variant="link" onClick={() => setView(view === "register" ? "login" : "register")}>
          {view === "register" ? "Have an account? Login" : "Need an account? Register"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Rock Paper Scissors</h2>
      {matchFound ? (
        <div>
          <Button onClick={() => play("rock")}>Rock</Button>
          <Button onClick={() => play("paper")}>Paper</Button>
          <Button onClick={() => play("scissors")}>Scissors</Button>
          <p>Your choice: {choice}</p>
          <p>Opponent's choice: {opponentChoice}</p>
          <p>Result: {result}</p>
        </div>
      ) : (
        <p>Waiting for opponent...</p>
      )}
      <p>Rating: {rating}</p>
    </div>
  );
};

export default Game;