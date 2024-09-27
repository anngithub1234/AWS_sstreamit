import React, { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Pencil, Trash2, Music, Calendar, Users, XIcon, X } from "lucide-react";
import { Link } from "react-router-dom";

function SongsLib({ signOut }) {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumDetails, setAlbumDetails] = useState({
    albumName: "",
    albumYear: "",
    genre: "",
    artists: "",
    bandComposition: "",
    trackLabels: "",
  });
  const [stats, setStats] = useState({ totalAlbums: 0, totalTracks: 0 });
  const [files, setFiles] = useState({ albumArt: null, tracks: [] });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [filesToRemove, setFilesToRemove] = useState({
    albumArt: false,
    tracks: [],
  });

  const [selectedFiles, setSelectedFiles] = useState({
    albumArt: null,
    tracks: [],
  });

  useEffect(() => {
    setSelectedFiles({
      albumArt: null,
      tracks: [],
    });
    setFilesToRemove({
      albumArt: false,
      tracks: [],
    });
  }, [albumDetails]);

  const handleFileSelection = (event, fileType) => {
    const files = event.target.files;
    if (fileType === "albumArt") {
      setSelectedFiles((prev) => ({ ...prev, albumArt: files[0] }));
    } else if (fileType === "tracks") {
      setSelectedFiles((prev) => ({
        ...prev,
        tracks: [...prev.tracks, ...files],
      }));
    }
    handleFileChange(event);
  };

  const handleRemoveFile = (fileType, index) => {
    if (fileType === "albumArt") {
      setFilesToRemove((prev) => ({ ...prev, albumArt: true }));
      setSelectedFiles((prev) => ({ ...prev, albumArt: null }));
    } else if (fileType === "tracks") {
      setFilesToRemove((prev) => ({
        ...prev,
        tracks: [...prev.tracks, index],
      }));
    }
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get(
          "https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/albums"
        );
        setAlbums(response.data.albums);

        // Calculate stats
        const totalTracks = response.data.albums.reduce(
          (acc, album) => acc + album.tracks.length,
          0
        );
        setStats({ totalAlbums: response.data.albums.length, totalTracks });
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };
    fetchAlbums();
  }, []);

  const handleUpdateSelectedAlbum = () => {
    // setIsEditing(true);
    setIsEditModalOpen(true);
  };

  const handleDeleteSelectedAlbum = (album) => {
    setSelectedAlbum(album);
    if (album) {
      handleDeleteAlbum(album.albumId);
      setSelectedAlbum(null);
    }
    // Clear the selected album after deletion
  };

  
  const handleDeleteAlbum = async (albumId) => {
    console.log("hello");
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this album?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/albums/${albumId}`
      );
      alert("Album deleted successfully");
      setAlbums(albums.filter((album) => album.albumId !== albumId)); // Remove the deleted album from state
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Failed to delete album");
    }
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setAlbumDetails(album);
   
  };

  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAlbumDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === "albumArt") {
      setFiles((prev) => ({ ...prev, albumArt: files[0] }));
    } else if (name === "tracks") {
      setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
    }
  };

  const handleUpdateAlbum = async (event) => {
    event.preventDefault()
    
    if (!selectedAlbum) {
      alert("No album selected for update.");
      return;
    }

    try {
      setUploadStatus("Updating...")
      // Step 1: Upload new album art to S3 if a new file is selected
      let albumArtUrl = selectedAlbum.albumArtUrl; // Keep existing URL if no new file is selected
      if (files.albumArt) {
        const albumArtResponse = await axios.post(
          "https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/generating-s3-link",
          {
            fileName: files.albumArt.name,
            fileType: files.albumArt.type,
          }
        );
        const { uploadUrl } = albumArtResponse.data;
        await axios.put(uploadUrl, files.albumArt, {
          headers: { "Content-Type": files.albumArt.type },
        });
        albumArtUrl = uploadUrl.split("?")[0]; // Use the new URL
      }

      // Step 2: Upload new tracks to S3 if new files are selected
      let updatedTracks = selectedAlbum.tracks; // Keep existing tracks if no new files are selected
      if (files.tracks && files.tracks.length > 0) {
        const trackUrls = [];
        for (const track of files.tracks) {
          const trackResponse = await axios.post(
            "https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/generating-s3-link",
            {
              fileName: track.name,
              fileType: track.type,
            }
          );
          const { uploadUrl: trackUploadUrl } = trackResponse.data;
          await axios.put(trackUploadUrl, track, {
            headers: { "Content-Type": track.type },
          });
          trackUrls.push({
            trackName: track.name,
            trackUrl: trackUploadUrl.split("?")[0], // Use the new URL
            trackLabel: "Sony Music", // Example label, replace as necessary
          });
        }
        updatedTracks = trackUrls; // Use the newly uploaded tracks
      }

      // Step 3: Ensure artists is always a string before splitting
      const updatedArtists = Array.isArray(albumDetails.artists)
        ? albumDetails.artists
        : albumDetails.artists.split(",").map((artist) => artist.trim());

      // Step 4: Prepare the updated album metadata
      const updatedAlbum = {
        ...albumDetails,
        artists: updatedArtists,
        albumYear: parseInt(albumDetails.albumYear),
        albumArtUrl: albumArtUrl, // Use the new or existing album art URL
        tracks: updatedTracks, // Use the new or existing tracks
      };

      // Step 5: Send updated data to the backend (DynamoDB)
      const response = await axios.put(
        `https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/albums/${selectedAlbum.albumId}`,
        updatedAlbum
      );

      // Check if response status indicates success
      if (response.status === 200 || response.status === 204) {
        setUploadStatus("Updated successfully!");
        alert("Album updated successfully!");
        setAlbums(
          albums.map((album) =>
            album.albumId === selectedAlbum.albumId ? updatedAlbum : album
          )
        ); // Update album list with updated album

        // Refresh the page after successful update
        // window.location.reload();
        setIsEditModalOpen(false); 
      } else {
        throw new Error("Failed to update album");
      }
    } catch (error) {
      setUploadStatus("Failed to update album");
      console.error("Error updating album:", error);
      alert("Failed to update album");
    }
  };


  return (
    <div>
      <div>
      <AdminNavbar signOut={signOut} />
      </div>
      <div>
      <AdminSidebar />

     
        {/* <h2>Albums</h2>
        
        <p>Total Albums: {stats.totalAlbums}</p>
        <p>Total Tracks: {stats.totalTracks}</p>
        <div className="albums-container">
          {displayAlbums()}
        </div> */}

        <div className="ml-64 p-8">
          {" "}
          {/* Adjust margin-left based on your sidebar width */}
          <div className="mt-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Music Library
          </h1>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-100 rounded-lg p-4">
                <p className="text-purple-800 font-medium">Total Albums</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalAlbums}
                </p>
              </div>
              <div className="bg-pink-100 rounded-lg p-4">
                <p className="text-pink-800 font-medium">Total Tracks</p>
                <p className="text-3xl font-bold text-pink-600">
                  {stats.totalTracks}
                </p>
              </div>
            </div>
          </div>
          <Link to='/AddAlbum'>
          <button className="bg-pink-300 mb-2 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">+ Add Album</button>
          </Link>
          <AlbumTable
            albums={albums}
            handleUpdateSelectedAlbum={handleUpdateSelectedAlbum}
            handleAlbumClick={handleAlbumClick}
            handleDeleteSelectedAlbum={handleDeleteSelectedAlbum}
            // onEdit={handleEdit} onDelete={handleDelete}
          />
          {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-100">
                  Edit Album
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <form>
                <div className="mb-4">
                  <label
                    htmlFor="albumName"
                    className="block text-gray-300 mb-2"
                  >
                    Album Name
                  </label>
                  <input
                    type="text"
                    id="albumName"
                    name="albumName"
                    value={albumDetails.albumName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="genre" className="block text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    onChange={handleInputChange}
                    value={albumDetails.genre}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="albumYear"
                    className="block text-gray-300 mb-2"
                  >
                    Album year
                  </label>
                  <input
                    type="number"
                    id="albumYear"
                    name="albumYear"
                    onChange={handleInputChange}
                    value={albumDetails.albumYear}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="artists" className="block text-gray-300 mb-2">
                    artists
                  </label>
                  <input
                    type="text"
                    name="artists"
                    className="w-full bg-gray-700 text-white p-2 rounded"
                    onChange={handleInputChange}
                    value={albumDetails.artists}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="artists" className="block text-gray-300 mb-2">
                    Band Composition
                  </label>
                  <input
                    type="text"
                    name="bandComposition"
                    className="w-full bg-gray-700 text-white p-2 rounded"
                    onChange={handleInputChange}
                    value={albumDetails.bandComposition}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="albumArt"
                    className="block text-gray-300 mb-2"
                  >
                    album image
                  </label>
                  {albumDetails.albumArtUrl && !filesToRemove.albumArt ? (
                <div className="flex items-center mb-2">
                  <img src={albumDetails.albumArtUrl} alt="Album Art" className="w-16 h-16 object-cover mr-2" />
                <button type="button" onClick={() => handleRemoveFile('albumArt')} className="text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
               ) : (
                <input
                    type="file"
                    name="albumArt"
                    accept="image/*"
                    className="p-2 bg-gray-800 rounded"
                    onChange={handleFileChange}
                    // value={albumDetails.albumArt}
                  />
                )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="playCount"
                    className="block text-gray-300 mb-2"
                  >
                    album tracks
                  </label>
                  <input
                    type="file"
                    name="tracks"
                    accept="audio/*"
                    multiple
                    className="p-2 bg-gray-800 rounded"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                   type="submit"
                    onClick={handleUpdateAlbum}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
                 <h4 className="font-bold">
                  {uploadStatus && <p>{uploadStatus}</p>}
                  </h4> 
              </form>
            </div>
          </div>
        )}
        </div>
       
      </div>
    </div>
  );
}

const AlbumTable = ({ albums,handleUpdateSelectedAlbum,handleAlbumClick,handleDeleteSelectedAlbum }) =>
  
  {
    return (
      <div className="overflow-x-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gradient-to-r from-purple-400 to-pink-400 text-white">
            <tr>
              <th scope="col" className="px-6 py-3 rounded-tl-lg">
                Album
              </th>
              <th scope="col" className="px-6 py-3">
                Year
              </th>
              <th scope="col" className="px-6 py-3">
                Genre
              </th>
              <th scope="col" className="px-6 py-3">
                Artists
              </th>
              <th scope="col" className="px-6 py-3 rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album, index) => (
              <tr
                key={album.albumId}
                className={`${
                  index % 2 === 0 ? "bg-white/50" : "bg-purple-50/50"
                } border-b border-purple-200 hover:bg-purple-100 transition duration-200`}
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-3">
                  <img
                    src={album.albumArtUrl}
                    alt={album.albumName}
                    className="w-12 h-12 rounded-full shadow-md"
                  />
                  <span>{album.albumName}</span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <Calendar size={16} className="text-purple-500" />
                  <span>{album.albumYear}</span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <Music size={16} className="text-pink-500" />
                  <span>{album.genre}</span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <Users size={16} className="text-indigo-500" />
                  <span>{album.artists}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2"   onClick={() => {handleAlbumClick(album)}}>
                    <button
                      onClick={handleUpdateSelectedAlbum}
                      className="text-blue-600 hover:text-blue-900 transition duration-200"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      // onClick={() => onDelete(album.albumId)}
                      className="text-red-600 hover:text-red-900 transition duration-200"
                    >
                      <Trash2 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleAlbumClick(album); 
                        handleDeleteSelectedAlbum(album);
                      }}
                      size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       
    );
  };

export default SongsLib;
