import { Link } from "react-router-dom";
import React from 'react'
import { FaHome, FaListUl, FaMusic, FaFolderOpen } from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <aside className="w-64 fixed top-20 fixed bg-black p-4 h-screen rounded-tr-xl">
      <div className=''>
      {/*<Link to="/dashboard">*/}
      <Link to= "/" >
        <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaHome className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink font-semibold text-lg">Dashboard</span>
        </div>
        </Link>
      
        <Link to= "/songslib" >
       <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaFolderOpen className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink font-semibold  text-lg">Songs Library </span>
      </div>
      </Link>

      <Link to= "/" >
      <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaMusic className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink font-semibold text-lg">Artists</span>
      </div>
      </Link>

      <Link to= "/" >
      <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200 ">
        <FaListUl className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink font-semibold text-lg">Streamers</span>
      </div>
        </Link>
        
      </div>

    </aside>
  );
};

export default AdminSidebar