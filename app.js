const http = require('node:http');

const server = http.createServer( 
    function (sol, res){

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials&client_id=d9ecb08e08b6401884917bc8be38b1ca&client_secret=5953508c83af4749a6cf814558cea792'
        
        };

        const endpoint_spotify="https://accounts.spotify.com/api/token";

        const endpoint_artist_id = "";

        const endpoint_artist = "https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb";
        fetch(endpoint_spotify, requestOptions).then(function (r){
            return r.json();
    }).then(function(j){
            //res.write(JSON.stringify(j));
            //console.log(j);
            token = j.access_token;
            const artistOptions = {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };

            return fetch(endpoint_artist, artistOptions);

    }).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error al obtener información del artista');
        }
    })
    .then(function (artistData) {

        const artistName = artistData.name;
        const artistGenres = artistData.genres;
        const artistFollowers = artistData.followers.total;

        const imageSrc = artistData.images[0].url;
        const imageHeight = artistData.images[0].height;
        const imageWidth = artistData.images[0].width;


        //const message = `Nombre del artista: ${artistName}\nGeneros: ${artistGenres.join(', ')}\nSeguidores: ${artistFollowers}`;

        const html = `
            <h1>${artistName}</h1>
            <img src="${imageSrc}" alt="${artistName}">
            <p>Géneros: ${artistGenres.join(', ')}</p>
        `;

        ///const html = `<h1>${artistName}</h1><img src="${imageSrc}" alt="${artistName}">`;

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    })
    .catch(function (error) {
        res.write('Error en el servidor: ' + error.message);
        res.end();
    });
});

server.listen(3000, '127.0.0.1', function() {
    
    console.log("Servidor corriendo");
  });
