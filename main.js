//Declare URLs for API calls
const API_KEY = 'api_key=164d02e7be461815b0d6db46e3b5f4c2';
const BASE_URL = 'https://api.themoviedb.org/3';
const SEARCH_URL = BASE_URL + '/search/movie?' + API_KEY + '&query=';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const TREND_URL = BASE_URL + '/trending/movie/week?' + API_KEY;

var movieImages = document.getElementsByClassName('moviePosters');
const movieInput = document.getElementById('movie-input');
const nextPageBtn = document.getElementById('next-page');
const prevPageBtn = document.getElementById('previous-page');
const homePageTitle = document.getElementById('home-page-title');

let moviesHTML = '';
let trendOrSearch = 0; //0 for on trending page, 1 for on search page
let pageNumber = 1;
let lastPageNum = 1;

movieInput.addEventListener("keypress", function(e) {
    if(e.key === 'Enter' && movieInput.value != '') {
        document.location.search = `search=${movieInput.value}`;
        searchMovie(movieInput.value, '1');
    }
});

//check to see if there are search paramters in URL, if not, view by trending
const searchParam = new URLSearchParams(window.location.search).get('search');
if(searchParam === null) {
    moviesByTrending(TREND_URL);
} else {
    movieInput.value = searchParam;
    searchMovie(searchParam, '1');
}

nextPageBtn.onclick = function() {
    
    if(pageNumber === lastPageNum) return;

    pageNumber++;

    if(trendOrSearch === 0) { //if on trending
        location.href = '#';
        moviesByTrending(TREND_URL + `&page=${pageNumber.toString()}`);
    } else if(trendOrSearch === 1) { //if on search
        location.href = '#';
        searchMovie(searchParam, pageNumber.toString());
    }
}

prevPageBtn.onclick = function() {
    if(pageNumber > 1) {
        pageNumber--;
    }
    
    if(trendOrSearch === 0) { //if on trending
        location.href = '#';
        moviesByTrending(TREND_URL + `&page=${pageNumber.toString()}`);
    } else if(trendOrSearch === 1) { //if on search
        location.href = '#';
        searchMovie(movieInput.value, pageNumber.toString());
    }
}

//view movies by trending
function moviesByTrending(url){
    movieInput.value = '';
    moviesHTML = '';
    trendOrSearch = 0;
    nextPageBtn.disabled = false;
    prevPageBtn.disabled = false;
    homePageTitle.innerHTML = `Trending Movies`;
    document.title = `Trending Movies`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        lastPageNum = data.total_pages;
        displayMovies(data);
})
.catch(error => console.log(`Error: ${error}`))
}

//search for a movie given search terms and what pageNum
function searchMovie(searchTerms, pageNum){
    movieInput.value = '';
    moviesHTML = '';
    trendOrSearch = 1;
    pageNumber = pageNum;
    nextPageBtn.disabled = false;
    prevPageBtn.disabled = false;
    fetch(SEARCH_URL + searchTerms + `&page=${pageNum}`)
    .then(response => response.json())
    .then(data => {
        lastPageNum = data.total_pages;
        homePageTitle.innerHTML = `Showing movies for "${searchTerms}"`
        document.title = `Search - "${searchTerms}"`
        displayMovies(data);
    })
    .catch(error => console.log(`Error: ${error}`))
    
}

//refreshes list of movies HTML with new data
function displayMovies(data) {
    let moviesHTML = ``;

    console.log(data);

    if(data.total_results <= 0) {
        moviesHTML = `<div style="padding-top: 25px; padding-bottom: 25px; text-align: center">
                        <h3> No results found </h3>.
                    </div>`;
        document.getElementById('movies-container').innerHTML = moviesHTML;
        document.getElementById('page-count').innerHTML = `Page ${data.page.toString()} of ${data.total_pages.toString()}`;
        nextPageBtn.disabled = true;
        prevPageBtn.disabled = true;
        return;
    }

    let i = 0;

    data.results.forEach(movie => {

        let moviePoster;

        if(movie.poster_path === null) {
            moviePoster = 'movie-poster-placeholder.jpg'
        } else {
            moviePoster = IMG_URL + movie.poster_path;
        }

        if(i === 0) {
            moviesHTML += `<div class="row">
            `;
        }

        moviesHTML += `
            <div class="col" style="padding-top: 25px; padding-bottom: 25px;">
                <div class="movie-img-container">
                    <a href="movie-details.html?id=${movie.id}">
                        <img src="${moviePoster}" class="img-fluid border border-3 rounded shadow-md moviePosters" 
                        alt="placeholder-image" width="250px">
                            <div class="movie-details">
                                <h4 class="movie-img-title">
                                    ${movie.title}
                                </h4>
                                <p class="movie-img-desc">${movie.overview}</p>
                            </div>
                    </a>
                </div>
            </div>`;

        if(i === 3) {
            moviesHTML += `
            </div>`;
            i = -1;  
        }
            i++;
    });

    if(pageNumber == lastPageNum) {
        nextPageBtn.disabled = true;
    }
    
    if(pageNumber == 1) {
        prevPageBtn.disabled = true;
    }
    
    document.getElementById('movies-container').innerHTML = moviesHTML;
    document.getElementById('page-count').innerHTML = `Page ${data.page.toString()} of ${data.total_pages.toString()}`;
}
