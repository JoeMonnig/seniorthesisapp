const sqlite3 = require('sqlite3').verbose();
const path = require("path");
const os = require("os");
const fs = require("fs");
const userDataPath = path.join(os.homedir(), "SeniorThesisAppData");

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, "appdata.db");

console.log("DATABASE PATH:",dbPath);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users(
            usersid INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            iv TEXT,
            content TEXT,
            tag TEXT,
            UNIQ TEXT
        )`, (err) => {

        if (err) {

            console.error("TABLE ERROR:", err.message);

        } else {

            console.log("USERS TABLE READY");

        }

    });

    // Types
    db.run(`CREATE TABLE IF NOT EXISTS Types (
        typeid INTEGER PRIMARY KEY AUTOINCREMENT,
        typeName TEXT UNIQUE NOT NULL
    )`);

    // Prepopulate types
    const defaultTypes = ['income', 'recurring-want', 'recurring-need', 'one-time-want', 'one-time-need'];
    defaultTypes.forEach(type => {
        db.run(`INSERT OR IGNORE INTO Types (typeName) VALUES (?)`, [type]);
    });

    // Prebuilt Names
    db.run(`CREATE TABLE IF NOT EXISTS PrebuiltNames (
            nameid INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            typeId INTEGER NOT NULL,
            description TEXT,
            FOREIGN KEY(typeId) REFERENCES Types(typeid)
        )
    `,(err)=>{
        if (err){
            console.error("PREBUILTNAMES TABLE ERROR:", err.message);

        } else {
            console.log("PREBUILTNAMES TABLE READY");

        }

    });

    // Remove duplicates from PrebuiltNames (if any)
    db.run(`DELETE FROM PrebuiltNames
        WHERE nameid NOT IN (
            SELECT MIN(nameid)
            FROM PrebuiltNames
            GROUP BY name
        )
    `,(err)=>{

        if (err){
            console.error("DUPLICATE CLEANUP ERROR:", err.message);

        } else {
            console.log("PREBUILT DUPLICATES REMOVED");

        }

    });

    // Prepopulate some default prebuilt entries
    db.serialize(() => {

    const prebuiltEntries = [
        { name: 'Rent', typeName: 'recurring-need', description: 'Monthly apartment rent' },
        { name: 'Groceries', typeName: 'one-time-need', description: 'Weekly grocery shopping' },
        { name: 'Internet', typeName: 'recurring-need', description: 'Monthly internet service' },
        { name: 'Car Fuel', typeName: 'recurring-need', description: 'Fuel for car' },
        { name: 'Salary', typeName: 'income', description: 'Monthly paycheck' },
        { name: 'Gym Membership', typeName: 'recurring-want', description: 'Monthly gym fees' },
        { name: 'Vacation', typeName: 'one-time-want', description: 'Planned trips or holidays' },
        { name: 'Subscription', typeName: 'recurring-want', description: 'Monthly subscription services' },
        { name: 'Insurance', typeName: 'recurring-need', description: 'Monthly insurance payment' }
    ];

    prebuiltEntries.forEach((e) => {
        db.get(
            `SELECT typeid FROM Types WHERE typeName = ?`,
            [e.typeName],
            (err, row) => {
                if (err || !row) return;

                db.run(
                    `INSERT OR IGNORE INTO PrebuiltNames (name, typeId, description)
                     VALUES (?, ?, ?)`,
                    [e.name, row.typeid, e.description]
                );
            }
        );
    });
});

    // Expenses
    db.run(`CREATE TABLE IF NOT EXISTS Expenses (
        expenseid INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        prebuiltId INTEGER,
        typeId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        duedate TEXT,
        paydate TEXT,
        amount REAL NOT NULL,
        FOREIGN KEY(userId) REFERENCES Users(usersid),
        FOREIGN KEY(prebuiltId) REFERENCES PrebuiltNames(nameid),
        FOREIGN KEY(typeId) REFERENCES Types(typeid)
    )`);
});

console.log("DB INITIALIZED"); // temp for debugging

module.exports = db;
