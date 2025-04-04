// Supabase Configuration
const supabaseUrl = "https://riwgagiilkmudczczfuw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd2dhZ2lpbGttdWRjemN6ZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjYwODksImV4cCI6MjA1OTE0MjA4OX0.0_lciZODhjlzF_tSCLX7egMVodXhDTDU7jK6TphuQUk";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const movieList = document.getElementById("movieList");
const currentCategory = document.getElementById("current-category");
const searchInput = document.getElementById("search");

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies('all');
    
    // Event listener for Enter key in search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMovies();
        }
    });
});

// Fetch movies from Supabase
async function fetchMovies(category = "all") {
    // Show loading spinner
    movieList.innerHTML = '<div class="loader"></div>';
    document.querySelector('.loader').style.display = 'block';
    
    try {
        let query = supabase
            .from("movies")
            .select("*")
            .order("created_at", { ascending: false });

        if (category !== "all") {
            query = query.eq("genre", category);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Update breadcrumb
        updateBreadcrumb(category);
        
        // Display movies with animation
        displayMovies(data);
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        movieList.innerHTML = `<p class="error">Error loading movies. Please try again later.</p>`;
    }
}

// Display movies with animation
function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        movieList.innerHTML = '<p class="no-results">No movies found.</p>';
        return;
    }

    movieList.innerHTML = '';
    
    movies.forEach((movie, index) => {
        const movieDiv = document.createElement("div");
        movieDiv.className = "movie fade-in";
        movieDiv.style.animationDelay = `${index * 0.1}s`;
        
        movieDiv.innerHTML = `
            <img src="${movie.poster || 'placeholder.jpg'}" alt="${movie.title}" loading="lazy">
            <h3>${movie.title} (${movie.year})</h3>
            <p>${movie.genre}</p>
            <div class="movie-links">
                ${movie.stream_link ? `<a href="${movie.stream_link}" target="_blank">Stream</a>` : ''}
                ${movie.download_link ? `<a href="${movie.download_link}" target="_blank">Download</a>` : ''}
            </div>
        `;
        
        movieList.appendChild(movieDiv);
    });
}

// Update breadcrumb navigation
function updateBreadcrumb(category) {
    const categoryNames = {
        'all': 'All Movies',
        'Hollywood': 'Hollywood',
        'Bollywood': 'Bollywood',
        'South Indian Dubbed': 'South Indian Dubbed'
    };
    
    currentCategory.textContent = categoryNames[category] || 'All Movies';
}

// Search movies
function searchMovies() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        fetchMovies('all');
        return;
    }
    
    // Show loading spinner
    movieList.innerHTML = '<div class="loader"></div>';
    document.querySelector('.loader').style.display = 'block';
    
    // Search in Supabase
    supabase
        .from("movies")
        .select("*")
        .ilike('title', `%${query}%`)
        .then(({ data, error }) => {
            if (error) throw error;
            
            if (data.length === 0) {
                movieList.innerHTML = '<p class="no-results">No movies found matching your search.</p>';
            } else {
                displayMovies(data);
                currentCategory.textContent = `Search: "${query}"`;
            }
        })
        .catch(error => {
            console.error("Search error:", error);
            movieList.innerHTML = `<p class="error">Search failed. Please try again.</p>`;
        });
}

// Disable right-click and certain keyboard shortcuts
document.addEventListener("contextmenu", event => event.preventDefault());
document.addEventListener("keydown", event => {
    if (event.ctrlKey && (event.key === "c" || event.key === "u" || event.key === "s")) {
        event.preventDefault();
    }
});
