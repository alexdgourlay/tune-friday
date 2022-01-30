import Discogs from "./discogs.mjs";

function matchNames(releases) {
  const string = "Tune Friday";
  const matches = string
    .split("")
    .map((char) => ({ character: char, release: undefined }));

  matches.forEach((match) => {
    let indexOfMatchedCharacter;
    const indexOfRelease = releases.findIndex((release) => {
      indexOfMatchedCharacter = release.title.indexOf(match.character);
      return indexOfMatchedCharacter > -1;
    });

    if (match.index === -1) {
      match.index = undefined;
      match.release = releases[indexOfRelease];
    } else {
      match.index = indexOfMatchedCharacter;
      match.release = releases[indexOfRelease];
      releases.splice(indexOfRelease, 1);
    }
  });
  return matches;
}

function createTitleSubstring(substring, className) {
  const substringEl = document.createElement("span");
  substringEl.classList.add("substring");
  substringEl.classList.add(className);

  substring.split("").map((char, index) => {
    const charEl = document.createElement("span");
    charEl.innerText = char;
    charEl.classList.add("character");
    if (className === "rear" && index === 0) {
      charEl.classList.add("highlight");
    } else {
      charEl.style.opacity = Math.min(index / substring.length / 2 + 0.2, 0.3);
    }

    substringEl.appendChild(charEl);
  });
  return substringEl;
}

function createTitle(match) {
  /* Create title container */
  const titleContainerEl = document.createElement("div");
  titleContainerEl.classList.add("title");

  if (!match.release) {
    titleContainerEl.appendChild(createTitleSubstring(match.character, "rear"));
  } else {
    const title = match.release.title;

    const frontTitle = title.substring(0, match.index);
    const frontTitleEl = createTitleSubstring(frontTitle, "front");
    titleContainerEl.appendChild(frontTitleEl);

    const rearTitle = title.substring(match.index);
    const rearTitleEl = createTitleSubstring(rearTitle, "rear");
    titleContainerEl.appendChild(rearTitleEl);
  }

  return titleContainerEl;
}

function setBackgroundImageURI(el, uri) {
  if (!uri) el.style.background = "none";
  el.style.background = `url('${uri}')`;
}

function initialisePoster() {
  const posterWidth = 1000;
  const posterHeight = 1412;

  const posterEl = document.getElementById("poster");
  posterEl.style.width = `${1000}px`;
  posterEl.style.height = `${1412}px`;

  const scalePoster = () => {
    const scale =
      window.innerHeight * (posterWidth / posterHeight) > window.innerWidth
        ? window.innerWidth / posterWidth
        : window.innerHeight / posterHeight;

    posterEl.style.transform = `scale(${0.8 * scale})`;
  };

  window.onresize = scalePoster;
  scalePoster();
}

async function generatePoster(artistName, discogs) {
  const artistsSearch = await discogs.searchForArtists(artistName);
  const artistID = artistsSearch.results[0].id.toString();

  const releases = await discogs.getArtistReleases(artistID);
  const matches = matchNames(releases.releases);

  const containerEl = document.getElementById("content");
  const albumImgEl = document.getElementById("album");

  matches.forEach((match) => {
    const titleEl = createTitle(match);

    if (!match.release) {
      containerEl.appendChild(titleEl);
      return;
    }

    const linkEl = document.createElement("a");
    linkEl.href = `https://www.discogs.com/release/${
      match.release.main_release || match.release.id
    }`;
    linkEl.target = "_blank";
    linkEl.appendChild(titleEl);
    containerEl.appendChild(linkEl);

    /* Pre-cache thumbnails */
    new Image().src = match.release.thumb;

    titleEl.onmouseover = () => {
      setBackgroundImageURI(albumImgEl, match.release.thumb);
      albumImgEl.style.visibility = "visible";
    };

    titleEl.onmouseleave = () => {
      setBackgroundImageURI(albumImgEl, null);
      albumImgEl.style.visibility = "hidden";
    };
  });
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

async function run() {
  initialisePoster();

  const discogs = new Discogs();

  const albumImgEl = document.getElementById("album");
  document.onmousemove = (event) => {
    albumImgEl.style.top = event.pageY;
    albumImgEl.style.left = event.pageX;
  };

  const inputEl = document.getElementById("input");
  const loadingEl = document.getElementById("loading");
  const generateButtonEl = document.getElementById("generate");
  const containerEl = document.getElementById("content");
  loadingEl.style.visibility = "hidden";

  generateButtonEl.onclick = () => {
    removeAllChildNodes(containerEl);
    loadingEl.style.visibility = "visible";
    generatePoster(inputEl.value, discogs).then(() => {
      loadingEl.style.visibility = "hidden";
    });
  };
}

window.onload = run;
