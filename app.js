// Global variables and constants
const videosContainer = document.getElementById('videosContainer');
const popup = document.getElementById('popup');
const video = document.querySelector('#popup > iframe');
const videoIdInput = document.getElementById('videoId');
const IDS_KEY = 'youTubeVideoIds';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_KEY = ''; // The API Key is stored in my .env file, which is required for using the YouTube API
let youTubeVideoIds = [];

// Asynchronous function to fetch YouTube videos
const searchYouTube = async (query) => {
    if (!query.trim()) {
        clearSearchResults();
        return;
    }
    try {
        const url = `${BASE_URL}?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}`;
        const response = await axios.get(url);
        const { data }= response;
        if (data.items && data.items.length > 0) {
            displaySearchResults(data.items);
        } else {
            clearSearchResults();
            alert('No results found.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to display search results
const displaySearchResults = (items) => {
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    clearSearchResults();

    // Generate HTML and append to searchResultsContainer for each item in items
    const resultsHtml = items.map(item => {
        const videoId = item.id.videoId;
        const thumbnailUrl = item.snippet.thumbnails.high.url;
        const title = item.snippet.title;
        return `
            <li data-video-id="${videoId}">
                <img class="thumbnail" src="${thumbnailUrl}" alt="${title}">
                <h3>${title}</h3>
                <button class="add-video-btn" data-video-id="${videoId}">Add to Gallery</button>
            </li>
        `;
    }).join('');

    searchResultsContainer.innerHTML = resultsHtml;

    // Attach click event listeners to each "Add to Gallery" button
    document.querySelectorAll('.add-video-btn').forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (!youTubeVideoIds.includes(videoId)) {
                youTubeVideoIds.push(videoId); // Add video ID to the gallery array
                localStorage.setItem('youTubeVideoIds', JSON.stringify(youTubeVideoIds)); // Update localStorage
                displayVideos(); // Refresh the gallery display
            }
        });
    });
}

// Function with all event listeners for searching
const searchEventListeners = () => {
    // Search for videos with the YouTube API when the search button is clicked
    document.getElementById('youtubeSearchBtn').addEventListener('click', function() {
        const query = document.getElementById('youtubeSearchInput').value;
        if (query.trim()) {
            searchYouTube(query);
        } else {
            clearSearchResults();
        }
    });
    /* Search for videos with the YouTube API when the enter key is pressed
    Clear the results and search bar if there is no query */
    document.getElementById('youtubeSearchInput').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = this.value.trim();
            if (query) {
                searchYouTube(query);
            } else {
                clearSearchResults();
            }
        }
    });
    // Clear the search bar input and all results when the clear button is pressed
    document.getElementById('clearSearchBtn').addEventListener('click', function() {
        clearSearchResults();
        document.getElementById('youtubeSearchInput').value = '';
    });
}

// Function for clearing the search results
const clearSearchResults = () => {
    searchResultsContainer.innerHTML = '';
}

// Function to load the videos in gallery
const loadVideos = () => {
  youTubeVideoIds = JSON.parse(localStorage.getItem(IDS_KEY)) || [];
};

// Function to display the videos in gallery
const displayVideos = () => {
    const videosStr = youTubeVideoIds
        .map(id => `
            <li data-video-id="${id}">
                <img class="thumbnail" src="https://i3.ytimg.com/vi/${id}/sddefault.jpg" alt="Cover image for YouTube video with id ${id}">
                <button class="delete-btn" data-video-id="${id}">&times;</button>
            </li>
        `).join('');
    videosContainer.innerHTML = videosStr;
};

// Function with all event listeners for the videos
const videoEventListeners = () => {
    // Event delegation for handling delete button clicks
    videosContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            event.preventDefault(); // Stop default actions
            const videoIdToDelete = event.target.getAttribute('data-video-id');
            const confirmDelete = confirm("Are you sure you want to delete this video?");
            if (confirmDelete) {
                youTubeVideoIds = youTubeVideoIds.filter(id => id !== videoIdToDelete);
                localStorage.setItem(IDS_KEY, JSON.stringify(youTubeVideoIds));
                displayVideos(); // updates the UI
            }
        }
    });

    // Attach event listeners for thumbnails to play videos
    document.querySelectorAll('#videosContainer > li').forEach(li => {
        const img = li.querySelector('.thumbnail');
        img.onclick = function() {
            const videoId = li.getAttribute('data-video-id');
            video.src = `https://www.youtube.com/embed/${videoId}`;
            popup.classList.add('open');
            popup.classList.remove('closed');
        };
    });
};

// Function for handling opening and closing a video 
const handlePopupClick = () => {
  popup.classList.add('closed');
  popup.classList.remove('open');
};

// Function for saving a video the the gallery
const saveVideo = (e) => {
  e.preventDefault();
  const videoId = videoIdInput.value;
  videoIdInput.value = '';
  youTubeVideoIds.push(videoId);
  localStorage.setItem(IDS_KEY, JSON.stringify(youTubeVideoIds));
  displayVideos();
};

// Initialization function
function init() {
    loadVideos();
    displayVideos();
    videoEventListeners();
    searchEventListeners();
}

init();