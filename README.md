# Kira
**Just head over to [kira.itspugle.com](https://kira.itspugle.com) and follow the prompts to use Kira.**

## Your privacy
The Spotify API is an authenticated API, meaning that it can't be accessed without user authentication. This helps protect the API's availability and saves computing resources for fraudulent API calls. As a result, you'll need to sign into Spotify using your personal account details. Rest assured that you'll be logging into Spotify only, not providing your details to us.

The minimum access level that we have to request is your basic account information. Although we *technically* have access to it, you can see in [the JavaScript](index.js) that it's never used. The only data used in the *authentication token*, which gives you access to the Spotify API.

## Installing Kira locally
Kira is built fully on front-end technology, so you don't need to worry about heavy or confusing backend systems. To get Kira going:

1. Clone this git repository: `git clone https://github.com/timrossback/kira.git`

2. Using whatever tool you like, open or serve [index.html](index.html). 
    
    I prefer to use [serve](https://github.com/vercel/serve) for all my front-end work: `serve kira`

3. In another tab, go to the [main Kira site](https://kira.itspugle.com) and authenticate yourself through Spotify

4. Replace `https://kira.itspugle.com` in the URL to whatever the address your local version of Kira is on.

    For serve, it'll likely be `localhost:5000`. Otherwise, check back with the original tab you opened it in.

### A note on authentication testing
The API key that is registered to Kira can only return the authentication token to `kira.itspugle.com` as a safety measure. Because of this, you'll need to [create a new API key from the Spotify Developer Dashboard](https://spotify.dev/documentation/general/guides/authorization-guide/) and update the relevant string in the `index.html` file to properly test or edit authentication. The authentication token can, however, be used from any URL. provided it isn't blacklisted by Spotify.
