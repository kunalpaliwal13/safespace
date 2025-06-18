import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [activeTab, setActiveTab] = useState("login");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      alert(res.data.message);
      // Optionally switch to login tab or clear form
      setActiveTab("login");
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex w-screen min-h-screen bg-white font-sans relative md:px-50">
      {/* Left Section */}
      <div className="w-1/2 p-16 md:flex flex-col justify-center bg-white hidden ">
        <h1 className="text-4xl font-bold mb-4 text-purple-800">
          Safe<span className="text-purple-950">Space.ai</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your AI companion for emotional wellbeing and mental health support
        </p>
        <img
          src="/images/tree.png"
          alt="Tree"
          className="h-80 w-full rounded-2xl object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 flex items-center justify-center relative px-4 bg-gradient-to-br bg-white">
        <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 z-10">
          <h2 className="text-2xl font-semibold text-center text-black mb-2">
            Welcome to <span className="text-purple-900">Safe</span>Space.ai
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Your journey to better mental wellbeing starts here
          </p>

          {/* Tabs */}
          <div className="flex bg-purple-100 rounded-full mb-6 h-12 py-1 px-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-2 rounded-full transition font-medium focus:outline-none ${
                activeTab === "login"
                  ? "bg-white text-purple-700"
                  : "text-purple-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`w-1/2 py-2 rounded-full transition font-medium focus:outline-none ${
                activeTab === "register"
                  ? "bg-white text-purple-700"
                  : "text-purple-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white hover:bg-purple-700 py-2 rounded-md transition"
              >
                Login
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <input
                type="phone"
                name="phone"
                placeholder="Phone No."
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white hover:bg-purple-700 py-2 rounded-md transition"
              >
                Register
              </button>
            </form>
          )}
        </div>

        {/* Background Layer */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/calm-bg.svg')] bg-cover bg-center opacity-20 z-0"></div>
      </div>
    </div>
  );
}
