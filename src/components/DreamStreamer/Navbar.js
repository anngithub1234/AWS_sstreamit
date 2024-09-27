// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = ({ signOut, viewPurchasedAlbums }) => {
  const navigate = useNavigate();

 

  return (
    <header className="fixed top-0 left-0 right-0 shadow-md z-10 flex items-center justify-between p-4 bg-white">
      <Link to="/">
        <h1 className="text-2xl font-bold text-hot-pink" >DreamStreamer</h1>
      </Link>
    
      <div className="flex items-center">
 
<div >
      {/* Search Bar */}

        <input
          type="text"
          placeholder="search albums..."
         
          className="px-20 py-2  rounded-full bg-pale-pink text-hot-pink placeholder-hot-pink focus:outline-none"
        />
        </div>
      
        <div className='flex items-center px-2 py-2 rounded-full bg-pale-pink ml-4'>
        {/* Text Links */}
        
        <FaShoppingBag
          onClick={viewPurchasedAlbums}
          className="text-hot-pink hover:text-dark-pink font-bold cursor-pointer hover:underline transition duration-200"
        />
        <FaSignOutAlt
          onClick={signOut}
          className="text-hot-pink hover:text-dark-pink font-bold cursor-pointer hover:underline transition duration-200 ml-4"
        />
        </div>
        <div className='flex items-center px-2 py-2 rounded-full bg-pale-pink ml-4'>
        <FaUser
          className="text-hot-pink hover:text-dark-pink font-bold cursor-pointer hover:underline transition duration-200"
        /></div>
        
      </div>
    </header>
  );
};

export default Navbar;
