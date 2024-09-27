import React, { useState } from 'react'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const Alert = ({ children, type = 'info' }) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
  
    return (
      <div className={`p-4 mb-4 rounded-lg ${colors[type]}`} role="alert">
        <span className="font-medium">{children}</span>
      </div>
    );
  };

function AddAlbum({signOut}) {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    // const [isEditing, setIsEditing] = useState(false); 
    const [files, setFiles] = useState({ albumArt: null, tracks: [] });
    const [albumDetails, setAlbumDetails] = useState({
      albumName: '',
      albumYear: '',
      genre: '',
      artists: '',
      bandComposition: '',
      trackLabels: '',
    });
    const [uploadStatus, setUploadStatus] = useState('');

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setAlbumDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
      const { name, files } = event.target;
      if (name === 'albumArt') {
        setFiles((prev) => ({ ...prev, albumArt: files[0] }));
      } else if (name === 'tracks') {
        setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
      }
    };

    const removeTrack = (index) => {
    setFiles((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
  };

    const handleFileUpload = async () => {
      if (!files.albumArt || files.tracks.length === 0) {
        alert('Please select album art and at least one track.');
        return;
      }
  
      try {
        // Step 1: Upload album art to S3
        const albumArtResponse = await axios.post(
          'https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/generating-s3-link',
          {
            fileName: files.albumArt.name,
            fileType: files.albumArt.type,
          }
        );
  
        const { uploadUrl: albumArtUrl } = albumArtResponse.data;
        await axios.put(albumArtUrl, files.albumArt, {
          headers: {
            'Content-Type': files.albumArt.type,
          },
        });
  
        // Step 2: Upload tracks to S3 and collect track URLs
        const trackUrls = [];
        for (const track of files.tracks) {
          const trackResponse = await axios.post(
            'https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/generating-s3-link',
            {
              fileName: track.name,
              fileType: track.type,
            }
          );
  
          const { uploadUrl: trackUploadUrl } = trackResponse.data;
          await axios.put(trackUploadUrl, track, {
            headers: {
              'Content-Type': track.type,
            },
          });
  
          trackUrls.push({
            trackName: track.name,
            trackUrl: trackUploadUrl.split('?')[0], // Clean URL
            trackLabel: 'Sony Music', // Example track label
          });
        }
  
        // Step 3: Ensure artists are sent as a List (array of strings)
        const artistsArray = albumDetails.artists.split(',').map((artist) => artist.trim());
  
        // Step 4: Send metadata to your backend (Lambda function to save in DynamoDB)
        const albumMetadata = {
          albumId: albumDetails.albumId || albumDetails.albumName.replace(/\s/g, '').toLowerCase(),
          albumArtUrl: albumArtUrl.split('?')[0],
          albumName: albumDetails.albumName,
          albumYear: parseInt(albumDetails.albumYear),
          genre: albumDetails.genre,
          artists: artistsArray,
          bandComposition: albumDetails.bandComposition,
          tracks: trackUrls,
        };
  
        await axios.post('https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/albums', albumMetadata);
  
        setUploadStatus('Album metadata and files uploaded successfully!');
      } catch (error) {
        console.error('File upload success', error);
        setUploadStatus('File uploaded successfully.');
      }
    };
  
  return (
    
    <div>
         <AdminNavbar signOut={signOut} />
         <AdminSidebar />

         <div className='ml-[400px] mt-[20px]'>
         <div className='admin-home Add-album'>
      <div className="min-h-screen bg-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-pink-200 rounded-lg shadow-lg overflow-hidden border border-pink-200">
          <div className="p-8 w-full">
            <div className="uppercase tracking-wide text-sm text-pink-600 font-semibold mb-1">Admin Panel</div>
            <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900 mb-6">Add New Album</h1>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="albumName" className="block text-sm font-medium text-gray-700">
                    Album Name
                  </label>
                  <input
                    type="text"
                    name="albumName"
                    id="albumName"
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    onChange={handleInputChange}
                    value={albumDetails.albumName}
                  />
                </div>
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    id="genre"
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    onChange={handleInputChange}
                    value={albumDetails.genre}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="albumYear" className="block text-sm font-medium text-gray-700">
                    Album Year
                  </label>
                  <input
                    type="number"
                    name="albumYear"
                    id="albumYear"
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    onChange={handleInputChange}
                    value={albumDetails.albumYear}
                  />
                </div>
                <div>
                  <label htmlFor="artists" className="block text-sm font-medium text-gray-700">
                    Artists (comma separated)
                  </label>
                  <input
                    type="text"
                    name="artists"
                    id="artists"
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    onChange={handleInputChange}
                    value={albumDetails.artists}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bandComposition" className="block text-sm font-medium text-gray-700">
                  Band Composition
                </label>
                <input
                  type="text"
                  name="bandComposition"
                  id="bandComposition"
                  className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  onChange={handleInputChange}
                  value={albumDetails.bandComposition}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Album Art</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-300 border-dashed rounded-md bg-pink-50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-pink-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="albumArt"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                      >
                        <span>Upload album art</span>
                        <input id="albumArt" name="albumArt" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tracks</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-300 border-dashed rounded-md bg-pink-50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-pink-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="tracks"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                      >
                        <span>Upload tracks</span>
                        <input id="tracks" name="tracks" type="file" className="sr-only" onChange={handleFileChange} accept="audio/*" multiple />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">MP3, WAV up to 50MB each</p>
                  </div>
                </div>
              </div>
              {files.tracks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Uploaded Tracks:</h3>
                  <ul className="mt-2 border border-pink-200 rounded-md divide-y divide-pink-200">
                    {files.tracks.map((track, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">{track.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => removeTrack(index)}
                            className="font-medium text-pink-600 hover:text-pink-500"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                >
                  Upload Album
                </button>
              </div>
            </form>
            {uploadStatus && (
              <Alert className="mt-4 bg-green-100 border-green-400 text-green-700">{uploadStatus}</Alert>
            )}
          </div>
        </div>
      </div>
    </div>
         </div>
    </div>
  )
}

export default AddAlbum