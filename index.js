// If the user isn't logged in on first load, they're prompted to.
(function () {
  if (window.location.href.includes("#access_token") != true) {
    console.log("No #access_token found; showing prompt to login via Spotify Auth API.");
    document.getElementById("signIn").style.display = "";
  } else {
    console.log("#access_token found")
    document.getElementById("signIn").innerHTML =
      `<h2 id="error-title"></h2> <p id="error-body"></p>`;
    document.getElementById("signIn").style.display = "none";
    document.getElementById("form").style.display = "";
    document.getElementById("results").style.display = "";
  }
})();

// Derives the track/album ID from the URI
function getTrackOrAlbumId() {
  let input = document.getElementById("identifier").value.trim();
  if (input.startsWith("open.spotify.com")) {
    input = "https://" + input;
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
    document.getElementById("error-title").innerText = "Kira can't recognize your input.";
    document.getElementById("error-body").innerText = trackOrAlbumId[1];
    document.getElementById("signIn").style.display = "";
    document.getElementById("markets").style.display = "none";
    return;
  }

  let error = false;

  const resp = await fetch(`https://api.spotify.com/v1/${trackOrAlbumId[1]}s/${trackOrAlbumId[0]}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).catch((err) => {
    console.error("There was an error: a connection could not be made to the Spotify Web API. It may be unavailable right now.");
    document.getElementById("error-title").innerText = "Kira can't reach Spotify right now.";
    document.getElementById("error-body").innerText = "Something's happened and Kira isn't able to reach Spotify's servers right now. Try again a little bit later?";
    document.getElementById("signIn").style.display = "";
    document.getElementById("markets").style.display = "none";
    error = true;
  }).then(x => {
    if (x === undefined) return;
    if (x.status >= 400) {
      console.error("There was an error: connection made, but returned an error status code: " + this.status + ".");
      document.getElementById("error-title").innerText = "Kira is having a few issues right now.";
      document.getElementById("error-body").innerText = "Something has happened when talking to Spotify and an error was thrown (" + this.status + "). Try again a little bit later?";
      document.getElementById("signIn").style.display = "";
      document.getElementById("markets").style.display = "none";
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
    document.getElementById("error-title").innerText = "Kira isn't able to process this track right now.";
    document.getElementById("error-body").innerText = "The way that Spotify stores this track metadata means that Kira isn't able to get the countries where this track is available just yet. I'm working on finding a way, but for now, you may need to use another tool instead";
    document.getElementById("signIn").style.display = "";
    document.getElementById("markets").style.display = "none";
  } else {
    document.getElementById("markets-label").innerHTML = 
      `<strong>${name}</strong> by <strong>${artists}${artistsEtc ? " etc." : ""}</strong> can be streamed in ${markets.length} countries:`;
    document.getElementById("markets").style.display = "";
    document.getElementById("signIn").style.display = "none";
    document.getElementById("markets").innerHTML = "";
    markets.map(x => countries[x]).sort().map(country => {
      const item = document.createElement("li");
      item.innerHTML = country;
      document.getElementById("markets").appendChild(item);
    })
  }   
}

// Thanks to @maephisto for this reference: https://gist.github.com/maephisto/9228207
const countries = {
  "AF":"Afghanistan",
  "AX":"Aland Islands",
  "AL":"Albania",
  "DZ":"Algeria",
  "AS":"American Samoa",
  "AD":"Andorra",
  "AO":"Angola",
  "AI":"Anguilla",
  "AQ":"Antarctica",
  "AG":"Antigua And Barbuda",
  "AR":"Argentina",
  "AM":"Armenia",
  "AW":"Aruba",
  "AU":"Australia",
  "AT":"Austria",
  "AZ":"Azerbaijan",
  "BS":"Bahamas",
  "BH":"Bahrain",
  "BD":"Bangladesh",
  "BB":"Barbados",
  "BY":"Belarus",
  "BE":"Belgium",
  "BZ":"Belize",
  "BJ":"Benin",
  "BM":"Bermuda",
  "BT":"Bhutan",
  "BO":"Bolivia",
  "BA":"Bosnia And Herzegovina",
  "BW":"Botswana",
  "BV":"Bouvet Island",
  "BR":"Brazil",
  "IO":"British Indian Ocean Territory",
  "BN":"Brunei Darussalam",
  "BG":"Bulgaria",
  "BF":"Burkina Faso",
  "BI":"Burundi",
  "KH":"Cambodia",
  "CM":"Cameroon",
  "CA":"Canada",
  "CV":"Cape Verde",
  "KY":"Cayman Islands",
  "CF":"Central African Republic",
  "TD":"Chad",
  "CL":"Chile",
  "CN":"China",
  "CX":"Christmas Island",
  "CC":"Cocos (Keeling) Islands",
  "CO":"Colombia",
  "KM":"Comoros",
  "CG":"Congo",
  "CD":"Democratic Republic of the Congo",
  "CK":"Cook Islands",
  "CR":"Costa Rica",
  "CI":"Cote D\'Ivoire",
  "HR":"Croatia",
  "CU":"Cuba",
  "CY":"Cyprus",
  "CZ":"Czech Republic",
  "DK":"Denmark",
  "DJ":"Djibouti",
  "DM":"Dominica",
  "DO":"Dominican Republic",
  "EC":"Ecuador",
  "EG":"Egypt",
  "SV":"El Salvador",
  "GQ":"Equatorial Guinea",
  "ER":"Eritrea",
  "EE":"Estonia",
  "ET":"Ethiopia",
  "FK":"Falkland Islands (Malvinas)",
  "FO":"Faroe Islands",
  "FJ":"Fiji",
  "FI":"Finland",
  "FR":"France",
  "GF":"French Guiana",
  "PF":"French Polynesia",
  "TF":"French Southern Territories",
  "GA":"Gabon",
  "GM":"Gambia",
  "GE":"Georgia",
  "DE":"Germany",
  "GH":"Ghana",
  "GI":"Gibraltar",
  "GR":"Greece",
  "GL":"Greenland",
  "GD":"Grenada",
  "GP":"Guadeloupe",
  "GU":"Guam",
  "GT":"Guatemala",
  "GG":"Guernsey",
  "GN":"Guinea",
  "GW":"Guinea-Bissau",
  "GY":"Guyana",
  "HT":"Haiti",
  "HM":"Heard Island & Mcdonald Islands",
  "VA":"Holy See (Vatican City State)",
  "HN":"Honduras",
  "HK":"Hong Kong",
  "HU":"Hungary",
  "IS":"Iceland",
  "IN":"India",
  "ID":"Indonesia",
  "IR":"Iran",
  "IQ":"Iraq",
  "IE":"Ireland",
  "IM":"Isle Of Man",
  "IL":"Israel",
  "IT":"Italy",
  "JM":"Jamaica",
  "JP":"Japan",
  "JE":"Jersey",
  "JO":"Jordan",
  "KZ":"Kazakhstan",
  "KE":"Kenya",
  "KI":"Kiribati",
  "KR":"Korea",
  "KW":"Kuwait",
  "KG":"Kyrgyzstan",
  "LA":"Lao People\'s Democratic Republic",
  "LV":"Latvia",
  "LB":"Lebanon",
  "LS":"Lesotho",
  "LR":"Liberia",
  "LY":"Libyan Arab Jamahiriya",
  "LI":"Liechtenstein",
  "LT":"Lithuania",
  "LU":"Luxembourg",
  "MO":"Macao",
  "MK":"Macedonia",
  "MG":"Madagascar",
  "MW":"Malawi",
  "MY":"Malaysia",
  "MV":"Maldives",
  "ML":"Mali",
  "MT":"Malta",
  "MH":"Marshall Islands",
  "MQ":"Martinique",
  "MR":"Mauritania",
  "MU":"Mauritius",
  "YT":"Mayotte",
  "MX":"Mexico",
  "FM":"Micronesia",
  "MD":"Moldova",
  "MC":"Monaco",
  "MN":"Mongolia",
  "ME":"Montenegro",
  "MS":"Montserrat",
  "MA":"Morocco",
  "MZ":"Mozambique",
  "MM":"Myanmar",
  "NA":"Namibia",
  "NR":"Nauru",
  "NP":"Nepal",
  "NL":"Netherlands",
  "AN":"Netherlands Antilles",
  "NC":"New Caledonia",
  "NZ":"New Zealand",
  "NI":"Nicaragua",
  "NE":"Niger",
  "NG":"Nigeria",
  "NU":"Niue",
  "NF":"Norfolk Island",
  "MP":"Northern Mariana Islands",
  "NO":"Norway",
  "OM":"Oman",
  "PK":"Pakistan",
  "PW":"Palau",
  "PS":"Palestine",
  "PA":"Panama",
  "PG":"Papua New Guinea",
  "PY":"Paraguay",
  "PE":"Peru",
  "PH":"Philippines",
  "PN":"Pitcairn",
  "PL":"Poland",
  "PT":"Portugal",
  "PR":"Puerto Rico",
  "QA":"Qatar",
  "RE":"Reunion",
  "RO":"Romania",
  "RU":"Russian Federation",
  "RW":"Rwanda",
  "BL":"Saint Barthelemy",
  "SH":"Saint Helena",
  "KN":"Saint Kitts And Nevis",
  "LC":"Saint Lucia",
  "MF":"Saint Martin",
  "PM":"Saint Pierre And Miquelon",
  "VC":"Saint Vincent And Grenadines",
  "WS":"Samoa",
  "SM":"San Marino",
  "ST":"Sao Tome And Principe",
  "SA":"Saudi Arabia",
  "SN":"Senegal",
  "RS":"Serbia",
  "SC":"Seychelles",
  "SL":"Sierra Leone",
  "SG":"Singapore",
  "SK":"Slovakia",
  "SI":"Slovenia",
  "SB":"Solomon Islands",
  "SO":"Somalia",
  "ZA":"South Africa",
  "GS":"South Georgia And Sandwich Isl.",
  "ES":"Spain",
  "LK":"Sri Lanka",
  "SD":"Sudan",
  "SR":"Suriname",
  "SJ":"Svalbard And Jan Mayen",
  "SZ":"Swaziland",
  "SE":"Sweden",
  "CH":"Switzerland",
  "SY":"Syrian Arab Republic",
  "TW":"Taiwan",
  "TJ":"Tajikistan",
  "TZ":"Tanzania",
  "TH":"Thailand",
  "TL":"Timor-Leste",
  "TG":"Togo",
  "TK":"Tokelau",
  "TO":"Tonga",
  "TT":"Trinidad And Tobago",
  "TN":"Tunisia",
  "TR":"Turkey",
  "TM":"Turkmenistan",
  "TC":"Turks And Caicos Islands",
  "TV":"Tuvalu",
  "UG":"Uganda",
  "UA":"Ukraine",
  "AE":"United Arab Emirates",
  "GB":"United Kingdom",
  "US":"United States",
  "UM":"United States Outlying Islands",
  "UY":"Uruguay",
  "UZ":"Uzbekistan",
  "VU":"Vanuatu",
  "VE":"Venezuela",
  "VN":"Viet Nam",
  "VG":"Virgin Islands, British",
  "VI":"Virgin Islands, U.S.",
  "WF":"Wallis And Futuna",
  "EH":"Western Sahara",
  "YE":"Yemen",
  "ZM":"Zambia",
  "ZW":"Zimbabwe"
};