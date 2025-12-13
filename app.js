// use to create html css page by the use of node js that run on browser the urlshortner folder
// uses are app.js in the folder we html css page in public folder that connect with app.js file
// to show webpage in browser

//----------https://chatgpt.com/c/693d9c12-1ff4-8321-8a20-2573526acc33----------------------

//-----url shortener webpage explanation using app.js and index.hrml and style.css---------------------------------------------


// using urlshortener folder
import { readFile, writeFile } from "fs/promises"; // readfile like index.html and style.css
import { createServer } from "http";               // create http server
import path from "path";                           // create safe path
import crypto from "crypto";

const DATA_FILE = path.join("data", "links.json");

const serverFile = async (res, filepath, contentType) => {
    try {
        const data = await readFile(filepath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 page not found");
    }
};

const loadlinks = async () => {
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};

const savelinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
};

const server = createServer(async (req, res) => {
    console.log(req.method, req.url);

    // ---------- GET ROUTES ----------
    if (req.method === "GET") {
        if (req.url === "/") {
            return serverFile(
                res,
                path.join("public", "index.html"),
                "text/html"
            );
        } else if (req.url === "/style.css") {
            return serverFile(
                res,
                path.join("public", "style.css"),
                "text/css"
            );
        } else if (req.url === "/links") {
            const links = await loadlinks();
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(links));
        } else {
            // treat any other GET path as a potential shortcode
            const links = await loadlinks();
            const shortCode = req.url.slice(1); // remove leading "/"

            if (links[shortCode]) {
                // redirect to original URL
                res.writeHead(302, { Location: links[shortCode] });
                return res.end();
            } else {
                // shortcode not found -> proper 404
                res.writeHead(404, { "Content-Type": "text/plain" });
                return res.end("Short link not found");
            }
        }
    }

    // ---------- POST /shorten ----------
    if (req.method === "POST" && req.url === "/shorten") {
        const links = await loadlinks();

        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            console.log(body);
            const { url, shortcode } = JSON.parse(body);

            if (!url) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end("URL is required");
            }

            const finalshortcode =
                shortcode || crypto.randomBytes(4).toString("hex");

            if (links[finalshortcode]) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end(
                    "short code is already exist please choose another"
                );
            }

            links[finalshortcode] = url;
            await savelinks(links);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({ success: true, shortcode: finalshortcode })
            );
        });

        return;
    }

    // ---------- OTHER METHODS ----------
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");f
});

const port = 3001;
server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});

// ⭐ BIG PICTURE: What your project does

// You have built a mini URL shortener system:

// ✅ Frontend (HTML + JavaScript)

// Shows a webpage with a form.

// User enters:

// A long URL

// A custom short code (optional)

// JavaScript sends this data to your backend using fetch("/shorten").

// ✅ Backend (Node.js)

// Reads and serves the HTML/CSS files.

// Accepts POST requests from the frontend.

// Saves URL + shortcode mapping into data/links.json.

// ⭐ Your mini-system is like:

// "Take this long URL → Give me a short version → Store it for future use."

// This is exactly how services like TinyURL and Bitly work at the core.

// 💡 Now let’s explain each part in simple steps
// 🎨 1. HTML Part — Your Webpage
// <form id="shorten-form">
//     <input type="url" name="url" id="url">
//     <input type="text" name="shortcode" id="shortcode">
// </form>


// This form collects data from the user.

// 🧠 2. JavaScript (Frontend)
// What it does:

// Stops the form from refreshing the page

// event.preventDefault();


// Collects the form data

// const url = formData.get('url');
// const shorturl = formData.get('shortcode');


// Sends data to your Node.js backend

// const response = await fetch("/shorten", {
//      method: "POST",
//      headers: {"Content-Type":"application/json"},
//      body: JSON.stringify({ url, shortcode })
// });


// If backend responds OK → show an alert

// alert("form submitted successfully");


// 👉 This means no page reload, just smooth AJAX request.

// 🖥️ 3. Node.js Server — Serving your website
// First part: Serving HTML & CSS
// if(req.method==="GET"){
//     if(req.url === "/"){
//         return serverFile(res, "public/index.html", "text/html");
//     } else if(req.url === "/style.css") {
//         return serverFile(res, "public/style.css", "text/css");
//     }
// }


// Meaning:

// When browser asks for / → send HTML page.

// When browser asks for /style.css → send CSS file.

// This is how your website opens in the browser.

// 📦 4. Reading & Writing Data (Database substitute)

// You store short URLs in a JSON file:

// data/links.json

// Load existing links:
// const loadlinks = async () => {
//     try {
//         const data = await readFile(DATA_FILE, "utf-8");
//         return JSON.parse(data);
//     } catch(error) {
//         if(error.code === "ENOENT") {
//             await writeFile(DATA_FILE, JSON.stringify({}));
//             return {};
//         }
//     }
// }


// If the file doesn't exist → create an empty {} JSON file.

// Save new links:
// await writeFile(DATA_FILE, JSON.stringify(links));

// 🔗 5. POST /shorten – Handling shortening

// This is the heart of your backend:

// if(req.method === "POST" && req.url === "/shorten") {


// You are:

// ✔ Step 1: Read previous links
// const links = await loadlinks();

// ✔ Step 2: Read POST request body
// let body = "";
// req.on("data", chunk => body += chunk);

// ✔ Step 3: Parse user data
// const { url, shortcode } = JSON.parse(body);

// ✔ Step 4: Validate URL

// If no URL → throw error.

// ✔ Step 5: If user didn’t give a shortcode → generate one
// const finalshortcode = shortcode || crypto.randomBytes(4).toString("hex");


// This creates random shortcodes like:

// a93fbd10
// e4c812ab

// ✔ Step 6: Check if shortcode already exists
// if(links[finalshortcode]) {
//     res.end("short code already exists");
// }

// ✔ Step 7: Save the mapping
// links[finalshortcode] = url;
// await savelinks(links);

// ✔ Step 8: Send success response
// res.end(JSON.stringify({ success: true, shortcode: finalshortcode }));

// 🚀 FINAL RESULT

// You now have a working URL shortener system:

// 🔹 User opens browser → sees HTML & CSS
// 🔹 Enters a long link
// 🔹 Form sends data to Node.js
// 🔹 Node.js saves the shortcode and URL in JSON
// 🔹 User receives success message

// You basically built:

// A static file server

// A URL shortener backend

// A mini-database (using JSON)

// A frontend that interacts with backend using AJAX

// This is REAL FULL STACK DEVELOPMENT, exactly how professional apps start.