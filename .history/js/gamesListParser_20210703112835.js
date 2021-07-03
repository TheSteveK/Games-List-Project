let pathSearch = 0;

function gamesListParser(){



    // fetcher('https://raw.githubusercontent.com/Stothe/Games-List-Project/main/gamelist.xml')
    // .then(xml => {
    console.log("gamesListParser executing");
    const file = document.getElementById("odfxml").files[0];
    const fileData = await readFileAsync(file);
    console.log(fileData);
    let xmlData = $.parseXML(fileData);
    // special characters seem to be corrupting metadata.  Stripping those out fixes some but not all
    // https://www.w3schools.com/jsref/jsref_replace.asp
    // let xmlData = rawData.replace(/<thumbnail \/>/gi, "");
    //console.log(xmlData);
    // let xmlData = rawData;
      //loop through all games and parse data into Game objects
      $(xmlData).find('game').each(function(){

        //ES lists contain romname within a path, we need to extract the rom
        let path = $(this).find("path").text(); 
          path = path.split("/");
          let pathNode = path.length - 1;
          path = path[pathNode];
          path = path.split(".");
          let $amName = path[0];
        
        let $title = $(this).find("name").text();
        // let $title = "placeholder";
        let $year = $(this).find("releasedate").text().substring(0, 4);
        let $manufacturer = $(this).find("publisher").text();
        let $category = $(this).find("genre").text();

        //Pulling out media paths in this function removes duplicate parsing from the findPaths function
        // wrapping in an IF statement so it can be set to only run until it gets a full path set.
        if(pathSearch === 0){
          let $marquee = $(this).find("marquee").text();
          let $video = $(this).find("video").text();

          // Even though Image is an attribute, it returns null, using an alternate method to find the image path
          // By testing different attributes and viewing objects this is the only way I can figure out how to
          // fish out the screenshot image.
          let $image = $(this).find("thumbnail")[0].childNodes[2];

            if($marquee && $video && $image){
              pathSearch =1;
              renderPaths($image, $marquee, $video);
            }

            
        }
        


  
        //create new Game object using the fields and add it to array
        // malformed entries seem to crap all over the list. Putting a check in
        // It appears special code in Description field is causing the issue ie &apos; 
        // The data is sanatized above, but some bad entries still creep in making this necessary
        if($title.length < 128) {
            
            games.push(new Game($amName, $title,  $year, $manufacturer, $category));
        } else {
            console.log("skipping " + $amName + " bad metadata detected" );
        }
        
     });
  
      $('.stat').text(games.length + " games processed ");
  
      // launch the file builder
    buildTXTList();
  }

  // Helper Functions

  /**
   * wrapping the local file XML fetching into a promise
   * h/t https://simon-schraeder.de/posts/filereader-async/
   */
   function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
  
      reader.onload = () => {
        resolve(reader.result);
        };
  
      reader.onerror = reject;
  
      reader.readAsBinaryString(file);
    })
  }
 


/**
 * Renders paths pulled from the game list as text on the index page
 * @arguements {string} (image, marquee, video)
 */
function renderPaths(image, marquee, video) {
  let paths = [image, marquee, video];

  for (let j=0; j < paths.length; j += 1) {
    paths[j] = paths[j].substring(0, paths[j].lastIndexOf("/"));
    $(".pathNotes").append(`<li>${paths[j]}</li>`)
   }
}

