// @author Meghan#2032 <https://nektro.net/> <https://paypal.me/nektro>
//
//
import fetch from "node-fetch";
import promisify from "js-promisify";
//
import path from "path";
import fs from "fs";
//
const __dirname = path.resolve("");
//
if (!('replaceAll' in String.prototype)) {
    String.prototype.replaceAll = function(search, replacement) {
        return this.replace(new RegExp(search, 'g'), replacement);
    };
}
//
//
async function main() {
    const args = process.argv;
    args.shift();
    args.shift();
    if (args.length === 0) return;
    //
    return Promise.resolve()
    .then(() => promisify(fs.mkdir, [path.resolve(__dirname, "tsumino")]))
    .catch(noop)
    .finally(() => fetch_book(parseInt(args[0])));
}
async function noop() {
}
async function fetch_book(n) {
    const a = new URLSearchParams();
    a.append("q", n);
    const b = await fetch("http://www.tsumino.com/Read/Load", {
        method: "POST",
        body: a,
    });
    console.log(b.status);
    if (b.status !== 200) return;
    console.log(`Saving tsumino.com book ${n}`)
    const c = await b.json();
    const d = c.reader_page_urls;
    return promisify(fs.mkdir, [path.resolve(__dirname, "tsumino", n.toString())])
    .then(() => {
        return Promise.all(d.map((v,i,a) => download_book_page(n,v,i,a.length.toString().length)));
    })
    .catch(() => {
        console.log(`Book ${n} was already saved!`);
        return;
    });
}
async function download_book_page(x, obj_id, n, mx) {
    const obj_id_safe = obj_id.replaceAll("=","").replaceAll("\\+","-").replaceAll("\/","_");
    const name = `${n.toString().padStart(mx,"0")} - ${obj_id_safe}.jpg`;
    // console.log(`Saving page ${x} / ${name}`);
    const url = `http://www.tsumino.com/Image/Object?name=${encodeURIComponent(obj_id)}`;
    const file_path = path.resolve(__dirname, "tsumino", x.toString(), name)
    //
    return promisify(fs.access, [file_path, fs.constants.F_OK])
    .catch(w => Promise.resolve()
        .then(w => fetch(url))
        .then(w => w.buffer())
        .then(w => promisify(fs.writeFile, [file_path, w]))
        .then(w => console.log(`Saved post: ${x} / ${name}`))
    );
}
//
//
main();
