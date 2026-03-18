const http = require('http');
const url = require('url');

let data = [];

// function to send response
function send(res, code, msg) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(msg));
}

// validation function
function check(student) {
    let emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!student.name || !student.email || !student.course || !student.year) {
        return "All fields are required";
    }

    if (!emailCheck.test(student.email)) {
        return "Invalid email format";
    }

    if (student.year < 1 || student.year > 4) {
        return "Year must be between 1 and 4";
    }

    return null;
}

const server = http.createServer(function (req, res) {

    let parsed = url.parse(req.url, true);
    let path = parsed.pathname;
    let method = req.method;

    // GET ALL
    if (method === "GET" && path === "/students") {
        send(res, 200, { success: true, data: data });
    }

    // GET BY ID
    else if (method === "GET" && path.indexOf("/students/") === 0) {
        let id = path.split("/")[2];
        let found = null;

        for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                found = data[i];
            }
        }

        if (!found) {
            send(res, 404, { success: false, message: "Student not found" });
        } else {
            send(res, 200, { success: true, data: found });
        }
    }

    // CREATE
    else if (method === "POST" && path === "/students") {

        let body = "";

        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function () {
            let obj = JSON.parse(body);

            let err = check(obj);

            if (err) {
                send(res, 400, { success: false, message: err });
                return;
            }

            obj.id = Date.now().toString();
            data.push(obj);

            send(res, 201, { success: true, data: obj });
        });
    }

    // UPDATE
    else if (method === "PUT" && path.indexOf("/students/") === 0) {

        let id = path.split("/")[2];
        let body = "";

        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function () {
            let obj = JSON.parse(body);

            let index = -1;

            for (let i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    index = i;
                }
            }

            if (index === -1) {
                send(res, 404, { success: false, message: "Student not found" });
                return;
            }

            let err = check(obj);

            if (err) {
                send(res, 400, { success: false, message: err });
                return;
            }

            obj.id = id;
            data[index] = obj;

            send(res, 200, { success: true, data: obj });
        });
    }

    // DELETE
    else if (method === "DELETE" && path.indexOf("/students/") === 0) {

        let id = path.split("/")[2];
        let index = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                index = i;
            }
        }

        if (index === -1) {
            send(res, 404, { success: false, message: "Student not found" });
        } else {
            data.splice(index, 1);
            send(res, 200, { success: true, message: "Student deleted" });
        }
    }

    // INVALID
    else {
        send(res, 404, { success: false, message: "Route not found" });
    }

});

server.listen(4000, function () {
    console.log("Server running on port 4000");
});