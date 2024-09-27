import { IniLoader } from 'aws-sdk';
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';

function ViewPurchasedAlbums() {
  const location = useLocation();
  const { albums } = location.state || {};

  // const [albums,setAlbums]=useState(purchasedAlbums);

  return (
    <div>
     {albums ? (
        <ul>
          {albums.map((album, index) => (
            <li key={index}>{album}</li>
          ))}
        </ul>
      ) : (
        <p>No purchased albums available</p>
      )}
    </div>
  )
}

export default ViewPurchasedAlbums