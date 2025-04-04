// Supabase Configuration
const supabaseUrl = 'https://riwgagiilkmudczczfuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd2dhZ2lpbGttdWRjemN6ZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjYwODksImV4cCI6MjA1OTE0MjA4OX0.0_lciZODhjlzF_tSCLX7egMVodXhDTDU7jK6TphuQUk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumber = document.getElementById('pageNumber');

// State
let currentPage = 1;
const moviesPerPage = 12;
let currentFilter = 'all';
let totalMovies = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    setupEventListeners();
});

// Fetch movies from Supabase
async function fetchMovies() {
    try {
        // Calculate range for pagination
        const from = (currentPage - 1) * moviesPerPage;
        const to = from + moviesPerPage - 1;

        // Base query
        let query = supabase
            .from('movies')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        // Apply filter if not 'all'
        if (currentFilter !== 'all') {
            query = query.eq('genre', currentFilter);
        }

        // Apply search if exists
        if (searchInput.value.trim()) {
            query = query.ilike('title', `%${searchInput.value.trim()}%`);
        }

        const { data: movies, error, count } = await query;

        if (error) throw error;

        totalMovies = count;
        displayMovies(movies);
        updatePagination();

    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesGrid.innerHTML = '<p class="error">Error loading movies. Please try again.</p>';
    }
}

// Display movies in grid
function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p class="no-movies">No movies found.</p>';
        return;
    }

    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <a href="movie.html?id=${movie.id}">
                <img src="${movie.poster_url}" alt="${movie.title}">
            </a>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.year} • ${movie.genre}</p>
            </div>
        </div>
    `).join('');
}

// Update pagination controls
function updatePagination() {
    pageNumber.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
}

// Event Listeners
function setupEventListeners() {
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            fetchMovies();
        });
    });

    // Search
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        fetchMovies();
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage * moviesPerPage < totalMovies) {
            currentPage++;
            fetchMovies();
        }
    });
}
