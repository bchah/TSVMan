## Welcome

<p>Welcome to TSVMan, a really simple utility to create and host TSVs for Google Cloud Storage URL Lists. 
These are handy for importing files from public or signed links to your GCS Buckets.</p>

<p>The Web UI will only indicate that the app is running and how many request types it has served. 
You will need to pipe the console output to a file to keep a log (it gives details on each creation and retrieval) 
or run it manually just as needed.</p>

### How does it work?

<p>TSVMan listens for POST or GET requests to create or retrieve a .TSV file, created from a list of URLs you want to download into your GCS bucket.</p>
<p>POST requests must include a <em>secret_key</em> plus a <em>tsv_key</em>. The secret key is set via an environment variable `SECRET_KEY` 
or is set to "security" by default. The TSV key is provided as a response when you create a TSV. So let's start there.</p>

### Creating a TSV

<p>Send a POST request to `http://yourserver/createTSV` with body contents like:</p>

<p>`{
"secret_key":"security",
"urls":["www.mypublicsite.com/myFile1.jpg", "www.mypublicsite.com/myFile2.jpg", "www.mypublicsite.com/myFile3.jpg"],
"public":true
}`</p>

<p>The <em>public</em> parameter represents whether you can retrieve the TSV using just the public key or if you have to provide the secret key as well.</p>

### Retreiving a TSV

<p>Send a GET request to `http://yourserver.com/getTSV` with query string parameters of either a `public_key` or the combination of a `secret_key` 
and a `tsv_key` for files which were not created as public. For example...</p>

<p>`http://yourserver.com/getTSV?public_key=e2fc5f13-b27f-4105-aac7-c2c7696edeb1_1662666444124` returns a response like</p>

<p>`TsvHttpData-1.0\n
www.mypublicsite.com/myFile1.jpg\n
www.mypublicsite.com/myFile2.jpg\n
www.mypublicsite.com/myFile3.jpg`<p>
