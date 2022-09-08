class Util {

    constructor(){
        return true;
    }

    niceDate() {
        return new Date().toLocaleString().slice(0,24);
      }

    sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }

    msToTime(s) {
        s = Number(s);
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return hrs + ':' + mins + ':' + secs + '.' + ms;
    }

    toBase64Url(string) {

        return btoa(string).replace(/\+/g, "-").replace(/-/g, "_").replace(/=/g, "");
    }

    b64d(str) {
        return decodeURIComponent(escape(window.atob(str)));
    }

    sort(arr, k, direction) {
        return new Promise((resolve)=>{
            resolve(arr.sort((a,b)=>{return direction == "ascending" ? a[k].localeCompare(b[k]) : b[k].localeCompare(a[k]); }));
    });
}
    timestampToLocaleDateTime(timestamp) {

        return new Date(timestamp.replace(/\s/, "T") + "Z").toLocaleString();
    }

    formatBytes(a, b = 2) {
        if (0 === a) return "0 Bytes";
        const c = 0 > b ? 0 : b,
            d = Math.floor(Math.log(a) / Math.log(1024));
        return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }

    cleanString(string) {
        return string.replace(/[<>&'"/]/g, "");
    }

    escapeShittySharkUrl(url){
        var root = url.substring(0, url.lastIndexOf("/") + 1);
        var path = url.substring(url.lastIndexOf("/") + 1, url.length);
        console.log(`root: ${root} \n path: ${path}`)
        let decoded_path = unescape(path);
        let encoded_path = escape(decoded_path);
        console.log('encoded path: ' + encoded_path)
        return `${root}${encoded_path}`;
        // return url.replace(/\(/g,"%28").replace(/\)/g,"%29").replace(/\+/, "%2B");

    }


}

exports.Util = Util;