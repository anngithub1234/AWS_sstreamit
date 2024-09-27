import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp,FaShoppingCart } from 'react-icons/fa';
import { Link ,useNavigate} from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


const DreamStreamer = ({ signOut }) => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [volume, setVolume] = useState(1); // Volume (0.0 - 1.0)
  const [progress, setProgress] = useState(0); // Track progress (0 - 100)
  const [shuffle, setShuffle] = useState(false); // Shuffle mode
  const [repeat, setRepeat] = useState(false); // Repeat mode
  const [purchasedAlbums, setPurchasedAlbums] = useState([]);
  const navigate = useNavigate(); // Hook for navigation


  
  // Fetch all albums on load
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/albums');
        setAlbums(response.data.albums);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();

    // Retrieve purchased albums from localStorage
    const storedPurchasedAlbums = localStorage.getItem('purchasedAlbums');
    if (storedPurchasedAlbums) {
      setPurchasedAlbums(JSON.parse(storedPurchasedAlbums));
    }
  }, []);

  // Function to handle purchasing an album
const handlePurchase = (album) => {
  // Check if the album is already purchased
  const isPurchased = purchasedAlbums.some(purchasedAlbum => purchasedAlbum.albumId === album.albumId);

  if (isPurchased) {
    alert(`You have already purchased ${album.albumName}!`);
    return; // Exit the function if already purchased
  }

  // If not purchased, proceed with the purchase
  alert(`You have purchased ${album.albumName}!`);

  // Simulate a purchase by adding the album to purchased albums
  const newPurchasedAlbums = [...purchasedAlbums, album];
  setPurchasedAlbums(newPurchasedAlbums);

  // Store purchased albums in localStorage for persistence
  localStorage.setItem('purchasedAlbums', JSON.stringify(newPurchasedAlbums));
};

  // Function to view purchased albums (navigates to a different page)
  const viewPurchasedAlbums = () => {
    if (purchasedAlbums.length === 0) {
      alert("You haven't purchased any albums.");
      navigate('/'); // Redirect to the home page
      return;
    }

    // For simplicity, you can navigate to a different view here
    // Or simply set a flag to display purchased albums
    setAlbums(purchasedAlbums);
    setSelectedAlbum(null); // Clear any selected album
  };

  const playTrack = async (trackUrl, index, albumId, trackName) => {
    if (audio) {
      audio.pause();
    }
  
    const newAudio = new Audio(trackUrl);
    newAudio.volume = volume; // Set the initial volume
    newAudio.play();
    setAudio(newAudio);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  
    // Update progress
    newAudio.addEventListener('timeupdate', () => {
      setProgress((newAudio.currentTime / newAudio.duration) * 100);
    });
  
    // Track ended handling
    newAudio.addEventListener('ended', () => {
      if (repeat) {
        playTrack(trackUrl, index, albumId, trackName); // Replay the current track
      } else if (shuffle) {
        playRandomTrack();
      } else {
        playNextTrack(); // Go to the next track
      }
    });
  
    // Call API to update play count
    try {
      await axios.post('https://uzzpkl8bah.execute-api.ap-south-1.amazonaws.com/development/track-play-count', {
        albumId,
        trackName,
      });
      console.log('Track play recorded successfully');
    } catch (error) {
      console.error('Error recording track play:', error);
    }
  };
  

  // Function to toggle play/pause
  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Play the next track
  const playNextTrack = () => {
    if (selectedAlbum) {
      if (shuffle) {
        playRandomTrack();
      } else if (currentTrackIndex < selectedAlbum.tracks.length - 1) {
        playTrack(selectedAlbum.tracks[currentTrackIndex + 1].trackUrl, currentTrackIndex + 1);
      } else {
        setIsPlaying(false); // Stop playing when the last track finishes
      }
    }
  };

  // Play the previous track
  const playPreviousTrack = () => {
    if (selectedAlbum && currentTrackIndex > 0) {
      playTrack(selectedAlbum.tracks[currentTrackIndex - 1].trackUrl, currentTrackIndex - 1);
    }
  };

  // Play a random track for shuffle mode
  const playRandomTrack = () => {
    if (selectedAlbum) {
      const randomIndex = Math.floor(Math.random() * selectedAlbum.tracks.length);
      playTrack(selectedAlbum.tracks[randomIndex].trackUrl, randomIndex);
    }
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  // Track progress control
  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (audio) {
      audio.currentTime = (newProgress / 100) * audio.duration;
    }
  };

  // Toggle shuffle mode
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Toggle repeat mode
  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  // Select an album and show its tracks
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setCurrentTrackIndex(0); // Reset to the first track when an album is selected
  };

  if (!albums.length) return <p>Loading albums...</p>;

  return (
    <div className="w-full h-screen bg-white text-white flex flex-col ">
      {/* Navbar */}
      <Navbar signOut={signOut} viewPurchasedAlbums={viewPurchasedAlbums} />

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Album List */}
        <Sidebar albums={albums} handleAlbumClick={handleAlbumClick} handlePurchase={handlePurchase} />
        {/* Main Content Area - Show Tracks after an Album is Selected */}
        <div className='ml-64 p-8 mt-20'>
        {selectedAlbum ? " " : <section className='album-gird '>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Music Library
          </h1>
      <ul className="flex gap-6 flex-wrap">
        {albums.map((album) => (
          <li key={album.albumId} className="cursor-pointer">
            <img
              src={album.albumArtUrl}
              alt={album.albumName}
              className="w-[200px] h-[200px] rounded-lg hover:opacity-80 transition duration-200"
              onClick={() => handleAlbumClick(album)}
            />
            <div className='bg-light-pink  p-4 flex justify-between items-center'>
        <div className="flex flex-col">
          <p className="text-center text-charcoal">{album.albumName}</p>
          <p className="text-center text-charcoal">{album.albumYear}</p>
        </div>
        <button
          onClick={() => handlePurchase(album)}
          className="mt-2 py-4 px-4 bg-hot-pink text-white rounded-full hover:bg-dark-pink transition duration-200 flex items-center justify-center"
        >
          <FaShoppingCart />
        </button>
      </div>
    
            
            
          </li>
        ))}
      </ul>
        </section>}
        <main className="flex-grow ">
         

       
          {selectedAlbum && (
            <>
              {/* Album Info */}
              <section className=""> 
              <button className='mb-4 text-charcoal' onClick={ ()=>{setSelectedAlbum(null)}}>back</button>
                <div className="flex items-center">
                  <img
                    src={selectedAlbum.albumArtUrl}
                    alt="Album Art"
                    className="w-40 h-40 rounded-lg mr-6"
                  />
                  <div>
                    <h2 className="text-2xl text-black font-bold">{selectedAlbum.albumName}</h2>
                    <p className="text-charcoal">Artists: {selectedAlbum.artists.join(', ')}</p>
                    <p className="text-charcoal">Band Composition: {selectedAlbum.bandComposition}</p>
                    <p className="text-charcoal">Album Year: {selectedAlbum.albumYear}</p>
                  </div>
                </div>
              </section>

              {/* Track List */}
              <section>
                <h3 className="text-lg text-black font-bold mb-4">Tracks</h3>
                <ul className="space-y-2">
                {selectedAlbum.tracks.map((track, index) => (
                  <li
                    key={index}
                    className={`bg-deep-pink p-3 rounded-lg hover:bg-dark-pink transition duration-200 cursor-pointer ${index === currentTrackIndex ? 'bg-dark-pink' : ''}`}
                    onClick={() => playTrack(track.trackUrl, index, selectedAlbum.albumId, track.trackName)}
                  >
                    <p className="font-semibold">{track.trackName}</p>
                    <p className="text-charcoal">Label: {track.trackLabel}</p>
                  </li>
                ))}
              </ul>

              </section>
            </>
          )}
          
        </main>
      </div>
      </div>

      {/* Music Player */}
      {selectedAlbum && (
        <footer className="bg-hot-pink p-4 fixed bottom-0 w-full">
          <div className="flex items-center justify-between">
            {/* Album Art and Track Info */}
            <div className="flex items-center">
              <img
                src={selectedAlbum.albumArtUrl}
                alt="Album Art"
                className="w-12 h-12 rounded-lg mr-4"
              />
              <div>
                <p className="text-sm font-semibold">{selectedAlbum.tracks[currentTrackIndex].trackName}</p>
                <p className="text-xs font-semibold text-charcoal">Artists: {selectedAlbum.artists.join(', ')}</p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 bg-dark-pink rounded-full hover:bg-maroon transition duration-200"
                onClick={playPreviousTrack}
              >
                <FaStepBackward className="text-white" />
              </button>
              <button
                className="p-2 bg-dark-pink rounded-full hover:bg-maroon transition duration-200"
                onClick={togglePlayPause}
              >
                {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
              </button>
              <button
                className="p-2 bg-dark-pink rounded-full hover:bg-maroon transition duration-200"
                onClick={playNextTrack}
              >
                <FaStepForward className="text-white" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <FaVolumeUp className="text-white" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-24"
              />
            </div>

            {/* Track Progress Slider */}
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-64"
              />
            </div>

            {/* Shuffle and Repeat Controls */}
            <div className="flex items-center space-x-4">
              <button
                className={`p-2 bg-dark-pink rounded-full hover:bg-maroon transition duration-200 ${shuffle ? 'bg-blue-500' : ''}`}
                onClick={toggleShuffle}
              >
                <FaRandom className="text-white" />
              </button>
              <button
                className={`p-2 bg-dark-pink rounded-full hover:bg-maroon transition duration-200 ${repeat ? 'bg-blue-500' : ''}`}
                onClick={toggleRepeat}
              >
                <FaRedo className="text-white" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default DreamStreamer;