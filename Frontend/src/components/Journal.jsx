import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Header from "./Header";
import axios from 'axios';
import { motion } from "framer-motion";

const moods = ["Great", "Good", "Neutral", "Bad", "Terrible"];
const emojis = ["😄", "🙂", "😐", "😕", "😞"];

export default function MoodJournal() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  // -----------------------------
  // FETCH USER
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (e) {
        console.error("User fetch error:", e);
      }
    };
    fetchUser();
  }, []);

  // -----------------------------
  // FETCH JOURNAL ENTRIES
  // -----------------------------
  useEffect(() => {
    if (!user?._id) return;

    const fetchEntries = async () => {
  const res = await axios.get(
    "http://127.0.0.1:8000/api/journal",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  setEntries(res.data);
};


    fetchEntries();
  }, [user]);

  // -----------------------------
  // SAVE ENTRY
  // -----------------------------
  const handleSubmit = async () => {
    if (selectedMood === null || note.length < 5) return;
    console.log("hi");
    const today = new Date().toISOString().split("T")[0];
    try {
      await axios.post(
        "https://safespace-chat.onrender.com/api/journal",
        {
          date: today,
          mood: moods[selectedMood],
          emoji: emojis[selectedMood],
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // refetch instead of duplicating
      setDate("");
      setNote("");
      setSelectedMood(null);

      const refreshed = await axios.get(
      "https://safespace-chat.onrender.com/api/journal",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setEntries(refreshed.data);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  // -----------------------------
  // MOOD ANALYTICS
  // -----------------------------
  let mostCommonMood = null;
  let mostCommonEmoji = "";
  let mostCommonPercentage = 0;

  if (entries.length) {
    const count = {};
    entries.forEach((e) => (count[e.mood] = (count[e.mood] || 0) + 1));
    mostCommonMood = Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );
    mostCommonEmoji = emojis[moods.indexOf(mostCommonMood)];
    mostCommonPercentage = Math.round(
      (count[mostCommonMood] / entries.length) * 100
    );
  }

  // -----------------------------
  // ADMIN NOTIFICATION
  // -----------------------------
  useEffect(() => {
    if (entries.length > 15 && mostCommonMood === "Terrible") {
      axios.post("https://safespace-chat.onrender.com/notify-admin", {
        message: "User showing prolonged distress",
        timestamp: new Date().toISOString(),
      });
    }
  }, [entries, mostCommonMood]);




  return (
    <div className=" font-sans overflow-x-hidden text-gray-800 bg-white w-screen overflow-y-scroll bg-fixed bg-no-repeat bg-[url('/images/bg.jpg')] h-screen py-40 ">
      <div className="w-full flex justify-center items-center">
      <motion.div animate={{opacity:[0, 1]}} transition={{duration: 1}} className='lg:w-[60%] md:w-[90%] fixed z-50 top-0'>
          <Header/>
      </motion.div>
      </div>
      

      <div className="grid md:grid-cols-3 gap-6 px-10 md:px-80 mt-10">
        
        {/* New Entry */}
        <div className="col-span-2 bg-white rounded-xl shadow-2xl p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-start">New Entry</h3>
          <p className="text-sm text-gray-500 mb-5 flex items-start font-medium">
            Record how you're feeling today
          </p>

          {/* <label className="text-sm font-medium flex items-center gap-2 mb-2">
            Date
          </label>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-gray-200 border rounded px-3 py-2 w-full"
            />
          </div> */}

          <label className="text-sm font-medium mb-3 flex-col flex items-start">Mood</label>
          <div className="flex gap-2 flex-wrap mb-4">
            {moods.map((mood, idx) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(idx)}
                className={` rounded-full px-3 py-1 flex items-center gap-1 ${
                  selectedMood === idx
                    ? "bg-purple-700 text-white border border-purple-700"
                    : "bg-gray-100 text-black border border-gray-200"
                }`}
              >
                <span>{emojis[idx]}</span> {mood}
              </button>
            ))}
          </div>

          <label className="text-sm font-medium mb-2  flex items-start">Notes</label>
          <textarea
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border border-gray-300 rounded p-3 w-full mb-2"
            placeholder="How are you feeling today? What made you feel this way?"
          ></textarea>
          <p className="text-xs text-gray-500 mb-4">
            Write at least 5 characters about your day and feelings
          </p>

          <button
            onClick={handleSubmit}
            className="bg-purple-900 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
          >
            Save Entry
          </button>
        </div>

        {/* Mood Review */}
        <div className="bg-white rounded-xl shadow-2xl p-6 w-[150%] md:w-auto">
          <h3 className="text-lg font-semibold mb-1 flex items-start">Mood Review</h3>
          <p className="text-sm text-gray-500 mb-5 flex items-start">
            Analysis of your mood patterns
          </p>

          <div className="text-sm mb-2">
            <p className="font-medium flex items-start">Journal Entries</p>
            <p className="flex items-start">{entries.length} entries recorded</p>
          </div>

          {entries.length > 0 && (
          <div className="text-sm mt-4 mb-2">
            <p className="font-medium flex items-start mb-3">Most Common Mood</p>
            <p className="flex items-center gap-2">
              {mostCommonEmoji}{" "}
              <span className="bg-green-100 text-green-800 px-2 py-0.5 mb-2 rounded-full text-sm">
                {mostCommonMood}
              </span>
            </p>
            <p className="text-gray-500">{mostCommonPercentage}% of the time</p>
          </div>
          )}

        </div>
      </div>

      {/* Recent Entries */}
      <div className="mt-10 px-10 md:px-80 my-10">
        <h3 className="text-2xl font-semibold mb-4"> Recent Entries</h3>
        {[...entries].reverse().map((entry, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-2xl p-4 mb-2 "
          >
            <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
              {entry.date}{" "}
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm">
                {entry.emoji} {entry.mood}
              </span>
            </p>
            <p className="text-sm flex items-start my-3">{entry.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
