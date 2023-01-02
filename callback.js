window.onload = function() {
  if (checkAuthentication() === "Success") {
    window.location.href = "https://kira.vercel.app/";
  } else {
    document.getElementById("auth-error").classList.remove("is-hidden");
    document.cookie = "";
  }
}

function checkAuthentication() {
  const urlString = window.location.href;
  const urlHome = window.location.host;
  const urlPath = window.location.pathname;
  const parameterString = urlString.slice(urlString.indexOf(urlHome) + urlHome.length + urlPath.length).replace("?", "").replace("#", "");
  const urlElements = parameterString.split("&");

  var accessToken = "";
  var errorCode = "";
  var expiryPeriod = 0;

  for (x in urlElements) {
    if (urlElements[x].indexOf("access_token") !== -1) {
      var accessToken = urlElements[x].slice(13);
    } else if (urlElements[x].indexOf("error") !== -1) {
      var errorCode = urlElements[x].slice(6);
    } else if (urlElements[x].indexOf("expires_in") !== -1) {
      var expiryPeriod = Number(urlElements[x].slice(11));
    }
  }

  if (urlString.indexOf("error") !== -1) {
    console.error("AUTH: Error occured during authentication via Spotify Web API (code: " + errorCode + ").");
    return "Error";
  } else {
    const d = new Date();
    d.setTime(d.getTime() + (expiryPeriod * 1000));
    let expires = d.toUTCString();
    document.cookie = "accessToken=" + accessToken + "; expires=" + expires + "; path=/";
    return "Success";
  }
}