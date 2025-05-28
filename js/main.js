import {
    fetchUsers, createUser, deleteUser,
    fetchWeather, fetchTopTracks, searchTracks, fetchCountries, fetchCountryByName
} from './api.js';

// --- Mock data for playlists (локально, без API)
let playlists = [
    {
        id: 101,
        name: 'Rock Classics',
        visibility: 'public',
        owner: 1,
        songs: [
            { id: 201, name: 'Bohemian Rhapsody', artist: 'Queen' },
            { id: 202, name: 'Stairway to Heaven', artist: 'Led Zeppelin' },
            { id: 203, name: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses' }
        ]
    },
    {
        id: 102,
        name: 'Workout Mix',
        visibility: 'private',
        owner: 1,
        songs: [
            { id: 204, name: 'Eye of the Tiger', artist: 'Survivor' },
            { id: 205, name: 'Stronger', artist: 'Kanye West' },
            { id: 206, name: 'Till I Collapse', artist: 'Eminem' }
        ]
    },
    {
        id: 103,
        name: 'Chill Vibes',
        visibility: 'public',
        owner: 2,
        songs: [
            { id: 207, name: 'Redbone', artist: 'Childish Gambino' },
            { id: 208, name: 'Sweater Weather', artist: 'The Neighbourhood' },
            { id: 209, name: 'Starboy', artist: 'The Weeknd' }
        ]
    }
];

let currentUser = null;
let newPlaylistSongs = [];
let topSongs = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", image: "https://cdn.pixabay.com/photo/2024/07/01/14/42/ai-generated-8865407_1280.jpg", plays: "5.2M" },
    { id: 2, title: "Levitating", artist: "Dua Lipa", image: "https://cdn.pixabay.com/photo/2023/08/25/18/25/sound-waves-8213470_1280.jpg", plays: "4.8M" },
    { id: 3, title: "As It Was", artist: "Harry Styles", image: "https://cdn.pixabay.com/photo/2020/11/02/05/56/music-5705801_1280.jpg", plays: "4.5M" },
    { id: 4, title: "Stay", artist: "Kid LAROI, Justin Bieber", image: "https://cdn.pixabay.com/photo/2017/08/05/11/36/hand-2582803_1280.jpg", plays: "4.2M" },
    { id: 5, title: "Heat Waves", artist: "Glass Animals", image: "https://cdn.pixabay.com/photo/2021/10/12/17/41/abstract-6704211_1280.jpg", plays: "3.9M" },
    { id: 6, title: "Bad Habits", artist: "Ed Sheeran", image: "https://cdn.pixabay.com/photo/2024/08/09/01/06/country-8955755_1280.png", plays: "3.7M" },
    { id: 7, title: "Save Your Tears", artist: "The Weeknd", image: "https://cdn.pixabay.com/photo/2024/06/27/04/47/ai-generated-8856261_1280.jpg", plays: "3.5M" }
];

// --- USERS (MockAPI)
async function handleAddUser() {
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    if (!name || !email) {
        alert('Please fill name and email!');
        return;
    }
    try {
        await createUser({ name, email });
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-email').value = '';
        showUsersList();
    } catch (err) {
        alert('Failed to add user: ' + err.message);
    }
}
window.handleAddUser = handleAddUser;

async function showUsersList() {
    try {
        const users = await fetchUsers();
        const usersContainer = document.getElementById('users-list');
        usersContainer.innerHTML = '';

        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <span>${user.name} (${user.email})</span>
                <button onclick="handleDeleteUser('${user.id}')">Delete</button>
            `;
            usersContainer.appendChild(div);
        });
    } catch (err) {
        alert('Failed to load users: ' + err.message);
    }
}
window.showUsersList = showUsersList;

async function handleDeleteUser(id) {
    if (!confirm('Delete user?')) return;
    try {
        await deleteUser(id);
        showUsersList();
    } catch (err) {
        alert('Failed to delete user: ' + err.message);
    }
}
window.handleDeleteUser = handleDeleteUser;

// --- AUTH MOCK (локально, не через API)
let users = [
    { id: 1, username: 'John', email: 'john@example.com', password: 'password' },
    { id: 2, username: 'Jane', email: 'jane@example.com', password: 'password' }
];

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById('login-register-container').classList.add('hidden');
        document.getElementById('user-container').classList.remove('hidden');
        document.getElementById('playlist-container').classList.remove('hidden');
        document.getElementById('featured-section').classList.remove('hidden');
        document.getElementById('username-display').textContent = user.username;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        createVisualizer();
        createTopSongs();
        refreshPlaylists();
    } else {
        alert('Invalid email or password');
    }
}

function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);
    alert('Registration successful! Please log in.');
    showTab('login');
}

function logout() {
    currentUser = null;
    document.getElementById('login-register-container').classList.remove('hidden');
    document.getElementById('user-container').classList.add('hidden');
    document.getElementById('playlist-container').classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    clearInputs();
}

// --- Playlist Functions (локально)
function addSongToNewPlaylist() {
    const songName = document.getElementById('song-name').value;
    const songArtist = document.getElementById('song-artist').value;
    if (songName && songArtist) {
        const song = { id: Date.now(), name: songName, artist: songArtist };
        newPlaylistSongs.push(song);
        document.getElementById('song-name').value = '';
        document.getElementById('song-artist').value = '';
        refreshNewPlaylistSongs();
    }
}

function refreshNewPlaylistSongs() {
    const songList = document.getElementById('new-playlist-songs');
    songList.innerHTML = '';
    newPlaylistSongs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.innerHTML = `
            <div class="song-info">
                <i class="fas fa-music song-icon"></i>
                <span>${song.name} - ${song.artist}</span>
            </div>
            <button class="btn-danger" onclick="removeSongFromNew(${song.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        songList.appendChild(li);
    });
}

function removeSongFromNew(songId) {
    newPlaylistSongs = newPlaylistSongs.filter(song => song.id !== songId);
    refreshNewPlaylistSongs();
}

function createPlaylist() {
    if (!currentUser) {
        alert('You must be logged in to create a playlist');
        return;
    }
    const name = document.getElementById('playlist-name').value;
    const visibility = document.getElementById('playlist-visibility').value;
    if (!name) {
        alert('Please enter a playlist name');
        return;
    }
    const newPlaylist = {
        id: Date.now(),
        name,
        visibility,
        owner: currentUser.id,
        songs: [...newPlaylistSongs]
    };
    playlists.push(newPlaylist);
    clearInputs();
    refreshPlaylists();
}

function clearInputs() {
    document.getElementById('playlist-name').value = '';
    document.getElementById('song-name').value = '';
    document.getElementById('song-artist').value = '';
    newPlaylistSongs = [];
    refreshNewPlaylistSongs();
}

function refreshPlaylists() {
    refreshMyPlaylists();
    refreshPublicPlaylists();
}

function refreshMyPlaylists() {
    const myPlaylistsContainer = document.getElementById('my-playlists');
    myPlaylistsContainer.innerHTML = '';
    const userPlaylists = playlists.filter(p => p.owner === currentUser?.id);
    if (userPlaylists.length === 0) {
        myPlaylistsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music"></i>
                <p>You have no playlists yet.</p>
            </div>
        `;
        return;
    }
    userPlaylists.forEach(playlist => {
        const playlistElement = createPlaylistElement(playlist, true);
        myPlaylistsContainer.appendChild(playlistElement);
    });
}

function refreshPublicPlaylists() {
    const publicPlaylistsContainer = document.getElementById('public-playlists');
    publicPlaylistsContainer.innerHTML = '';
    const publicPlaylists = playlists.filter(p => p.visibility === 'public' && p.owner !== currentUser?.id);
    if (publicPlaylists.length === 0) {
        publicPlaylistsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe"></i>
                <p>No public playlists available.</p>
            </div>
        `;
        return;
    }
    publicPlaylists.forEach(playlist => {
        const playlistElement = createPlaylistElement(playlist, false);
        publicPlaylistsContainer.appendChild(playlistElement);
    });
}

function createPlaylistElement(playlist, isOwner) {
    const div = document.createElement('div');
    div.className = 'playlist-item';
    const owner = users.find(u => u.id === playlist.owner);
    const ownerName = owner ? owner.username : 'Unknown';
    div.innerHTML = `
        <h3>
            <span><i class="fas fa-${playlist.visibility === 'private' ? 'lock' : 'globe'}"></i> ${playlist.name}</span>
            <span class="badge ${playlist.visibility}">
                <i class="fas fa-${playlist.visibility === 'private' ? 'lock' : 'globe'}"></i>
                ${playlist.visibility}
            </span>
        </h3>
        <div class="creator-info">
            <div class="creator-avatar">${ownerName.charAt(0).toUpperCase()}</div>
            <span>Created by: ${ownerName}</span>
        </div>
        <ul class="song-list" id="songs-${playlist.id}">
            ${playlist.songs.length === 0 ? 
              `<div class="empty-state">
                  <p>No songs in this playlist yet.</p>
              </div>` : 
              playlist.songs.map(song => `
                <li class="song-item">
                    <div class="song-info">
                        <i class="fas fa-music song-icon"></i>
                        <span>${song.name} - ${song.artist}</span>
                    </div>
                    ${(isOwner || playlist.visibility === 'public') ? 
                      `<button class="btn-danger" onclick="removeSongFromPlaylist(${playlist.id}, ${song.id})">
                          <i class="fas fa-trash"></i>
                      </button>` : ''}
                </li>
            `).join('')}
        </ul>
        ${(isOwner || playlist.visibility === 'public') ? `
        <div class="input-group">
            <input type="text" id="new-song-name-${playlist.id}" placeholder="Song Name">
            <input type="text" id="new-song-artist-${playlist.id}" placeholder="Artist">
            <button onclick="addSongToPlaylist(${playlist.id})">
                <i class="fas fa-plus"></i> Add
            </button>
        </div>
        ` : ''}
        ${isOwner ? `
        <div style="display: flex; gap: 0.8rem; margin-top: 1rem;">
            <button class="btn-danger" onclick="deletePlaylist(${playlist.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
            ${playlist.visibility === 'private' ? 
              `<button class="btn-success" onclick="makePlaylistPublic(${playlist.id})">
                  <i class="fas fa-globe"></i> Make Public
              </button>` : 
              `<button onclick="makePlaylistPrivate(${playlist.id})">
                  <i class="fas fa-lock"></i> Make Private
              </button>`}
        </div>
        ` : ''}
    `;
    return div;
}

function addSongToPlaylist(playlistId) {
    const songName = document.getElementById(`new-song-name-${playlistId}`).value;
    const songArtist = document.getElementById(`new-song-artist-${playlistId}`).value;
    if (songName && songArtist) {
        const song = { id: Date.now(), name: songName, artist: songArtist };
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.songs.push(song);
            document.getElementById(`new-song-name-${playlistId}`).value = '';
            document.getElementById(`new-song-artist-${playlistId}`).value = '';
            refreshPlaylists();
        }
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songs = playlist.songs.filter(song => song.id !== songId);
        refreshPlaylists();
    }
}

function deletePlaylist(playlistId) {
    playlists = playlists.filter(p => p.id !== playlistId || p.owner !== currentUser.id);
    refreshPlaylists();
}

function makePlaylistPublic(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId && p.owner === currentUser.id);
    if (playlist) {
        playlist.visibility = 'public';
        refreshPlaylists();
    }
}

function makePlaylistPrivate(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId && p.owner === currentUser.id);
    if (playlist) {
        playlist.visibility = 'private';
        refreshPlaylists();
    }
}

// --- UI Tabs
function showTab(tabName) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(`${tabName}-form`).classList.remove('hidden');
    document.querySelectorAll('.auth-container .tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.auth-container .tab[onclick="showTab('${tabName}')"]`).classList.add('active');
}
window.showTab = showTab;

function showPlaylistTab(tabName) {
    document.querySelectorAll('.playlist-list').forEach(container => container.classList.add('hidden'));
    document.getElementById(`${tabName}-playlists-container`).classList.remove('hidden');
    document.querySelectorAll('.playlist-container .tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.playlist-container .tab[onclick="showPlaylistTab('${tabName}')"]`).classList.add('active');
}
window.showPlaylistTab = showPlaylistTab;

// --- Visualizer & Top Songs
function createVisualizer() {
    const visualizer = document.getElementById('visualizer');
    visualizer.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        visualizer.appendChild(bar);
    }
}

function createTopSongs() {
    const container = document.querySelector('.featured-container');
    container.innerHTML = '';
    topSongs.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.className = 'top-song';
        songElement.innerHTML = `
            <div class="top-song-rank">${index + 1}</div>
            <img src="${song.image}" alt="${song.title}" class="top-song-image">
            <div class="top-song-info">
                <div class="top-song-title">${song.title}</div>
                <div class="top-song-artist">${song.artist}</div>
                <div class="top-song-plays">
                    <i class="fas fa-headphones-alt"></i> ${song.plays}
                </div>
            </div>
        `;
        container.appendChild(songElement);
    });
 
// --- WEATHER (Open-Meteo) ---
window.showWeather = async function () {
    const city = document.getElementById('weather-city').value.trim();
    const resultDiv = document.getElementById('weather-result');
    resultDiv.textContent = 'Loading...';
    try {
        // Simple geocode for popular cities
        const cities = {
            kyiv: [50.45, 30.52],
            london: [51.51, -0.13],
            newyork: [40.71, -74.01],
            warsaw: [52.23, 21.01]
        };
        const coords = cities[city.toLowerCase()] || [50.45, 30.52]; // default: Kyiv
        const data = await fetchWeather(coords[0], coords[1]);
        resultDiv.innerHTML = `
            <b>Temperature:</b> ${data.current_weather.temperature} °C<br/>
            <b>Wind:</b> ${data.current_weather.windspeed} km/h
        `;
    } catch (e) {
        resultDiv.textContent = 'Failed to get weather';
    }
};

// --- MUSIC (Deezer) ---
window.showTopTracks = async function () {
    const resultDiv = document.getElementById('deezer-result');
    resultDiv.textContent = 'Loading...';
    try {
        const data = await fetchTopTracks();
        resultDiv.innerHTML = data.data.slice(0, 5).map(track =>
            `<div>
                <b>${track.title}</b> (${track.artist.name}) 
                <audio src="${track.preview}" controls></audio>
            </div>`
        ).join('');
    } catch (e) {
        resultDiv.textContent = 'Failed to load top tracks';
    }
};

window.searchDeezer = async function () {
    const query = document.getElementById('deezer-search').value.trim();
    const resultDiv = document.getElementById('deezer-search-result');
    resultDiv.textContent = 'Loading...';
    if (!query) return (resultDiv.textContent = 'Enter query');
    try {
        const data = await searchTracks(query);
        resultDiv.innerHTML = data.data.slice(0, 5).map(track =>
            `<div>
                <b>${track.title}</b> (${track.artist.name}) 
                <audio src="${track.preview}" controls></audio>
            </div>`
        ).join('');
    } catch (e) {
        resultDiv.textContent = 'Failed to search';
    }
};

// --- COUNTRIES ---
window.showCountries = async function () {
    const resultDiv = document.getElementById('countries-result');
    resultDiv.textContent = 'Loading...';
    try {
        const data = await fetchCountries();
        resultDiv.innerHTML = data.slice(0, 20).map(c =>
            `<div>${c.name.common} <img src="${c.flags.png}" width="20"/></div>`
        ).join('');
    } catch (e) {
        resultDiv.textContent = 'Failed to load countries';
    }
};

window.searchCountry = async function () {
    const name = document.getElementById('country-search').value.trim();
    const resultDiv = document.getElementById('country-search-result');
    resultDiv.textContent = 'Loading...';
    if (!name) return (resultDiv.textContent = 'Enter country name');
    try {
        const data = await fetchCountryByName(name);
        resultDiv.innerHTML = data.map(c =>
            `<div>
                <b>${c.name.common}</b> — Capital: ${c.capital?.[0] || '-'}
                <img src="${c.flags.png}" width="20"/>
            </div>`
        ).join('');
    } catch (e) {
        resultDiv.textContent = 'Not found';
    }
};
    
}

// --- Init users list from API after DOM loaded
document.addEventListener('DOMContentLoaded', showUsersList);

// --- Register functions to window (for inline onclick handlers)
window.login = login;
window.logout = logout;
window.register = register;
window.addSongToNewPlaylist = addSongToNewPlaylist;
window.removeSongFromNew = removeSongFromNew;
window.createPlaylist = createPlaylist;
window.addSongToPlaylist = addSongToPlaylist;
window.removeSongFromPlaylist = removeSongFromPlaylist;
window.deletePlaylist = deletePlaylist;
window.makePlaylistPublic = makePlaylistPublic;
window.makePlaylistPrivate = makePlaylistPrivate;

window.handleAddUser = handleAddUser;
window.showUsersList = showUsersList;
window.handleDeleteUser = handleDeleteUser;
window.showTab = showTab;
window.showPlaylistTab = showPlaylistTab;

// ...весь твій код...

// --- Init users list from API after DOM loaded
document.addEventListener('DOMContentLoaded', showUsersList);

// --- Register functions to window (for inline onclick handlers)
window.login = login;
window.logout = logout;
window.register = register;
window.addSongToNewPlaylist = addSongToNewPlaylist;
window.removeSongFromNew = removeSongFromNew;
window.createPlaylist = createPlaylist;
window.addSongToPlaylist = addSongToPlaylist;
window.removeSongFromPlaylist = removeSongFromPlaylist;
window.deletePlaylist = deletePlaylist;
window.makePlaylistPublic = makePlaylistPublic;
window.makePlaylistPrivate = makePlaylistPrivate;

window.handleAddUser = handleAddUser;
window.showUsersList = showUsersList;
window.handleDeleteUser = handleDeleteUser;
window.showTab = showTab;
window.showPlaylistTab = showPlaylistTab;

// ============= WebSocket чат секція (ECHO) =============
(function () {
    const wsUrl = "wss://ws.ifelse.io";
    let ws;
    let isOpen = false;

    const messagesDiv = document.getElementById('ws-messages');
    const input = document.getElementById('ws-input');
    const sendBtn = document.getElementById('ws-send');
    const statusDiv = document.getElementById('ws-status');

    function addMessage(text, isMe) {
        const el = document.createElement('div');
        el.style.marginBottom = '0.2em';
        el.style.textAlign = isMe ? 'right' : 'left';
        el.innerHTML = `<span style="color:${isMe ? '#6200ea' : '#333'}">${isMe ? 'You:' : 'Echo:'}</span> ${text}`;
        messagesDiv.appendChild(el);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function setStatus(msg) {
        statusDiv.textContent = msg;
    }

    function connect() {
        ws = new window.WebSocket(wsUrl);

        ws.onopen = function () {
            isOpen = true;
            setStatus('WebSocket connected!');
            addMessage('WebSocket connected!', false);
        };

        ws.onmessage = function (e) {
            addMessage(e.data, false);
        };

        ws.onclose = function () {
            isOpen = false;
            setStatus('WebSocket closed. Reconnecting...');
            setTimeout(connect, 2000);
        };

        ws.onerror = function () {
            setStatus('WebSocket error.');
        };
    }

    sendBtn.addEventListener('click', function () {
        if (!isOpen) {
            setStatus('WebSocket not connected...');
            return;
        }
        const text = input.value.trim();
        if (!text) return;
        ws.send(text);
        addMessage(text, true);
        input.value = '';
        input.focus();
    });

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendBtn.click();
    });

    connect();
})();
