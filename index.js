// If the user isn't logged in on first load, they're prompted to.
(function () {
  if (window.location.href.includes("#access_token") != true) {
    console.log("Auth: No #access_token found in URL string. Displaying log in module.");
  } else {
    console.log("Auth: #access_token found in URL string. Hiding log in module")
    document.getElementById("signIn").classList.add("is-hidden")
    document.getElementById("form").classList.remove("is-hidden");
    document.getElementById("results").classList.remove("is-hidden");
  }
})();

// Derives the track/album ID from the URI
function getTrackOrAlbumId() {
  let input = document.getElementById("itemCode").value.trim();
  if (input.startsWith("open.spotify.com")) {
    let input = "https://" + input;
  }
  let url;
  try {
    url = new URL(input);
  } catch (_) {
    return [null, `Failed to recognize a URI/URL: ${input}`];
  }
  url.search = "";
  const path = url.pathname;
  if (url.protocol === "spotify:") {
    // Spotify internal URI
    if (path.startsWith("album:")) {
      return [path.replace(/^album:/, ""), "album"];
    }
    if (path.startsWith("track:")) {
      return [path.replace(/^track:/, ""), "track"];
    }
    return [null, "Spotify URI is found, but it's not a album or track."];
  }
  if (url.protocol === "https:" || url.protocol === "http:") {
    // Spotify URL
    if (path.startsWith("/album/")) {
      return [path.replace(/^\/album\//,""), "album"];
    }
    if (path.startsWith("/track/")) {
      return [path.replace(/^\/track\//,""), "track"];
    }
    return [null, "Spotify URL is found, but it's not a album or track URL."];
  }
  console.error(msg);
  return [null, `Neither "spotify:track:", "spotify:album:", "https://open.spotify.com/track/", or "https://open.spotify.com/album/" were found in the input: ${input}`];
}

function encodeText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function query() {
  // Sets the user access token as returned by Spotify Web API
  const urlHash = window.location.hash.substring(1).split("&").reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

  const accessToken = urlHash.access_token;

  const trackOrAlbumId = getTrackOrAlbumId();

  if (trackOrAlbumId[0] === null) {
    console.error(trackOrAlbumId[1]);
    document.getElementById("errorTitle").innerText = "Kira is having trouble finding a Spotify item with your input.";
    document.getElementById("errorBody").innerText = trackOrAlbumId[1];
    document.getElementById("errorSection").classList.remove("is-hidden");
    return;
  }

  let error = false;

  const resp = await fetch(`https://api.spotify.com/v1/${trackOrAlbumId[1]}s/${trackOrAlbumId[0]}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).catch((err) => {
    console.error("There was an error: a connection could not be made to the Spotify Web API. It may be unavailable right now.");
    document.getElementById("errorTitle").innerText = "Kira can't reach Spotify right now.";
    document.getElementById("errorBody").innerText = "Something's happened and Kira isn't able to reach Spotify's servers right now. Try again a little bit later, or reload the page?";
    document.getElementById("errorSection").classList.remove("is-hidden");
    error = true;
  }).then(x => {
    if (x === undefined) return;
    if (x.status >= 400) {
      console.error("There was an error: connection made, but returned an error status code: " + this.status + ".");
      document.getElementById("errorTitle").innerText = "Kira is having a few issues right now.";
      document.getElementById("errorBody").innerText = "Something has happened when talking to Spotify and an error was thrown (" + this.status + "). Try again a little bit later?";
      document.getElementById("errorSection").classList.remove("is-hidden");
      error = true;
      return null;
    }
    return x.json();
  });

  if (error) return;

  const name = encodeText(resp.name);
  const artists = encodeText(resp.artists.map(x => x.name).slice(0,2).join(", "));
  const artistsEtc = resp.artists.length > 2;
  const markets = resp.available_markets;
  if (markets.length == 0) {
    console.error("There was an error: track is relinked.");
    document.getElementById("errorTitle").innerText = "Kira isn't able to process this track right now.";
    document.getElementById("errorBody").innerText = "The way that Spotify stores this track metadata means that Kira isn't able to get the countries where this track is available just yet. I'm working on finding a way, but for now, you may need to use another tool instead";
    document.getElementById("errorSection").classList.remove("is-hidden");
    if (document.getElementById("results").classList.contains("is-hidden") !== true) {
      document.getElementById("results").classList.add("is-hidden");
    }
  } else {
    document.getElementById("results").classList.remove("is-hidden");
    document.getElementById("markets-label").innerHTML = 
      `<strong>${name}</strong> by <strong>${artists}${artistsEtc ? " etc." : ""}</strong> can be streamed in ${markets.length} countries:`;
    document.getElementById("markets").innerHTML = "";
    markets.map(x => countries[x]).sort().map(country => {
      const item = document.createElement("li");
      item.innerHTML = country;
      document.getElementById("markets").appendChild(item);
    })
  }   
}

const countries = {
  "AF": "Afghanistan",
  "AL": "Albania",
  "DZ": "Algeria",
  "AS": "American Samoa",
  "AD": "Andorra",
  "AO": "Angola",
  "AI": "Anguilla",
  "AQ": "Antarctica",
  "AG": "Antigua and Barbuda",
  "AR": "Argentina",
  "AM": "Armenia",
  "AW": "Aruba",
  "AU": "Australia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BS": "Bahamas",
  "BH": "Bahrain",
  "BD": "Bangladesh",
  "BB": "Barbados",
  "BY": "Belarus",
  "BE": "Belgium",
  "BZ": "Belize",
  "BJ": "Benin",
  "BM": "Bermuda",
  "BT": "Bhutan",
  "BO": "Bolivia",
  "BQ": "Bonaire, Sint Eustatius and Saba",
  "BA": "Bosnia and Herzegovina",
  "BW": "Botswana",
  "BV": "Bouvet Island",
  "BR": "Brazil",
  "IO": "British Indian Ocean Territory",
  "BN": "Brunei Darussalam",
  "BG": "Bulgaria",
  "BF": "Burkina Faso",
  "BI": "Burundi",
  "CV": "Cabo Verde",
  "KH": "Cambodia",
  "CM": "Cameroon",
  "CA": "Canada",
  "KY": "Cayman Islands",
  "CF": "Central African Republic",
  "TD": "Chad",
  "CL": "Chile",
  "CN": "China",
  "CX": "Christmas Island",
  "CC": "Cocos (Keeling) Islands",
  "CO": "Colombia",
  "KM": "Comoros",
  "CD": "Democratic Republic of the Congo",
  "CG": "Congo",
  "CK": "Cook Islands",
  "CR": "Costa Rica",
  "HR": "Croatia",
  "CU": "Cuba",
  "CW": "Curaçao",
  "CY": "Cyprus",
  "CZ": "Czechia",
  "CI": "Côte d'Ivoire",
  "DK": "Denmark",
  "DJ": "Djibouti",
  "DM": "Dominica",
  "DO": "Dominican Republic",
  "EC": "Ecuador",
  "EG": "Egypt",
  "SV": "El Salvador",
  "GQ": "Equatorial Guinea",
  "ER": "Eritrea",
  "EE": "Estonia",
  "SZ": "Eswatini",
  "ET": "Ethiopia",
  "FK": "Falkland Islands",
  "FO": "Faroe Islands",
  "FJ": "Fiji",
  "FI": "Finland",
  "FR": "France",
  "GF": "French Guiana",
  "PF": "French Polynesia",
  "TF": "French Southern Territories",
  "GA": "Gabon",
  "GM": "Gambia",
  "GE": "Georgia",
  "DE": "Germany",
  "GH": "Ghana",
  "GI": "Gibraltar",
  "GR": "Greece",
  "GL": "Greenland",
  "GD": "Grenada",
  "GP": "Guadeloupe",
  "GU": "Guam",
  "GT": "Guatemala",
  "GG": "Guernsey",
  "GN": "Guinea",
  "GW": "Guinea-Bissau",
  "GY": "Guyana",
  "HT": "Haiti",
  "HM": "Heard Island and McDonald Islands",
  "VA": "Holy See",
  "HN": "Honduras",
  "HK": "Hong Kong",
  "HU": "Hungary",
  "IS": "Iceland",
  "IN": "India",
  "ID": "Indonesia",
  "IR": "Iran",
  "IQ": "Iraq",
  "IE": "Ireland",
  "IM": "Isle of Man",
  "IL": "Israel",
  "IT": "Italy",
  "JM": "Jamaica",
  "JP": "Japan",
  "JE": "Jersey",
  "JO": "Jordan",
  "KZ": "Kazakhstan",
  "KE": "Kenya",
  "KI": "Kiribati",
  "KP": "Democratic People's Republic of Korea",
  "KR": "Republic of Korea",
  "KW": "Kuwait",
  "KG": "Kyrgyzstan",
  "LA": "Lao People's Democratic Republic",
  "LV": "Latvia",
  "LB": "Lebanon",
  "LS": "Lesotho",
  "LR": "Liberia",
  "LY": "Libya",
  "LI": "Liechtenstein",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "MO": "Macao",
  "MG": "Madagascar",
  "MW": "Malawi",
  "MY": "Malaysia",
  "MV": "Maldives",
  "ML": "Mali",
  "MT": "Malta",
  "MH": "Marshall Islands",
  "MQ": "Martinique",
  "MR": "Mauritania",
  "MU": "Mauritius",
  "YT": "Mayotte",
  "MX": "Mexico",
  "FM": "Micronesia",
  "MD": "Moldova",
  "MC": "Monaco",
  "MN": "Mongolia",
  "ME": "Montenegro",
  "MS": "Montserrat",
  "MA": "Morocco",
  "MZ": "Mozambique",
  "MM": "Myanmar",
  "NA": "Namibia",
  "NR": "Nauru",
  "NP": "Nepal",
  "NL": "Netherlands",
  "NC": "New Caledonia",
  "NZ": "New Zealand",
  "NI": "Nicaragua",
  "NE": "Niger",
  "NG": "Nigeria",
  "NU": "Niue",
  "NF": "Norfolk Island",
  "MK": "North Macedonia",
  "MP": "Northern Mariana Islands",
  "NO": "Norway",
  "OM": "Oman",
  "PK": "Pakistan",
  "PW": "Palau",
  "PS": "Palestine, State of",
  "PA": "Panama",
  "PG": "Papua New Guinea",
  "PY": "Paraguay",
  "PE": "Peru",
  "PH": "Philippines",
  "PN": "Pitcairn",
  "PL": "Poland",
  "PT": "Portugal",
  "PR": "Puerto Rico",
  "QA": "Qatar",
  "RO": "Romania",
  "RU": "Russian Federation",
  "RW": "Rwanda",
  "RE": "Réunion",
  "BL": "Saint Barthélemy",
  "SH": "Saint Helena, Ascension and Tristan da Cunha",
  "KN": "Saint Kitts and Nevis",
  "LC": "Saint Lucia",
  "MF": "Saint Martin",
  "PM": "Saint Pierre and Miquelon",
  "VC": "Saint Vincent and the Grenadines",
  "WS": "Samoa",
  "SM": "San Marino",
  "ST": "Sao Tome and Principe",
  "SA": "Saudi Arabia",
  "SN": "Senegal",
  "RS": "Serbia",
  "SC": "Seychelles",
  "SL": "Sierra Leone",
  "SG": "Singapore",
  "SX": "Sint Maarten",
  "SK": "Slovakia",
  "SI": "Slovenia",
  "SB": "Solomon Islands",
  "SO": "Somalia",
  "ZA": "South Africa",
  "GS": "South Georgia and the South Sandwich Islands",
  "SS": "South Sudan",
  "ES": "Spain",
  "LK": "Sri Lanka",
  "SD": "Sudan",
  "SR": "Suriname",
  "SJ": "Svalbard and Jan Mayen",
  "SE": "Sweden",
  "CH": "Switzerland",
  "SY": "Syrian Arab Republic",
  "TW": "Taiwan",
  "TJ": "Tajikistan",
  "TZ": "Tanzania, the United Republic of",
  "TH": "Thailand",
  "TL": "Timor-Leste",
  "TG": "Togo",
  "TK": "Tokelau",
  "TO": "Tonga",
  "TT": "Trinidad and Tobago",
  "TN": "Tunisia",
  "TR": "Turkey",
  "TM": "Turkmenistan",
  "TC": "Turks and Caicos Islands",
  "TV": "Tuvalu",
  "UG": "Uganda",
  "UA": "Ukraine",
  "AE": "United Arab Emirates",
  "GB": "United Kingdom of Great Britain and Northern Ireland",
  "UM": "United States Minor Outlying Islands",
  "US": "United States of America",
  "UY": "Uruguay",
  "UZ": "Uzbekistan",
  "VU": "Vanuatu",
  "VE": "Venezuela",
  "VN": "Viet Nam",
  "VG": "Virgin Islands, British",
  "VI": "Virgin Islands, U.S.",
  "WF": "Wallis and Futuna",
  "EH": "Western Sahara*",
  "YE": "Yemen",
  "ZM": "Zambia",
  "ZW": "Zimbabwe",
  "AX": "Åland Islands",
  // see #9
  "XK": "Kosovo"
};