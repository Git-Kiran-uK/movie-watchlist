
async function getMovies(search='Batman', id='') {
    try{
        const response = await fetch(`http://www.omdbapi.com/?apikey=4850e0ba&${id ? `i=${id}` : `s=${search}`}`);
        if(!response.ok) throw new Error('The problem with API');
        const data = await response.json();
        if (!data || data.Response === "False") return [];

        return id ? data : Promise.all(data['Search'].map(movie =>
            fetch(`http://www.omdbapi.com/?apikey=4850e0ba&i=${movie.imdbID}`).then(res => res.json())
        ));
    } catch(err){
        console.error(err);
        return [];
    }
}

async function renderMovieElement(movieTitle){
    const movieData = await getMovies(movieTitle);
    if(document.getElementById('movie-list')) document.getElementById('movie-list').innerHTML = getHTML(movieData, true);
    addMovieWatchlist();
}

function getHTML(movieData, addToWatchList=false, html='') {
    movieData.forEach(movie => {
        html += `
            <div class="movie-container">
                <img src="${movie['Poster']}" alt="" class="${movie['Title']} movie-poster">
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
                        <a href="#" class="add-watchlist" data-id="${movie.imdbID}" data-title="${movie['Title']}">
                        <i class="fa-solid fa-circle-${addToWatchList ? 'plus' : 'minus'}"></i>${addToWatchList ? 'Watchlist' : 'Remove'}</a>
                    </div>
                    <p>${movie['Plot']}</p>
                </div>
            </div>
        `;
    });
    return html;
}

function addMovieWatchlist(){
    document.querySelectorAll('.add-watchlist').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const movieTitle = e.currentTarget.dataset.title;
            const movieId = e.currentTarget.dataset.id;
            const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

            if(!watchlist.some(movie => movie.movieId === movieId)){
                watchlist.push({ movieTitle, movieId });
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
            }
            console.log(watchlist);
        });
    });
}

async function displayMovieWatchlist(){
    const movieWatchList = JSON.parse(localStorage.getItem('watchlist')) || [];
    const movieList = await Promise.all(movieWatchList.map(async movie => await getMovies(movie.movieTitle, movie.movieId)));
    console.log(movieList);
    const movieWatchListContainer = document.getElementById('movie-watch-list');
    movieWatchListContainer.innerHTML = getHTML(movieList);
}

document.addEventListener("DOMContentLoaded", function () {
    if(document.getElementById('movie-search')){
        const form = document.getElementById('movie-search');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const movieTitle = formData.get('movie-title');
            renderMovieElement(movieTitle);
        });
    }

    if (document.getElementById('movie-watch-list')) {
        console.log('Watchlist dom is loaded');
        displayMovieWatchlist();
    }
});

renderMovieElement()