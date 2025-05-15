// with comments
console.log("js starts");
let currentSong=new Audio()
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds){
    if (isNaN(seconds) || seconds<0){
        return "00:00";
    }

    const minutes=Math.floor(seconds/60)
    const remainingSeconds=Math.floor(seconds%60)

    const formattedMinutes=String(minutes).padStart(2,"0");
    const formattedSeconds=String(remainingSeconds).padStart(2,"0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder=folder
    let a= await fetch(`songs/${folder}`)
    let response= await a.text();
    // console.log(response);
    // it is giving text of html so
    // now we need to parse it. not the good way the way we are doing it.

    let div=document.createElement("div")
    div.innerHTML=response;
    // console.log(div);
    let as=div.getElementsByTagName("a")
    // console.log(as);

    songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}`)[1])
        }
    }
    // return songs

    // show all songs in playlist
    let songUL=document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    // let firstdiv=document.querySelector(".info>div").innerHTML.split("-")
    // console.log(firstdiv);
    
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML+`<li>
                            <img class="invert" src="img/music.svg" alt="music">
                            <div class="info">
                                <div class="firstdiv">${song.replaceAll("%20"," ")}</div>
                                <div>${song.replaceAll("%20"," ").split("-")[1].replace(".mp3","")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="play">
                            </div>
                        </li>`; 
    }
    // .split("-")[0]
    // .split("-")[1].replace(".mp3","")

    // attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
// because we are not using backend thats why we are making like this. other wise we will take songs with apis

const playMusic=(track,pause=false)=>{
    // let audio=new Audio("/Video 84-Spotify/songs/"+track);
    // audio.play(); 
    currentSong.src=`/songs/${currFolder}`+track;
    // console.log(currentSong.src);
    if (!pause){
        currentSong.play(); 
        // by this only 1 song will be played
        play.src="img/pause.svg"

    }

    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

async function displayAlbums(){
    let a= await fetch(`/songs/`)
    let response= await a.text();
    let div=document.createElement("div")
    div.innerHTML=response;
    // console.log(div);
    let anchors=div.getElementsByTagName('a')
    let cardContainer=document.querySelector(".cardContainer")

    // anchors will come in a list 
    let array=Array.from(anchors)
    console.log(currFolder.replace("/",""));
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // let folderName = e.href.split("/").filter(part => part).pop();
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")){
                // console.log(e.href.split("/").slice(-2)[0]);
                // get metadata of folder
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder);
            // Get the metadata of the folder
            let a= await fetch(`/songs/${folder}/info.json`)
            let response= await a.json();
            console.log(response);
            cardContainer.innerHTML=cardContainer.innerHTML+`<div  data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <img src="songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div> `
        }
    }

    
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e);
        e.addEventListener("click",async item=>{
            // console.log(item.currentTarget,item.currentTarget.dataset);
            // console.log(item.target,item.target.dataset);
            // it was targettting image, text, and others. currenttarget targets the thing that is req/clicked
            songs=await getSongs(`${item.currentTarget.dataset.folder}/`) 
        })
    })
}

async function main(){
    // get the list of all songs
    await getSongs(`cs/`) // The reason console.log(song) is not logging anything meaningful in the console is because the getSongs() function is asynchronous and returns a promise, not the actual data. When you call getSongs() and log its result, you are logging the unresolved promise, not the resolved value.
    playMusic(songs[0],true)
    // console.log(songs);

    // Display all the albums on page
    displayAlbums()


    // attach an event listener to play,next and previous
    play.addEventListener("click",()=>{
        if (currentSong.paused){
            currentSong.play()
            play.src="img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime,currentSong.duration);

        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%"; 
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent+"%";
        currentSong.currentTime=(currentSong.duration*percent)/100;
    })

    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    // add an event listener to close button in sidebar
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    // add an event listener to previous song
    previous.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // ablove gives index of current song
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })

    // add an event listener next song
    next.addEventListener("click",()=>{
        // currentSong.pause()
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // ablove gives index of current song
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
    })

    // add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
        // my code
        if(currentSong.volume==0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("volume.svg","mute.svg")
        }
    })

    // add eventlistener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })

    
}
main()

