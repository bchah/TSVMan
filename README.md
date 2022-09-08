## Welcome

Welcome to **TSVMan**, a really simple utility to create and host TSVs for Google Cloud Storage URL Lists. 
These are handy for importing files from public or signed links to your GCS Buckets.

The Web UI will only indicate that the app is running and how many request types it has served. 
You will need to pipe the console output to a file to keep a log (it gives details on each creation and retrieval) 
or run it manually just as needed.

## How does it work?

TSVMan listens for POST or GET requests to create or retrieve a .TSV file, created from a list of URLs you want to download into your GCS bucket.
POST requests must include a *secret_key* plus a *tsv_key*. The secret key is set via an environment variable `SECRET_KEY` 
or is set to "security" by default. The TSV key is provided as a response when you create a TSV. So let's start there.

## Creating a TSV

Send a POST request to `http://yourserver/createTSV` with body contents like:

```
{
"secret_key":"security",
"urls":["www.mypublicsite.com/myFile1.jpg", "www.mypublicsite.com/myFile2.jpg", "www.mypublicsite.com/myFile3.jpg"],
"public":true
}
```

The server will send a standard 200 OK response with a message containing the unique key for the TSV you just made. If you set the *public* parameter
to true, that unique key can be used to retrieve the TSV without providing a secret key.

## Retreiving a TSV

Send a GET request to `http://yourserver.com/getTSV` with query string parameters of either a `public_key` or the combination of a `secret_key` 
and a `tsv_key` for files which were not created as public. For example...

## Public Key

`http://yourserver.com/getTSV?public_key=e2fc5f13-b27f-4105-aac7-c2c7696edeb1_1662666444124` returns a response like

```
TsvHttpData-1.0\n
www.mypublicsite.com/myFile1.jpg
www.mypublicsite.com/myFile2.jpg
www.mypublicsite.com/myFile3.jpg
```

... and could also be used as a 'public link' to the TSV (perfect for feeding to GCS as a URL List link!)

In cases where you haven't created the TSV as public and want to use the master key to retrieve it, `http://yourserver.com/getTSV?secret_key=security&tsv_key=e2fc5f13-b27f-4105-aac7-c2c7696edeb1_1662666444124` returns the same response as above. You could technically use this as a public link as well but you'd be exposing your secret key. It's a knee-high fence, really.

### Other things to know

* To install TSVMan, simply clone this repo, run 'npm install', set any environment variables e.g. `export SECRET_KEY=abc123` then 'node TSVMan.js' and you're live. 
* To keep TSVMan running 24/7 in the background, use [Forever](https://www.npmjs.com/package/forever) e.g. `forever start TSVMan.js`
* TSVMan runs on either port 80, or a port you can specify using the environment variable `SERVICE_PORT`
* TSVs are kept for 48 hours unless otherwise specified by an environment variable `HOURS_TO_KEEP_TSV`
* You can browse the files in the /TSV folder and retrieve them manually. They are actual files.
* Right now TSVMan just supports the URL itself, not the size and md5 fields. But if anybody ever reads this and submits the feature request, I'll be happy to write in support for those.
