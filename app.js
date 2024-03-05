const http = require('node:http');

const server = http.createServer(function(sol, res) {

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials&client_id=d9ecb08e08b6401884917bc8be38b1ca&client_secret=5953508c83af4749a6cf814558cea792'
    };

    const endpoint_spotify = "https://accounts.spotify.com/api/token";
    const searchQuery = sol.url.split('?q=')[1];

    if (!searchQuery) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Por favor, proporciona un término de búsqueda.');
        return;
    }

    fetch(endpoint_spotify, requestOptions)
        .then(function(r) {
            if (!r.ok) {
                throw new Error('Error al obtener el token de acceso');
            }
            return r.json();
        })
        .then(function(j) {
            const token = j.access_token;
            const endpoint_search = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=artist`;

            const searchOptions = {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };

            return fetch(endpoint_search, searchOptions)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Error al realizar la búsqueda de artistas');
                    }
                    return response.json();
                })
                .then(function(artistData) {
                    const artistas = artistData.artists.items;
                    if (artistas.length > 0) {
                        const primerArtista = artistas[0];
                        const artistId = primerArtista.id;
                        const artistName = primerArtista.name;
                        const artistGenres = primerArtista.genres;
                        const imageSrc = primerArtista.images[0].url;

                        const artistEndpoint = `https://api.spotify.com/v1/artists/${artistId}`;
                        const artistOptions = {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            }
                        };

                        return fetch(artistEndpoint, artistOptions)
                            .then(function(response) {
                                if (!response.ok) {
                                    throw new Error('Error al obtener información del artista');
                                }
                                return response.json();
                            })
                            .then(function(artistData) {
                                return {
                                    name: artistName,
                                    genres: artistGenres,
                                    image: imageSrc,
                                    followers: artistData.followers.total
                                };
                            });
                    } else {
                        throw new Error('No se encontraron artistas con ese nombre.');
                    }
                });
        })
        .then(function(artistInfo) {
           /* const html = `
                <h1>${artistInfo.name}</h1>
                <img src="${artistInfo.image}" alt="${artistInfo.name}">
                <p>G&ecircneros: ${artistInfo.genres.join(', ')}</p>
                <p>Seguidores: ${artistInfo.followers}</p>
            `;

            
            //&ecirc es para ponerle acento a la e
            //res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            return recommendation(artistInfo.name, artistInfo.genres);
            //res.end();*/
            return {
                name: artistInfo.name,
                image : artistInfo.image,
                genres : artistInfo.genres.join(', '),
                followers : artistInfo.followers
            };
        })
        .catch(function(error) {
            //res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Error en el servidor: ' + error.message);
        })
        .then(function(recommendations) {
            res.write('<h2>Recomendaciones:</h2>');
            recommendations.forEach(function(rec) {
                res.write(`<p>${rec}</p>`);
            });
            res.end();
        })

});


function recommendation(artistName, artistGenres){
    const endpoint_ai = "https://api.openai.com/v1/chat/completions";
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                "role": "user",
                "content": `Recomiendame 3 artistas basado en que me gusta ${artistName} y me gustan los siguientes géneros: ${artistGenres.join(', ')}`
            }]
        })
    };

    return fetch(endpoint_ai, options).then(function(response){
        if (response.ok) {
            return response.json();
        }
        else{
            throw new Error('Error al obtener recomendaciones');
        }}).then(function(data) {
            return data.choices.map(function(choice) {
                return choice.message.content;
            });
        });
    }

function cats(){
    const cat_options= {
        header:{
            'x-api-key' : 'live_03VcLi46BwSYZDyZMltD2y5ZzhSQCMO5L8wcU7e5TeIJUg3ZXokuKQOFS2ntXFhx'
        }
    };

    const endpoint_cats = 'https://api.thecatapi.com/v1/images/search';

    return fetch(endpoint_cats, cat_options).then(function(respuesta){
        return respuesta.json();
    }).then(function (data){
        let image = document.getElementById("cat-image")
        image.setAttribute("src",data[0].url)
        return data[0].url;
    });
}


server.listen(3000, '127.0.0.1', function() {
    
    console.log("Servidor corriendo");
  });
