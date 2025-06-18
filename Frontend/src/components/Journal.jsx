import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Header from "./Header";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import axios from 'axios';

const moods = ["Great", "Good", "Neutral", "Bad", "Terrible"];
const emojis = ["😄", "🙂", "😐", "😕", "😞"];

export default function MoodJournal() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [User, setUser] = useState(null);
  const [userId, setUserId] = useState("");

  const handleSubmit = async () => {

    if (note.length >= 5 && date && selectedMood !== null) {
      
      const newEntry = {
        date,
        mood: moods[selectedMood],
        emoji: emojis[selectedMood],
        note,
        userId
      };

      setEntries([newEntry, ...entries]);
      setNote("");
      setSelectedMood(null);
      try{
        const response = await fetch('http://localhost:5000/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          
          },
          body: JSON.stringify({
            ...newEntry,
            userId: userId, 
          }),
          
        }
      );
        const data = await response.json();
      if (response.ok) {
        setEntries([newEntry, ...entries]);
        setNote("");
        setSelectedMood(null);
      } else {
        console.log('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
      }
      
    }

  let mostCommonMood = null;
  let mostCommonEmoji = "";
  let mostCommonPercentage = 0;
  if (entries.length > 0) {
    const moodCount = {};
    entries.forEach((entry) => {
      moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
    });
  
    mostCommonMood = Object.keys(moodCount).reduce((a, b) =>
      moodCount[a] > moodCount[b] ? a : b
    );
  
    mostCommonEmoji = emojis[moods.indexOf(mostCommonMood)];
    mostCommonPercentage = Math.round(
      (moodCount[mostCommonMood] / entries.length) * 100
    );}
  
    useEffect(() => {
    
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token'); 
          const response = await axios.get('http://localhost:5000/api/user', {
            headers: {
              Authorization: `Bearer ${token}`,  
          }}
        );
          setUserId(response.data._id);
          setUser(response.data);  
          } catch (err) {
          console.error(err);
        }
      };
  
      fetchUserData();
  
    }, []);

    useEffect(() => {
      if (!userId) return;
      const fetchEntries = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/journal/${userId}`);
          const data = await response.json();
          if (response.ok) {
            setEntries(data); 
          } else {
            console.error("Error fetching entries:", data.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };
  
      fetchEntries();
    }, [userId]);

    useEffect(()=>{
      if(entries.length>15 && mostCommonMood =='terrble'){
        const sendNotif = async ()=>{
          try {
            const timestamp = new Date().toISOString(); // ISO format with Z included by default
            await axios.post("http://localhost:5000/notify-admin", {
              message: '',
              userId: userId,
              timestamp: timestamp,
            });
          } catch (e) {
            console.error("Notification error:", e);
          }}
          sendNotif();
      }
    },[entries, mostCommonMood, userId]);


  return (
    <div className=" font-sans overflow-x-hidden text-gray-800 bg-white w-screen overflow-y-scroll bg-fixed bg-no-repeat bg-[url('/images/bg.jpg')] ">
      <Header/> 
      

      <div className="grid md:grid-cols-3 gap-6 px-10 md:px-80 mt-10">
        
        {/* New Entry */}
        <div className="col-span-2 bg-white rounded-xl shadow-2xl p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-start">New Entry</h3>
          <p className="text-sm text-gray-500 mb-5 flex items-start font-medium">
            Record how you're feeling today
          </p>

          <label className="text-sm font-medium flex items-center gap-2 mb-2">
            Date
          </label>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-gray-200 border rounded px-3 py-2 w-full"
            />
          </div>

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
            onClick={()=>{handleSubmit()}}
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
        {entries.map((entry, idx) => (
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
