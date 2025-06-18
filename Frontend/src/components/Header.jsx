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

  }, [User, notifContent]);

    //user is admin? get data for admin
  useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/notifications', {
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
        window.location.href = "/login";
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
    <header className="sticky top-0 z-50 bg-white/20 md:flex justify-between items-center px-20 py-4 hidden mt-10 rounded-full backdrop-blur-2xl">
    <div className="flex w-full justify-around ">
        <div className="text-3xl font-bold text-purple-500 flex"> <RiMentalHealthLine className="text-purple-400"/>  Safe<span className="text-purple-500">Space.ai</span></div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium mr-4">

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


          <a href="/" className=" text-base text-gray-500 hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Home</a>
          <a href={User? "/journal": "/login"} className="text-gray-500 text-base hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Journal</a>
          <a href="/exercises" className="text-gray-500  text-base hover:text-purple-600 z-50" style = {{textDecoration: "none"}}>Exercises</a>
          {isHome ? (
          <ScrollLink to="contact" smooth={true} duration={500} offset={-70} className="text-gray-500 text-base hover:text-purple-600 cursor-pointer">Contact Us</ScrollLink>
          ) : ( <Link to="/#contact" className="text-gray-500 text-base hover:text-purple-600">Contact Us</Link>)}
          {
          User ? 
            <>
            <a className="text-gray-500 text-base hover:text-purple-600" style={{ textDecoration: "none" }} onClick={HandleLogout}>Logout</a>
            <span className= "text-purple-800 text-base  hover:text-purple-600" style = {{textDecoration: "none"}}> Hey {User.name} !</span> 
            </>
            :   
            <a href="/login" className="text-purple-800 text-base hover:text-purple-600" style={{ textDecoration: "none" }}>Login</a>
          }
        </nav>
        </div>
      </header>


      {/* -------------------------------------------------------------------------------------------------------------------- */}
      <div className="text-2xl bg-white border-0 font-bold block md:hidden text-purple-800">Safe<span className="text-purple-950">Space.ai</span></div>
        <div className="hidden md:flex space-x-6 text-sm font-medium mr-4">
        </div>
      <div className="flex bg-white justify-around text-sm md:hidden">
      
      <a href="/" className=" text-base text-gray-500 hover:text-purple-600" style = {{textDecoration: "none"}}>Home</a>
      {  User && User.role == "admin" ? (<div className="flex justify-center items-center">
            <div className= " w-100 flex flex-col items-center absolute " >
              <FaBell className= "text-xl text-gray-500 hover:text-purple-600 z-50 mr-10" onClick={showNotifs} />
              <div className= {`absolute z-40 w-80 rounded-2xl md:ml-0 ml-10 h-70 mt-8 bg-white border shadow-2xl border-gray-300 p-3 flex flex-col gap-2 overflow-y-auto ${notifs? 'visible' : 'hidden'}`} ref={notifRef}>
                
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
      <a href={User? "/journal": "/login"} className="text-gray-500 text-base hover:text-purple-600" style = {{textDecoration: "none"}}>Journal</a>
      <a href="exercises" className="text-gray-500  text-base hover:text-purple-600" style = {{textDecoration: "none"}}>Exercises</a>
      {
      User ? 
        
        <a className="text-gray-500 text-base hover:text-purple-600" style={{ textDecoration: "none" }} onClick={HandleLogout}>Logout</a>

        :   
        <a href="/login" className="text-purple-800 text-base hover:text-purple-600" style={{ textDecoration: "none" }}>Login</a>
      }
  </div>
  </>
)};


export default Header;