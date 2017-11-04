var request = require("request");
var moment = require("moment");
var fs = require("fs");
var Twitter=require('twitter');
var spotify = require('node-spotify-api');
//Import our Keys File
var keys = require('./keys.js');

// console.log(keys.twitterKeys.consumer_secret);

// Storing twitter keys in A variable

var twitterDetails = {
	consumer_key : keys.twitterKeys.consumer_key,
	consumer_secret : keys.twitterKeys.consumer_secret,
	access_token_key : keys.twitterKeys.access_token_key,
	access_token_secret : keys.twitterKeys.access_token_secret
};
 
 var client=new Twitter(twitterDetails);
 // console.log('twitter client : ' + twitterDetails.access_token_key);

 var spotifyDetails = {
 	id : keys.spotifyKeys.id,
 	secret : keys.spotifyKeys.secret
 };

//Create a Spotify Client
var spotifyapi = new spotify(spotifyDetails);

//command contains one of the four options
var runtxt = '------------------------------------\nnode liri.js '
var command = process.argv[2];
var parameter=[];
for (var i=3;i<process.argv.length;i++)
	parameter.push(process.argv[i]);

//log the user input command to the log file
fs.appendFile("log.txt", runtxt + command + ' ' + parameter.join(' ') + '\n',
function(err) {
if (err) 
	console.log(err);
})

selectAction(command,parameter);



//Function to choose the option based on user command
function selectAction(operation, inputInfo) {

	if (operation === undefined)
		operation = '';
	// console.log('operation :' + operation);

	switch (operation.toLowerCase()) {

		// node liri.js my-tweets
		case "my-tweets" 	: getTweetDetails(inputInfo);
							  break;

		// node liri.js spotify-this-song '<song name here>'
		case "spotify-this-song"
							: getSongDetails(inputInfo);
							  break;

		// node liri.js movie-this '<movie name here>'
		case "movie-this"	: getMovieDetails(inputInfo);
							  break;	

		// node liri.js do-what-it-says
		case "do-what-it-says"
							: getRandomTxtInstn();
							  break;

		default 			: console.log("Valid format : node liri.js my-tweets/spotify-this-song <song name>/movie-this <movie name>/do-what-it-says");
							  fs.appendFile("log.txt", "Valid format : node liri.js my-tweets/spotify-this-song <song name>/movie-this <movie name>/do-what-it-says \n",
							  function(err) {
								if (err) 
									console.log(err);
							  })
							  break;
	}
}

function getTweetDetails(screenName) {

	// if (screenName === '')
	// 	screenName = 'realDonaldTrump';

	
	var params = {screen_name: screenName, count:20};


	//call to fetch tweets with given screen_name
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
  		if (!error) {
  			// console.log('Array 1 : ' + JSON.stringify(tweets[1],null,4));
  			console.log('****************************');
  			fs.appendFile("log.txt", '****************************\n',
  				function(err) {
				if (err) 
					console.log(err);
				})
	        
  			for (var i =0;i<tweets.length;i++) {
  				console.log(moment(tweets[i].created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('llll'));
    			console.log(tweets[i].text);
    			console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	  			
	  			fs.appendFile("log.txt", moment(tweets[i].created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('llll') +'\n'+
	  							tweets[i].text +'\n'+
	  							'~~~~~~~~~~~~~~~~~~~~~~~~~~~~'+'\n',
	  				function(err) {
					if (err) 
						console.log(err);
					})
  			} 

  			console.log('****************************');
  			fs.appendFile("log.txt", '****************************\n',
  				function(err) {
				if (err) 
					console.log(err);
				})
  		}
	});
}


function getSongDetails(songName) {

 // console.log(songName)

	var songNameString = songName.join(" ");
	if (songNameString === '') {
	 	songNameString = 'ace of base';
	}

// console.log('songNameString : ' + songNameString);
	spotifyapi.search({ type: 'track', query: songNameString}, function(err, data) {
	    if ( err ) {
	        console.log('Error occurred: ' + err);
	        // console.log('data :'+data);
	        fs.appendFile("log.txt", '****************************\n'+
				 'Error: ' + err + '\n' +
				'****************************\n',
			function(err) {
			if (err) 
				console.log(err);
			})
	        return;
	    }
	    	 // console.log(data.tracks.items[0]);
	    console.log('****************************');
	    console.log('Artist name : ' + data.tracks.items[0].artists[0].name);
	    console.log('Song name : ' + data.tracks.items[0].name);
	    console.log('Album name : ' + data.tracks.items[0].album.name);
	    console.log('Preview URL : ' + data.tracks.items[0].preview_url);
		console.log('****************************');

		fs.appendFile("log.txt", '****************************\n'+
						'Artist name : ' + data.tracks.items[0].artists[0].name + '\n'+
						'Song name : ' + data.tracks.items[0].name + '\n' +
						'Album name : ' + data.tracks.items[0].album.name + '\n' +
						'Preview URL : ' + data.tracks.items[0].preview_url + '\n' +
						'****************************\n',
		function(err) {
		if (err) 
			console.log(err);
		})	
	})

}




function getMovieDetails(movieName) {

	var movieNameString = movieName.join("+");
// console.log(movieNameString)
	if (movieNameString === '') {
		movieNameString = 'mr.nobody';
		console.log('If you haven\'t watched \'Mr. Nobody,\' then you should. http://www.imdb.com/title/tt0485947/');
		console.log('It\'s on Netflix!');
		fs.appendFile("log.txt", 'If you haven\'t watched \'Mr. Nobody,\' then you should. http://www.imdb.com/title/tt0485947/\nIt\'s on Netflix!\n',
		function(err) {
		if (err) 
			console.log(err);
		})
	}
	var queryUrl = "http://www.omdbapi.com/?t=" + movieNameString + "&tomatoes=true&apikey=40e9cece";

	request(queryUrl, function(err,response,body){
			if (!err && (response.statusCode == 200)) {
				var data = JSON.parse(body);

				var rating=data["Ratings"];
				// console.log('rating :' + JSON.stringify(rating)	+ ' l  ' + rating.length);

				function checkRating() {

					var rottenRating = 0
					// return rating.Source === "Rotten Tomatoes";
					for (var i=0;i<rating.length;i++)
						if (rating[i]["Source"] === "Rotten Tomatoes")
							rottenRating = i;
					return (rottenRating);
				}
				// console.log('data.Ratings :' + (data["Ratings"].Source === "Rotten Tomatoes"));
				// Movie data Present
				if (data.Response == 'True') {
					console.log('****************************');
					console.log('Title: '+ data.Title);
					console.log('Released in: '+ data.Year);
					console.log('Rated: '+ data.Rated);
					console.log('Country: '+ data.Country);
					console.log('Language: '+ data.Language);
					console.log('Plot: '+ data.Plot);
					console.log('Actors: '+ data.Actors);				
					// console.log('Rotten Tomatoes Rating: '+ data.Ratings.find(checkRating).Value);
// console.log('Rotten Rating : ' + checkRating() + '           ' + rating[checkRating()]["Value"]);
					// var rRating = 
					console.log('Rotten Tomatoes Rating: ' +  (checkRating() ? rating[checkRating()]["Value"] : data.tomatoRating));
					console.log('Rotten Tomatoes URL: '+ data.tomatoURL);
					console.log('****************************')
					// console.log(data);

					fs.appendFile("log.txt", '****************************\n'+
									'Title: '+ data.Title + '\n'+
									'Released in: '+ data.Year + '\n'+
									'Rated: '+ data.Rated + '\n'+
									'Country: '+ data.Country + '\n'+
									'Language: '+ data.Language + '\n'+
									'Plot: '+ data.Plot + '\n'+
									'Actors: '+ data.Actors + '\n'+
									'Rotten Tomatoes Rating: '+ (checkRating() ? rating[checkRating()]["Value"] : data.tomatoRating) + '\n'+
									'Rotten Tomatoes URL: '+ data.tomatoURL  + '\n'+
									'****************************\n',
					function(err) {
					if (err) 
						console.log(err);
					})	
				}				
				else {
					//Movie name not in OMDB
					console.log('****************************');
					console.log('Error: '+ data.Error);
					console.log('****************************');

					fs.appendFile("log.txt", '****************************\n'+
									'Error: ' + data.Error + '\n' +
									'****************************\n',
					function(err) {
					if (err) 
						console.log(err);
					})
				}

			}

	})
	
}

function getRandomTxtInstn() {

	// Read random.txt, data contains entire content of file
	fs.readFile("random.txt","utf-8",function(error,data) {
	if (error) {
		console.log('ERROR : Reading random.txt '+error);
		return;
	} else {
				var fileData = data.split(",");
				fileData[0]=fileData[0].trim();
				fileData[1]=fileData[1].trim().replace(/\"/g,"");

				console.log('Random file contains : '+fileData[0] + ' ' + fileData[1])
				fs.appendFile("log.txt", 'Random file contains : '+
								fileData[0] + ' ' + fileData[1] + '\n',
								function(err) {
								if (err) 
									console.log(err);
								})	
				selectAction(fileData[0],fileData[1].split(' '));
				}		
	})
}