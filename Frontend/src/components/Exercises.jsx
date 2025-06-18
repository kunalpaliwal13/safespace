import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import axios from 'axios';
import Header from "../components/Header";
import Footer from "./Footer";


const exerciseList = [
  {
    title: "Deep Breathing Exercise",
    description: "A simple exercise to calm your mind and reduce anxiety.",
    tags: ['anxiety', 'breathing', 'beginner'],
    audio: "../../public/audios/deepbreathing.mp3"
  },
  {
    title: "Body Scan Meditation",
    description: "Focus on different parts of your body to enhance awareness and relaxation.",
    tags: ['advanced', 'meditation'],
    audio: "../../public/audios/bodyscan.mp3"
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Tense and release muscles to relieve physical tension.",
    tags: ['intermediate', 'meditation'],
    audio: "../../public/audios/musclerelax.mp3"
  },
  {
    title: "4-7-8 Breathing",
    description: "Use the 4-7-8 pattern to slow your heart rate and relax.",
    tags: ['breathing', 'beginner'],
    audio: "../../public/audios/478.mp3"
  },
  {
    title: "Box Breathing",
    description: "Balance your breath with equal counts of inhale, hold, exhale, and hold.",
    tags: ['breathing', 'beginner'],
    audio: "../../public/audios/boxbreathing.mp3"
  },
  {
    title: "Grounding Exercise",
    description: "Connect with the present moment using sensory awareness.",
    tags: ['intermediate', 'meditation'],
    audio: "../../public/audios/grounding.mp3"
  },
  {
    title: "Visualization Technique",
    description: "Imagine calming scenes to reduce stress and foster calm.",
    tags: ['intermediate', 'meditation'],
    audio: "../../public/audios/visualization.mp3"
  }
];

const videoList = [
  {
    title: "Understanding Anxiety",
    description: "Learn about the causes and symptoms of anxiety and how to manage it.",
    videoUrl: "https://www.youtube.com/embed/U9ml2mmfMfM?si=7K_pf5fWtQMmdmRX"
  },
  {
    title: "Tips for Managing Stress",
    description: "Practical strategies to cope with stress in everyday life.",
    videoUrl: "https://www.youtube.com/embed/qUz93CyNIz0?si=fNa1QPOeopMYWrjZ"
  },
  {
    title: "The Benefits of Mindfulness",
    description: "Explore how mindfulness can improve mental well-being.",
    videoUrl: "https://www.youtube.com/embed/0iUsKvGRYRo?si=bwH17D4lrQ8dhS9z"
  },
  {
    title: "Guided Meditation for Sleep",
    description: "Use this meditation to unwind and fall asleep peacefully.",
    videoUrl: "https://www.youtube.com/embed/g0jfhRcXtLQ?si=O5GyRY5CCeqWew5g"
  },
  {
    title: "Understanding Burnout",
    description: "Identify burnout symptoms and learn how to recover from them.",
    videoUrl: "https://www.youtube.com/embed/nnwkX6u9tFo?si=L3bAkB3yB_dG3Rlw"
  }
];

const excludedTags = ['beginner', 'intermediate', 'advanced']

const colorArr= {
  'beginner': 'bg-green-200 w-18 text-green-700',
  'intermediate': 'bg-yellow-200 w-24 text-yellow-700',
  'advanced': 'bg-red-200 w-19 text-red-800'
}

const allTags = Array.from(
  new Set(exerciseList.flatMap((exercise) => exercise.tags?.filter((tag) => !excludedTags.includes(tag)) || []))
);


const ExercisesResourcesPage = () => {
  const [User, setUser] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);


  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,  
        }}
      );
      
        setUser(response.data);  
        } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

  }, [User]);
  

  const HandleLogout=()=>{
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col bg-white text-gray-800 w-screen">
      <Header />
      

      
    

      <main className="flex-grow md:py-15">
        <div className="min-w-screen bg-purple-50 md:h-50 ml-0 py-10 mb-10">
        <h1 className="text-5xl font-bold text-black-700 mb-6">Exercises & Resources</h1>
        <p className="text-gray-500 text-xl px-15 md:px-0">Discover tools and techniques to support your mental well-being journey</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-center my-10">
            <button className={`px-4 py-1 rounded-full border text-sm font-medium ${selectedTag === null? "bg-purple-800 text-white": "bg-white text-gray-900 border-gray-400"}`}
              onClick={() => setSelectedTag(null)}>
             All
            </button>
            {allTags.map((tag, index) => (
              <button key={index} className={`px-4 py-1 rounded-full border font-medium ${   selectedTag === tag ? "bg-purple-800 text-white" : "bg-white text-gray-900 border-gray-400" }`}
                onClick={() => setSelectedTag(tag)}>
                {tag}
              </button>
            ))}
          </div>


          
        <section className="mb-12 bg-purple-50 py-10">
          <h2 className="text-3xl font-bold text-gray-700 mb-8">Guided Exercises</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:px-40">
            { exerciseList.filter((exercise) =>
                  selectedTag ? exercise.tags.includes(selectedTag) : true
                ).map((exercise, index) => (
              <div key={index} className="bg-white border border-gray-300 rounded-2xl p-6 hover:shadow-lg transition">
                {exercise.tags.map((tag)=>{ return excludedTags.includes(tag)? (<p key = {tag} className={`flex  text-[12px] items-start mb-2 px-2 py-1 rounded-full justify-center ${colorArr[tag]}`}>{tag}</p>): null
                })}
                <h3 className="flex items-start text-xl font-semibold text-gray-800 mb-2 ">{exercise.title}</h3>
                <p className="text-gray-600 flex items-start text-left">{exercise.description}</p>
                <audio controls className="mt-5">
                  <source src={exercise.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </section>

        <section className="md:px-30">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Educational & Soothing Videos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video, index) => (
              <div key={index} className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
                <div className="mb-4">
                <iframe
                  className="w-full h-48 rounded-xl"
                  src={video.videoUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-start">{video.title}</h3>
                <p className="text-gray-600 text-left">{video.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    <Footer/>
    </div>
  );
};

export default ExercisesResourcesPage;
