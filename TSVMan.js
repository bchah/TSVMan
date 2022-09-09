
const express = require("express");
const os = require("os");
const router = express.Router();
const e = require("express");
const app = express();
const fs = require('fs');
const cors = require('cors');
const { Util } = require("./Util");
try { const crypto = require('node:crypto') } catch(err) {
console.log("NodeJS is too out of date to start TSVMan! Please update NodeJS / NPM from the latest stable installer at NodeJS.org");
process.exit(1);
};
const path = require('path');
const rimraf = require('rimraf');

let util = new Util();
const service_port = process.env.SERVICE_PORT || 80;
const secret_key = process.env.SECRET_KEY || "security";
const hours_to_keep_tsv = process.env.HOURS_TO_KEEP_TSV || 48;
const ms_to_keep_tsv = ((hours_to_keep_tsv * 60) * 60) * 1000;

app.use("/", router);
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let jsonParser = express.json();

const startup_time = util.niceDate();
let serve_count = 0;
let create_count = 0;
let error_count = 0;

try {

    router.post("/createTSV", jsonParser, (req, res) => {
        let key = req.body.secret_key || "";
        if (key != secret_key) { res.status(403).send("Missing or incorrect secret key!"); return false; }
        let urls = req.body.urls;
        if (!urls || urls.length < 1) { res.status(400).send("Missing expected array of URLs!"); return false; }
        let urlstring = urls.join("\n");
        let tsvdata = `TsvHttpData-1.0\n${urlstring}`;
        console.log(`${util.niceDate()} : Creating TSV from these ${urls.length} URLs: ${urls.join(", ")}`);
        let uuid = crypto.randomUUID();
        let tsvname = `${uuid}_${Date.now()}`;
        if (req.body.public) {
            tsvname = `public_${tsvname}`;
        }
        let tsvpath = `./TSV/${tsvname}.tsv`;
        fs.writeFile(tsvpath, tsvdata, () => {
            res.status(200).send(tsvname.replace("public_", ""));
            console.log(`${util.niceDate()} : Created TSV ${tsvpath} ${req.body.public ? "(Publicly Accessible)" : ""}`);
            create_count++;
            return true;
        });

    });

    router.get("/", (req, res) => {
        res.send(`<body style="background-color:#2F4F4F;color:white;font-size:1.3em;font-family: Verdana, Helvetica, sans-serif;"><strong>TSVMan is up and running since ${startup_time}</strong><br><br>Since then, we have served <strong>${serve_count}</strong> TSVs, created <strong>${create_count}</strong> TSVs, and encountered <strong>${error_count}</strong> errors.<br><br>Have a great day!`)
    });

    router.get("/getTSV", (req, res) => {
        let public_key = req.query.public_key || null;
        if (public_key) {
            if (fs.existsSync(`./TSV/public_${public_key}.tsv`)) {
                try {
                    fs.createReadStream(`./TSV/public_${public_key}.tsv`).pipe(res);
                    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "an unidentified public user"
                    console.log(`${util.niceDate()} : Served Public TSV public_${public_key}.tsv to ${ip.replace(/::ffff:/, "")}`);
                    serve_count++;
                    return true;
                } catch (e) {
                    res.status(500).send(e);
                    console.error(e);
                    error_count++
                }
            }  else {
                res.status(404).send("That TSV could not be located!");
                return false;
            }
        } else {

            let key = req.query.secret_key || "";
            if (key != secret_key) { res.status(403).send("Missing or incorrect secret key!"); return false; }
            let tsv_key = req.query.tsv_key || null;

            if (tsv_key) {
                if (fs.existsSync(`./TSV/${tsv_key}.tsv`) || fs.existsSync(`./TSV/public_${tsv_key}.tsv`)) {
                try {
                    let public = "";
                    if (!fs.existsSync(`./TSV/${tsv_key}.tsv`)) {public = "public_"}
                    fs.createReadStream(`./TSV/${public}${tsv_key}.tsv`).pipe(res)
                    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "an unidentified private user"
                    console.log(`${util.niceDate()} : Served TSV ${tsv_key} to ${ip.replace(/::ffff:/, "")}`);
                    serve_count++;
                } catch(error) {
                    res.status(500).send(error);
                    console.error(error);
                    error_count++
                }
            } else {
                res.status(404).send("That TSV could not be located!");
                return false;
            }
            } else {
                res.status(400).send("No TSV key provided!")
                return false;
            }
        }
    });

    app.listen(service_port, () => { console.log(`${util.niceDate()} : App Ready`); });

    setInterval(() => {
        var uploadsDir = __dirname + '/TSV';

        fs.readdir(uploadsDir, function (err, files) {
            files.forEach(function (file, index) {
                fs.stat(path.join(uploadsDir, file), function (err, stat) {
                    var endTime, now;
                    if (err) {
                        return console.error(err);
                    }
                    now = new Date().getTime();
                    endTime = new Date(stat.ctime).getTime() + ms_to_keep_tsv;
                    if (now > endTime) {
                        return rimraf(path.join(uploadsDir, file), function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log(`${util.niceDate()} : ${file} was deleted since it is over ${hours_to_keep_tsv} hours old.`);
                        });
                    }
                });
            });
        });
    }, 3600000);

} catch (e) {
    console.error(`${util.niceDate()} : Error! ${e}`)
    error_count++;
}





