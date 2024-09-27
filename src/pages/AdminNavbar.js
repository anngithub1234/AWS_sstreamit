import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const AdminNavbar = ({ signOut }) => {
  const navigate = useNavigate();
   
  return (
   
  
    <header className="flex fixed w-full justify-between p-5 bg-gray-800">
         <Link to="/">
      <h1 className="text-2xl text-hot-pink font-bold">Admin Dashboard</h1>
      </Link>
      <div>
    {/* Search Bar */}

      <input
        type="text"
        placeholder="Search..."
       
        className="px-20 py-2 rounded-full bg-pale-pink text-hot-pink placeholder-hot-pink focus:outline-none"
      />
      </div>
      <FaSignOutAlt
        onClick={signOut}
        className="text-hot-pink hover:text-dark-pink font-bold cursor-pointer hover:underline transition duration-200 ml-6"
      />
      
    </header>

   
 
  );
};

export default AdminNavbar