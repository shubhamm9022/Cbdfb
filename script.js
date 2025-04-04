// Supabase Configuration
const supabaseUrl = "https://riwgagiilkmudczczfuw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd2dhZ2lpbGttdWRjemN6ZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjYwODksImV4cCI6MjA1OTE0MjA4OX0.0_lciZODhjlzF_tSCLX7egMVodXhDTDU7jK6TphuQUk";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('movie.html')) {
        loadMovieDetails();
    } else {
        fetchMovies('all');
        setupEventListeners();
    }
});

// Homepage Functions
async function fetchMovies(category = "all") {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = "<div class='loader'>Loading...</div>";
    
    try {
        let query = supabase
            .from("movies")
            .select("id, title, year, Genre, poster, slug")
            .order("created_at", { ascending: false });

        if (category !== "all") {
            query = query.eq("Genre", category);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        displayMovies(data);
        updateBreadcrumb(category);
    } catch (error) {
        console.error("Error fetching movies:", error);
        movieList.innerHTML = "<p class='error'>Error loading movies. Please try again.</p>";
    }
}

function displayMovies(movies) {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = "";

    if (!movies || movies.length === 0) {
        movieList.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        const movieDiv = document.createElement("div");
        movieDiv.classList.add("movie");

        movieDiv.innerHTML = `
            <a href="movie.html?slug=${movie.slug}">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            </a>
            <h3>${movie.title} (${movie.year})</h3>
            <p>${movie.Genre}</p>
        `;

        movieList.appendChild(movieDiv);
    });
}

// Movie Detail Page Functions
async function loadMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieSlug = urlParams.get('slug');
    
    if (!movieSlug) {
        document.getElementById("movieDetail").innerHTML = "<p>Movie not found</p>";
        return;
    }

    try {
        const { data: movie, error } = await supabase
            .from("movies")
            .select("*")
            .eq("slug", movieSlug)
            .single();

        if (error) throw error;
        if (!movie) throw new Error("Movie not found");
        
        displayMovieDetails(movie);
    } catch (error) {
        console.error("Error loading movie:", error);
        document.getElementById("movieDetail").innerHTML = `
            <p class="error">Error loading movie details</p>
            <a href="index.html" class="back-link">← Back to all movies</a>
        `;
    }
}

function displayMovieDetails(movie) {
    const movieDetail = document.getElementById("movieDetail");
    document.getElementById("movie-title").textContent = movie.title;

    movieDetail.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <h1>${movie.title} <span class="year">(${movie.year})</span></h1>
            <div class="genres">${movie.Genre.split(',').map(g => 
                `<span class="genre-tag">${g.trim()}</span>`
            ).join('')}</div>
            ${movie.description ? `<p class="description">${movie.description}</p>` : ''}
            <div class="action-buttons">
                ${movie.streamLink ? `
                    <a href="${movie.streamLink}" class="stream-btn" target="_blank">
                        ▶️ Stream Now
                    </a>
                ` : ''}
                ${movie.downloadLink ? `
                    <a href="${movie.downloadLink}" class="download-btn" target="_blank">
                        ⬇️ Download
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Utility Functions
function updateBreadcrumb(category) {
    const categoryNames = {
        'all': 'All Movies',
        'Hollywood': 'Hollywood',
        'Bollywood': 'Bollywood',
        'South Indian Dubbed': 'South Indian Dubbed'
    };
    document.getElementById("current-category").textContent = categoryNames[category] || 'All Movies';
}

function setupEventListeners() {
    // Search functionality
    document.getElementById("search").addEventListener('input', searchMovies);
    
    // Security
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s")) e.preventDefault();
    });
}

function searchMovies() {
    const query = document.getElementById("search").value.trim().toLowerCase();
    const movies = document.querySelectorAll(".movie");

    movies.forEach(movie => {
        const title = movie.querySelector("h3").textContent.toLowerCase();
        movie.style.display = title.includes(query) ? "block" : "none";
    });
}
