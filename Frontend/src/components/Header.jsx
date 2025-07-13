import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { FaBell } from "react-icons/fa";
import { IoAlertCircleOutline } from "react-icons/io5";
import { Link as ScrollLink } from 'react-scroll';
import { Link, useLocation } from 'react-router-dom';
import { RiMentalHealthLine } from "react-icons/ri";

const Header=()=>{
    const [User, setUser] = useState(null);
    const [notifs, setNotifs]= useState(false);
    const [notifContent, setNotifContent] = useState([]);
    const location = useLocation();
    const isHome = location.pathname === '/';

    //fetch users
  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('https://priv-safespace.onrender.com/api/user', {
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

  }, [User, notifContent]);

    //user is admin? get data for admin
  useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('https://priv-safespace.onrender.com/api/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifContent(res.data);
        } catch (err) {
          console.error('Failed to load notifications:', err);
        }
      };
    
      if (User?.role === 'admin') {
        fetchNotifications();
      }
    }, [User]);

    const showNotifs=()=>{
        notifs? setNotifs(false) : setNotifs(true);
    }
    const notifRef = useRef(null);

    const HandleLogout=()=>{
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      // siwtch off notifications
    useEffect(() => {
        function handleClickOutside(event) {
          if (notifRef.current && !notifRef.current.contains(event.target)) {
            setNotifs(false); 
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

    return (
      <>
    <header className="sticky top-0 z-50 md:bg-white bg-white/80 backdrop-blur-2xl lg:bg-white md:flex m-0 justify-between items-center lg:px-20 md:px-10 md:py-5 px-[2%] py-4  md:mt-10 lg:mt-10  md:shadow-md lg:border-none md:border-none border-b-2 lg:shadow-md md:rounded-3xl lg:rounded-3xl shadow-purple-300 ">
    <div className="flex lg:w-full md:w-full justify-around md:gap-10 lg:gap-10">
        <div className="text-3xl font-bold text-purple-500 lg:flex md:flex hidden"> <RiMentalHealthLine className="text-purple-400"/>  Safe<span className="text-purple-500">Space.ai</span></div>
        <nav className="lg:flex md:flex lg:space-x-6  text-sm justify-center lg:gap-10 md:gap-5 gap-[10%] flex items-center font-medium mr-4 ">

          {  User && User.role == "admin" ? (<div className="flex justify-center items-center">
            <div className= " w-100 flex flex-col items-center absolute " >
              <FaBell className= "text-xl text-gray-500 hover:text-purple-600 z-50 mr-10" onClick={showNotifs} />
              <div className= {`absolute z-40 w-80 rounded-2xl h-70 mt-8 bg-white border shadow-2xl border-gray-300 p-3 flex flex-col gap-2 overflow-y-auto ${notifs? 'visible' : 'hidden'}`} ref={notifRef}>
                
             {notifContent.slice().reverse().map((notif, index) => {
                let parsedNotif;
              try {
                parsedNotif = JSON.parse(notif.replace(/'/g, '"'));
              } catch (e) {
                console.error('Failed to parse notif:', notif, e);
                return null;
              }

                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg w-[100%] min-h-20 gap-0 shrink-0 flex text-left text-gray-500 p-2">
                      <IoAlertCircleOutline className="w-8 h-8 text-red-500 shrink-0" />
                      <div className="ml-3">
                        <div>
                        <div className="m-0 text-red-500">User {parsedNotif.name} might need help.</div>
                        </div>
                        Contact them urgently at <a className="text-green-600 underline" href={`tel:${parsedNotif.phone}`}>{parsedNotif.phone}</a> or <a className= "text-blue-600 underline" href = {`mailto:${parsedNotif.email}`}>{parsedNotif.email}</a>
                        <div className="text-gray-500 text-[10px] mt-2 "> {new Date(parsedNotif.time).toLocaleString()}</div>
                      </div>
                    </div>
                    );
              })}
              </div>
            </div>
          </div>): null}


          <a href="/" className=" lg:text-base md:text-base text-sm text-gray-500 hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Home</a>
          <a href={User? "/": "/"} className="text-gray-500 text-base hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Journal</a>
          <a href="/exercises" className="text-gray-500  text-base hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Exercises</a>

          {
          User ? 
            <>
            <a className="text-gray-500 text-base hover:text-purple-600" style={{ textDecoration: "none" }} onClick={HandleLogout}>Logout</a>
            <span className= "text-purple-800 text-base lg:flex md:flex hidden hover:text-purple-600 w-20" style = {{textDecoration: "none"}}> Hey {User.name} !</span> 
            </>
            :   
            <a href="/login" className="text-purple-800 text-base hover:text-purple-600" style={{ textDecoration: "none" }}>Login</a>
          }
        </nav>
        </div>
      </header>


      
  </>
)};


export default Header;