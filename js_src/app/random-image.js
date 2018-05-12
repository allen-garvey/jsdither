/**
 * Module for getting random images using unsplash api
 */

 App.RandomImage = (function(Constants, Fs){
    let randomImageQueue = [];
    let currentQueueIndex = 0;

    //from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
          // Pick a remaining element...
          const randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          const temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }

    function loadRandomImageData(){
        return fetch(Constants.unsplashApiUrl).then((res)=>{ 
            return res.json();
        }).then((imageArray)=>{
            randomImageQueue = shuffle(imageArray.map((image, i)=>{
                image.id = i;
                return image;
            }));
        });
    }

    function getNextRandomImage(){
        const imageData = randomImageQueue[currentQueueIndex];
        currentQueueIndex++;
        if(currentQueueIndex >= randomImageQueue.length){
            currentQueueIndex = 0;
        }
        return imageData;
    }
    
    //returns promise
    function getRandomImage(imageWidthHint, imageHeightHint){
        if(randomImageQueue.length < 1){
            return loadRandomImageData().then(()=>{
                return openRandomImage(getNextRandomImage(), imageWidthHint, imageHeightHint);
            });
        }
        else{
            return openRandomImage(getNextRandomImage(), imageWidthHint, imageHeightHint);
        }
    }

    function openRandomImage(randomImageData, imageWidthHint, imageHeightHint){
        //small image url width is generally <= 400px
        //regular image url width is generally > 900px
        const imageUrl = imageWidthHint > 800 ? randomImageData.urls.regular : randomImageData.urls.small;
        return Fs.openImageUrl(imageUrl).then(({image, file})=>{
            file.name = 'unsplash-random-image';
            file.unsplash = randomImageData;
            return {
                image,
                file,
            };
        });
    }
    
    
    return {
        get: getRandomImage,
    };
    
 })(App.Constants, App.Fs);