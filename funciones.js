function spotifyAPI(){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials&client_id=d9ecb08e08b6401884917bc8be38b1ca&client_secret=5953508c83af4749a6cf814558cea792'
    };

    const endpoint_spotify = "https://accounts.spotify.com/api/token";

    fetch(endpoint_spotify, requestOptions)
        .then(function(r) {
            if (!r.ok) {
                throw new Error('Error al obtener el token de acceso');
            }
            return r.json();
        })
        .then(function(j) {
            const token = j.access_token;

            let artistName = document.getElementById("input-artist").value;
            const endpoint_search = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`;
            
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
                                document.getElementById("artist-name").textContent = artistData.name;
                                document.getElementById("artist-genres").textContent = "Géneros relacionados: " + artistData.genres.join(', ');
                                document.getElementById("artist-followers").textContent = "Seguidores: " + artistData.followers.total.toLocaleString('en-US');
                                document.getElementById("artist-img").setAttribute("src", artistData.images[0].url);
                                recommendation(artistData.name, artistData.genres);
                            });
                    } else {
                        throw new Error('No se encontraron artistas con ese nombre.');
                    }
                });
        })
        .catch(function(error) {
            console.log("Error:", error);
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
                "content": `Recomiendame 3 artistas basado en que me gusta ${artistName} y me gustan los siguientes géneros: ${artistGenres.join(', ')}. Porfavor
                la respuesta damela en un formato JSON, donde cada artista que recomiendes sea el valor y las claves para cada artista sean
                artista1 :  {nombre: su nombre, descripcion: descripcion del artista}, y así
                sucesivamente. Recomiendame unicamente 3 artistas por peticion por favor.`
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
                let respuesta = JSON.parse(choice.message.content);
                document.getElementById("artista1-id").textContent = respuesta.artista1.nombre;
                document.getElementById("artista1-desc").textContent = respuesta.artista1.descripcion;
                document.getElementById("artista2-id").textContent = respuesta.artista2.nombre;
                document.getElementById("artista2-desc").textContent = respuesta.artista2.descripcion;
                document.getElementById("artista3-id").textContent = respuesta.artista3.nombre;
                document.getElementById("artista3-desc").textContent = respuesta.artista3.descripcion;
                //document.getElementById("descripcion-gpt").textContent = choice.message.content;
                //console.log(respuesta.artista1.nombre);
            });
        });
    }

