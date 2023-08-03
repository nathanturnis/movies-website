//pull out movie id from url parameters
const urlParameters = new URLSearchParams(window.location.search);
const movieID = urlParameters.get('id');

//declare URLs for API calls
const API_KEY = 'api_key=164d02e7be461815b0d6db46e3b5f4c2';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';
const VIDEO_URL = BASE_URL + '/movie/' + movieID.toString() + '/videos?' + API_KEY;

const movieInput = document.getElementById('movie-input');

movieInput.addEventListener("keypress", function(e) {
    if(e.key === 'Enter' && movieInput.value != '') {
        location.href = `index.html?search=${movieInput.value}`;

    }
});

let movieTitle = '';

//call API requesting details about movie
fetch(BASE_URL + '/movie/' + movieID.toString() + '?' + API_KEY)
.then(response => response.json())
.then(data => {
    console.log(data);
    movieTitle = data.title;
    updateMovieDetails(data);
}).catch(error => console.log(`Error: ${error}`))

//call API requesting details about cast and crew
fetch(BASE_URL + '/movie/' + movieID.toString() + '/credits?' + API_KEY)
.then(response => response.json())
.then(data => {
    console.log(data);
    updateMovieCredits(data);
}) 

//call API requesting videos related to the movie
fetch(VIDEO_URL)
.then(response => response.json())
.then(data => {
    console.log(data);
    updateMovieVideos(data);
})
.catch(error => console.log(`Error: ${error}`))

//update details about movies: genres, image, description, release date, revenue, rating, & runtime
function updateMovieDetails(data) {
    let genreHTML = ``;

    document.getElementById('movie-details-title').innerHTML = `${movieTitle}`;
    document.title = `Details | ${movieTitle}`;

    if(data.poster_path === null) {
        document.getElementById('movie-image').src = 'movie-poster-placeholder.jpg';
    } else {
        document.getElementById('movie-image').src = IMG_URL + data.poster_path;
    }

    data.genres.forEach(genre => {
        genreHTML += `<span class="badge rounded-pill bg-info" style="font-size: large;">${genre.name}</span>`;
    });
    document.getElementById('movie-genres').innerHTML = genreHTML;

    document.getElementById('movie-description').innerHTML = `<p class="fs-6">${data.overview}</p>`;
    document.getElementById('release-date').innerHTML = `Release Date: ${data.release_date}`;

    if(data.runtime <= 0) {
        document.getElementById('runtime').innerHTML = `Runtime: unknown`;
    } else {
        document.getElementById('runtime').innerHTML = `Runtime: ${data.runtime.toString()} min`;
    }

    if(data.vote_count === 0) {
        document.getElementById('rating').innerHTML = `Rating: no rating`;
    } else {
        document.getElementById('rating').innerHTML = `Rating: ${data.vote_average.toFixed(1).toString()} / 10`;
    }

    if(data.revenue === 0) {
        document.getElementById('revenue').innerHTML = `Revenue: unknown`;
    } else {
        document.getElementById('revenue').innerHTML = `Revenue: $${data.revenue.toLocaleString()}`;
    }
}

//update director, writers, and main cast
function updateMovieCredits(data) {
    let castHTML = `Main Cast: `;
    let castCount = 0;

    data.cast.forEach(cast => {
        if(castCount < 3) {
            if(castCount >= 1) {
                castHTML += ` | `;
            }
            castHTML += `${cast.name}`;
        }
        castCount++;
    });

    let directorHTML = `Director: `;
    let writerHTML = `Writers: `;

    let numWriters = 0;
    let numDirectors = 0;

    data.crew.forEach(crew => {
        if(crew.job === 'Director') {
            if(numDirectors >= 1) {
                directorHTML += ` | `;
            }
            directorHTML += `${crew.name} `;
            numDirectors++;
        }

        if(crew.job === 'Writer' || crew.job === 'Screenplay') {
            if(numWriters >= 1) {
                writerHTML += ` | `;
            }
            writerHTML += `${crew.name}`;
            numWriters++;
        }
    });

    document.getElementById('director').innerHTML = directorHTML;
    document.getElementById('writers').innerHTML = writerHTML;
    document.getElementById('main-cast').innerHTML = castHTML;
}

function updateMovieVideos(data) {
    let videosHTML = ``;
    document.getElementById('videosModalLabel').innerHTML = `${movieTitle} Videos`;
    data.results.forEach(video => {
        videosHTML += `<iframe class="m-4 border border-3 shadow-lg" id="movie-trailer" 
                        src="https://www.youtube.com/embed/${video.key}" width="450px" height="253px" allow="fullscreen">
                        </iframe>`;
        if(video.type === 'Trailer'){
            document.getElementById('movie-trailer').src = `https://www.youtube.com/embed/${video.key}`;
        }
    });
    if(data.results.length > 1) {
    document.getElementById('more-videos-text').innerHTML = `${(data.results.length).toString()} videos`;
    } else if(data.results.length === 1) {
        document.getElementById('more-videos-text').innerHTML = `1 video`;
    } else {
        document.getElementById('more-videos-text').innerHTML = `0 videos`;
    }
    document.getElementById('videos-modal-body').innerHTML = videosHTML;
}