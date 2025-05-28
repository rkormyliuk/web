// js/api.js

// Users (твій API)
const API_URL = 'https://683625c9664e72d28e3fff9f.mockapi.io/api';

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export async function createUser(data) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
}

export async function deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
}

// --- ДОДАНО API --- //

// 1. Погода Open-Meteo
export async function fetchWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
}

// 2. Музика: Deezer Chart (через CORS proxy)
export async function fetchTopTracks() {
    const url = 'https://api.deezer.com/chart/0/tracks';
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch tracks');
    return response.json();
}

export async function searchTracks(query) {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to search tracks');
    return response.json();
}

// 3. REST Countries
export async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) throw new Error('Failed to fetch countries');
    return response.json();
}

export async function fetchCountryByName(name) {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Failed to fetch country');
    return response.json();
}
