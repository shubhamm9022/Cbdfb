// Supabase Configuration
const supabaseUrl = 'https://riwgagiilkmudczczfuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd2dhZ2lpbGttdWRjemN6ZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjYwODksImV4cCI6MjA1OTE0MjA4OX0.0_lciZODhjlzF_tSCLX7egMVodXhDTDU7jK6TphuQUk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const movieDetail = document.getElementById('movieDetail');

// Get movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Fetch and display movie details
document.addEventListener('DOMContentLoaded', async () => {
    if (!movieId) {
        movieDetail.innerHTML = '<p>Movie not found</p>';
        return;
    }

    try {
        const { data: movie, error } = await supabase
            .from('movies')
            .select('*')
            .eq('id', movieId)
            .single();

        if (error) throw error;
        if (!movie) throw new Error('Movie not found');

        displayMovieDetails(movie);

    } catch (error) {
        console.error('Error fetching movie:', error);
        movieDetail.innerHTML = '<p class="error">Error loading movie details.</p>';
    }
});

// Display movie details
function displayMovieDetails(movie) {
    movieDetail.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster_url}" alt="${movie.title}">
        </div>
        <div class="movie-meta">
            <h1>${movie.title} <span class="year">(${movie.year})</span></h1>
            
            <div class="genres">
                ${movie.genre.split(',').map(g => `
                    <span class="genre">${g.trim()}</span>
                `).join('')}
            </div>
            
            <p class="plot">${movie.description || 'No description available.'}</p>
            
            <div class="actions">
                ${movie.stream_link ? `
                    <a href="${movie.stream_link}" class="btn stream-btn" target="_blank">Stream Now</a>
                ` : ''}
                
                ${movie.download_link ? `
                    <a href="${movie.download_link}" class="btn download-btn" target="_blank">Download</a>
                ` : ''}
            </div>
        </div>
    `;
}
