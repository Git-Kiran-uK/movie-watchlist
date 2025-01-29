const movieListContainer = document.getElementById('movie-list');
const form = document.getElementById('movie-search');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const movieTitle = formData.get('movie-title');
    getMovies(movieTitle);
});
async function getMovies(search='Batman') {
    try{
        const response = await fetch(`http://www.omdbapi.com/?apikey=4850e0ba&s=${search}`);
        if(!response.ok) throw new Error('The problem with API');
        const data = await response.json();
        const movieData = await Promise.all(data['Search'].map(async (movie) => {
            return await fetch(`http://www.omdbapi.com/?apikey=4850e0ba&i=${movie.imdbID}`).then(res => res.json());
        }));
        renderMovieElement(movieData);
    } catch(err){
        console.error(err);
    }
}

function renderMovieElement(movieData){
    let html = '';
    movieData.forEach(movie => {
        html += `
            <div class="movie-container">
                <img src=${movie['Poster']} alt="" class="${movie['Title']} movie-poster">
                <div class="movie-metadata">
                    <div class="movie-name-rating-container">
                        <h3 class="movie-name">${movie['Title']}</h3>
                        <span class="movie-rating"><i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie['imdbRating']}</span>
                    </div>
                    <div class="movie-genre-container">
                        <div class="movie-duration-genre-container">
                            <span class="duration">${movie['Runtime']}</span>
                            <span class="genre">${movie['Genre']}</span>
                        </div>
                        <a href="#" class="add-watchlist"><i class="fa-solid fa-circle-plus"></i>Watchlist</a>
                    </div>
                    <p>${movie['Plot']}</p>
                </div>
            </div>
        `
    });
    movieListContainer.innerHTML = html;
}

getMovies();

