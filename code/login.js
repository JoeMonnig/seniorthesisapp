const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");
const os = require("os");
const fs = require("fs");

const userDataPath = path.join(os.homedir(), "SeniorThesisAppData");

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, "appdata.db");

console.log("DATABASE PATH:",dbPath);

if(!fs.existsSync(userDataPath)){

    fs.mkdirSync(
        userDataPath,
        {recursive:true}
    );

}

const db = new sqlite3.Database(

    dbPath,

    (err)=>{

        if(err){
            console.error("DATABASE ERROR:", err.message);
            return;

        }

        console.log("DATABASE CONNECTED");

        db.serialize(()=>{

            db.run(`CREATE TABLE IF NOT EXISTS Users(
                    usersid INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    iv TEXT,
                    content TEXT,
                    tag TEXT,
                    UNIQ TEXT
                )`,

                (tableErr)=>{
                    if(tableErr){
                        console.error("TABLE ERROR:", tableErr.message);
                        return;

                    }

                    console.log("USERS TABLE READY");

                }
            );
        });
    }
);

document.addEventListener(
    "DOMContentLoaded",

    ()=>{

        console.log("LOGIN PAGE LOADED");

        const loginButton = document.getElementById("loginButton");

        const registerButton = document.getElementById("registerButton");

        // REGISTER
        registerButton.addEventListener(
            "click",

            async()=>{

                const username = document.getElementById("registerUsername").value.trim();

                const password = document.getElementById("registerPassword").value;

                if(!username || !password){
                    alert("Enter username and password");
                    return;

                }

                db.get(`SELECT * FROM Users
                    WHERE username=?
                    `,

                    [username],

                    async(err,row)=>{

                        if(err){
                            console.error(err);
                            alert("Database Error");
                            return;

                        }

                        if(row){
                            alert("Username Exists");
                            return;

                        }

                        const hashedPassword = await bcrypt.hash(password, 10);

                        db.run(`INSERT INTO Users
                            (
                                username,
                                iv,
                                content,
                                tag,
                                UNIQ
                            )
                            VALUES(?,?,?,?,?)
                            `,

                            [
                                username,
                                "",
                                "",
                                "",
                                hashedPassword
                            ],

                            function(insertErr){

                                if(insertErr){
                                    console.error(insertErr);

                                    alert("Registration Failed");

                                    return;

                                }

                                alert("User Registered");

                                document.getElementById("registerUsername").value="";

                                document.getElementById("registerPassword").value="";

                            }
                        );
                    }
                );
            }
        );

        // LOGIN
        loginButton.addEventListener(
            "click",

            async()=>{

                const username=
                    document.getElementById(
                        "username"
                    ).value.trim();

                const password=
                    document.getElementById(
                        "password"
                    ).value;

                db.get(`SELECT * FROM Users
                    WHERE username=?
                    `,

                    [username],

                    async(err,row)=>{

                        if(err){
                            console.error(err);
                            alert("Login Error");
                            return;

                        }

                        if(!row){
                            alert("User Not Found");
                            return;

                        }

                        const match = await bcrypt.compare(password, row.UNIQ);

                        if(match){
                            localStorage.setItem("loggedInUser", JSON.stringify(row));
                            window.location.href = "../views/index.html";

                        }else{
                            alert("Incorrect Password");

                        }
                    }
                );
            }
        );
    }
);