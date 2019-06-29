// If the user isn't logged in on first load, they're prompted to.
(function() {
  if (window.location.href.includes("#access_token") != true) {
    console.log("No #access_token found; showing prompt to login via Spotify Auth API.");
    document.getElementsByTagName("form")[0].style.display = "none";
    document.getElementById("auth-prompt").style.display = "";
  } else {
    console.log("$access_token found")
    document.getElementsByTagName("form")[0].style.display = "";
    document.getElementById("auth-prompt").style.display = "none";
  }
})();

// Derives the track ID from the URI
function getTrackId() {
  var trackInput = document.getElementById("identifier").value;
  var trackValue = "";
  if (trackInput.includes("spotify:track:")) {
    trackValue = trackInput.slice(14, 36);
  } else if (trackInput.includes("https://open.spotify.com/track/")) {
    trackValue = trackInput.slice(31, 53);
  } else (
    console.error("Neither \"spotify:track:\" or \"https://open.spotify.com/track/\" were found in the input:" + trackInput)
  )
  return trackValue;
}

function query(){
  // Sets the user access token as returned by Spotify Web API
  const urlHash = window.location.hash.substring(1).split("&").reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

  const accessToken = urlHash.access_token;

  var request = new XMLHttpRequest();
  request.open('GET', "https://api.spotify.com/v1/tracks/" + getTrackId(), true);
  request.setRequestHeader("Authorization", "Bearer " + accessToken)

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      console.log(this.response);
      var resp = JSON.parse(this.response);
      var track = resp.name;
      var artist = resp.artists[0].name;
      var markets = resp.available_markets;

      if (markets.toString() === "") {
        console.error("There was an error: track is relinked.")
        document.getElementById("markets-label").innerHTML = "<h3>It looks like something has gone wrong.</h3><br>Kira isn't able to tell where this track can be streamed right now."
        document.getElementById("markets").style.display = "none";
      } else {
        document.getElementById("markets-label").innerHTML = "<strong>" + track + "</strong> by <strong>" + artist + "</strong> can be streamed in " + markets.length + " countries:";
        document.getElementById("markets").style.display = "";
        document.getElementById("markets").innerHTML = "";
        for (var i = 0; i < markets.length; i++) {
          let country = countries[markets[i]];
          const item = document.createElement("li");
          item.innerHTML = country;
          document.getElementById("markets").appendChild(item);
        }
      }
    } else {
      console.error("There was an error: connection made, but returned an error status code.");
      document.getElementById("markets-label").innerHTML = "<h3>It looks like something has gone wrong.</h3><br>Something has happened when talking to Spotify. Try again a little bit later?"
      document.getElementById("markets").style.display = "none";
    }
  };

  request.onerror = function() {
    console.error("There was an error: a connection could not be made to the Spotify Web API. It may be unavailable right now.");
    document.getElementById("markets-label").innerHTML = "<h3>It looks like something has gone wrong.</h3>Kira wasn't able to get in touch with Spotify. Try again a little bit later?"
    document.getElementById("markets").style.display = "none";
  };

  request.send();
}

const countries = {
  // Asia
  AU: "Australia",
  JP: "Japan",
  IL: "Israel",
  HK: "Hong Kong",
  ID: "Indonesia",
  MY: "Malaysia",
  NZ: "New Zealand",
  PH: "Philippines",
  SG: "Singapore",
  TW: "Taiwan",
  TH: "Thailand",
  VN: "Vietnam",
  IN: "India",
  // Europe
  AD: "Andorra",
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GR: "Greece",
  HU: "Hungary",
  IS: "Iceland",
  IE: "Ireland",
  IT: "Italy",
  LV: "Latvia",
  LI: "Liechtenstien",
  LT: "Lithuania",
  LU: "Luxembourg",
  MT: "Malta",
  MC: "Monaco",
  NL: "Netherlands",
  NO: "Norway",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SK: "Slovakia",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  TR: "Turkey",
  GB: "United Kingdom",
  // Latin America and the Caribbean
  AR: "Argentina",
  BO: "Bolivia",
  BR: "Brazil",
  CL: "Chile",
  CO: "Colombia",
  CR: "Costa Rica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  SV: "El Savador",
  GT: "Guatamala",
  HN: "Honduras",
  MX: "Mexico",
  NI: "Nicaragua",
  PA: "Panama",
  PY: "Paraguy",
  PE: "Peru",
  UY: "Uruguay",
  // North America
  CA: "Canada",
  US: "United States",
  // Africa
  ZA: "South Africa",
  // MENA
  DZ: "Algeria",
  BH: "Bahrain",
  EG: "Egypt",
  JO: "Jordan",
  KW: "Kuwait",
  LB: "Lebanon",
  MA: "Morocco",
  OM: "Oman",
  PS: "Palestine",
  QA: "Qatar",
  SA: "Saudi Arabia",
  TN: "Tunisia",
  AE: "United Arab Emirates"
};