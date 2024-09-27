import React from 'react';
import { FaHome, FaListUl, FaMusic, FaFolderOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = ({ albums, handleAlbumClick, handlePurchase }) => {
  return (
    
        
    <aside className="w-64 fixed top-20 bg-pale-pink p-4 h-screen rounded-tr-xl">
      <div className=''>
   
        <Link to="/">
        <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaHome className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink text-lg">Home</span>
        </div>
        </Link>
       
       <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaFolderOpen className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink text-lg">My Library</span>
      </div>
      <div className="flex items-center mb-2 cursor-pointer hover:opacity-80 transition duration-200">
        <FaMusic className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink text-lg">My Favs</span>
      </div>
      <div className="flex items-center mb-2 ">
        <FaListUl className="text-hot-pink text-2xl m-4" />
        <span className="text-hot-pink text-lg">Recents</span>
      </div>
    
      </div>
    </aside>

  );
};

export default Sidebar;