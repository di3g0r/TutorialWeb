const http = require('node:http');

const server = http.createServer( 
    function (sol, res){

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials&client_id=d9ecb08e08b6401884917bc8be38b1ca&client_secret=5953508c83af4749a6cf814558cea792'
        
        };

        const endpoint_spotify="https://accounts.spotify.com/api/token";

        const endpoint_artist = "https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg";

        const endpoint_search = `https://api.spotify.com/v1/search?q=${encodeURIComponent('LuisMiguel')}&type=artist`;
        cats(res);

        fetch(endpoint_spotify, requestOptions).then(function (r){
            console.log(r);
            return r.json();
            
    }).then(function(j){
            token = j.access_token;
            const artistOptions = {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };

            return fetch(endpoint_artist, artistOptions);

    }).then(function (response) {
        if (response.ok) {
            console.log(response);
            return response.json();
        } else {
            throw new Error('Error al obtener información del artista');
        }
    })
    .then(function datos(artistData) {

        const artistName = artistData.name;
        const artistGenres = artistData.genres;
        const artistFollowers = artistData.followers.total;

        const imageSrc = artistData.images[0].url;
        const imageHeight = artistData.images[0].height;
        const imageWidth = artistData.images[0].width;

        const html = `
            <h1>${artistName}</h1>
            <img src="${imageSrc}" alt="${artistName}">
            <p>G&ecircneros: ${artistGenres.join(', ')}</p>  

        `; //&ecirc es para ponerle acento a la e

        //res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html);
        return recommendation(artistName, artistGenres);
    }).then(function(recommendations) {
        res.write('<h2>Recomendaciones:</h2>');
        recommendations.forEach(function(rec) {
            res.write(`<p>${rec}</p>`);
        });
        res.end();
    })
    .catch(function (error) {
        res.write('Error en el servidor: ' + error.message);
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

function cats(res){
    const cat_options= {
        header:{
            'x-api-key' : 'live_03VcLi46BwSYZDyZMltD2y5ZzhSQCMO5L8wcU7e5TeIJUg3ZXokuKQOFS2ntXFhx'
        }
    };

    const endpoint_cats = 'https://api.thecatapi.com/v1/images/search';

    fetch(endpoint_cats, cat_options).then(function(respuesta){
        return respuesta.json();
    }).then(function data(r){
        console.log(r);
        return r;
    }).then(function gatito(j){
        imagen = j[0].url;

        const html = `
            <img src="${imagen}">
        `; 

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html);
        //res.end();
    })


}


server.listen(3000, '127.0.0.1', function() {
    
    console.log("Servidor corriendo");
  });
