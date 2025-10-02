const API_KEY = 'AIzaSyCQqvQhNs-lX7KoUCErol_05C5pM15YCRQ';
const SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
let isDescriptionVisible = true;
let isCommentVisible = false;

function searchVideos(category = '') {
  const searchInput = document.getElementById('searchInput').value;
  const videoWrapper = document.getElementById('videoWrapper');
  const videoSection = document.querySelector('.video-section');
  const welcomeMessage = document.getElementById('welcomeMessage');
  
  // Hide video wrapper and section when searching
  videoWrapper.classList.remove('show');
  videoSection.classList.add('no-video');
  
  // Hide welcome message when searching
  welcomeMessage.classList.add('hidden');
  
  document.getElementById('videoPlayer').src = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('videoTitle').innerText = ''; // Clear video title
  document.getElementById('descriptionContainer').style.display = 'none'; // Hide description container
  document.getElementById('relatedVideos').innerHTML = ''; // Clear related videos

  let query = searchInput;
  if (category && category !== 'all') {
    query = category; // Override the search query if a category is selected
  }

  // Make API request to search for videos
  fetch(`${SEARCH_ENDPOINT}?part=snippet&maxResults=10&q=${query}&type=video&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        // Display search results
        const resultsContainer = document.getElementById('searchResults');
        data.items.forEach(item => {
          const videoId = item.id.videoId;
          const title = item.snippet.title;

          // Create result item
          const resultItem = document.createElement('div');
          resultItem.classList.add('result-item');
          resultItem.innerHTML = `
            <img src="${item.snippet.thumbnails.medium.url}" alt="Thumbnail">
            <p>${title}</p>
          `;
          resultItem.addEventListener('click', () => playVideo(videoId));
          resultsContainer.appendChild(resultItem);
        });
      } else {
        alert('No videos found.');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('An error occurred while fetching data.');
    });
}


function playVideo(videoId) {
  const videoUrl = `https://www.youtube.com/embed/${videoId}`;
  const videoWrapper = document.getElementById('videoWrapper');
  const videoSection = document.querySelector('.video-section');
  
  // Show the video wrapper and section when a video is selected
  videoWrapper.classList.add('show');
  videoSection.classList.remove('no-video');
  
  document.getElementById('videoPlayer').src = videoUrl;
  updateVideoTitle(videoId); // Update the video title
  updateDescription(videoId); // Update the video description
  loadRelatedVideos(videoId); // Load related videos in sidebar

  if (videoSection) {
    videoSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
}


function updateVideoTitle(selectedVideoId) {
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${selectedVideoId}&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        const title = data.items[0].snippet.title;
        document.getElementById('videoTitle').innerText = title; // Set the video title
      } else {
        document.getElementById('videoTitle').innerText = ''; // Clear video title if no data found
      }
    })
    .catch(error => {
      console.error('Error fetching video details:', error);
      alert('An error occurred while fetching video details.');
    });
}




function updateDescription(selectedVideoId) {
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${selectedVideoId}&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        const description = data.items[0].snippet.description;
        const descriptionElement = document.getElementById('videoDescription');
        const descriptionContainer = document.getElementById('descriptionContainer');
        
        if (description && description.trim()) {
          // Truncate description to first 300 characters for better display
          const truncatedDescription = description.length > 300 
            ? description.substring(0, 300) + '...' 
            : description;
          descriptionElement.textContent = truncatedDescription;
          descriptionContainer.style.display = 'block';
        } else {
          descriptionElement.textContent = 'No description available.';
          descriptionContainer.style.display = 'block';
        }
      }
    })
    .catch(error => {
      console.error('Error fetching video details:', error);
      const descriptionElement = document.getElementById('videoDescription');
      descriptionElement.textContent = 'Error loading description.';
    });
}




function toggleDarkMode() {
  const body = document.body;
  const darkModeIcon = document.getElementById('darkModeIcon');
  body.classList.toggle("dark-mode");
  darkModeIcon.innerText = body.classList.contains("dark-mode") ? 'light_mode' : 'dark_mode';
}




// Function to load related videos in sidebar
function loadRelatedVideos(videoId) {
  // Get video details to extract tags/category for better related video search
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        const videoTags = data.items[0].snippet.tags;
        const videoTitle = data.items[0].snippet.title;
        
        // Use tags or title keywords to search for related videos
        let searchQuery = '';
        if (videoTags && videoTags.length > 0) {
          searchQuery = videoTags.slice(0, 3).join(' ');
        } else {
          // Extract first few words from title as search query
          searchQuery = videoTitle.split(' ').slice(0, 3).join(' ');
        }
        
        // Search for related videos
        fetch(`${SEARCH_ENDPOINT}?part=snippet&maxResults=8&q=${encodeURIComponent(searchQuery)}&type=video&key=${API_KEY}`)
          .then(response => response.json())
          .then(relatedData => {
            displayRelatedVideos(relatedData.items.filter(item => item.id.videoId !== videoId));
          })
          .catch(error => {
            console.error('Error fetching related videos:', error);
          });
      }
    })
    .catch(error => {
      console.error('Error fetching video details for related search:', error);
    });
}

// Function to display related videos in sidebar
function displayRelatedVideos(videos) {
  const relatedVideosContainer = document.getElementById('relatedVideos');
  relatedVideosContainer.innerHTML = '';
  
  videos.slice(0, 6).forEach(video => {
    const videoItem = document.createElement('div');
    videoItem.classList.add('related-video-item');
    videoItem.innerHTML = `
      <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" class="related-video-thumbnail">
      <div class="related-video-info">
        <p class="related-video-title">${video.snippet.title}</p>
        <p class="related-video-channel">${video.snippet.channelTitle}</p>
      </div>
    `;
    
    videoItem.addEventListener('click', () => {
      playVideo(video.id.videoId);
    });
    
    relatedVideosContainer.appendChild(videoItem);
  });
}

//adding search functionality by pressing enter key
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const videoSection = document.querySelector('.video-section');
  
  // Hide video section by default
  videoSection.classList.add('no-video');

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      searchVideos();
    }
  });
});

// Function to show trending videos when "All" is clicked
function showTrending() {
  const videoWrapper = document.getElementById('videoWrapper');
  const videoSection = document.querySelector('.video-section');
  const welcomeMessage = document.getElementById('welcomeMessage');
  
  // Hide video wrapper and section when showing trending
  videoWrapper.classList.remove('show');
  videoSection.classList.add('no-video');
  
  // Hide welcome message when searching
  welcomeMessage.classList.add('hidden');
  
  document.getElementById('videoPlayer').src = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('videoTitle').innerText = '';
  document.getElementById('descriptionContainer').style.display = 'none';
  document.getElementById('relatedVideos').innerHTML = ''; // Clear related videos

  // Search for trending/popular content
  const query = 'trending popular videos';
  
  // Make API request to search for trending videos
  fetch(`${SEARCH_ENDPOINT}?part=snippet&maxResults=10&q=${query}&type=video&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        // Display search results
        const resultsContainer = document.getElementById('searchResults');
        data.items.forEach(item => {
          const videoId = item.id.videoId;
          const title = item.snippet.title;

          // Create result item
          const resultItem = document.createElement('div');
          resultItem.classList.add('result-item');
          resultItem.innerHTML = `
            <img src="${item.snippet.thumbnails.medium.url}" alt="Thumbnail">
            <p>${title}</p>
          `;
          resultItem.addEventListener('click', () => playVideo(videoId));
          resultsContainer.appendChild(resultItem);
        });
      } else {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<p style="text-align: center; margin: 2rem; font-size: 1.2rem; color: #666;">No trending videos found at the moment.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching trending videos:', error);
      const resultsContainer = document.getElementById('searchResults');
      resultsContainer.innerHTML = '<p style="text-align: center; margin: 2rem; font-size: 1.2rem; color: #666;">Unable to load trending videos.</p>';
    });
}
