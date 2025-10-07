// Not fully complete, just a placeholder for the time being so the database can be created and checked for validity and data can be added externally while the rest of the program is being built
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { deriveKey, encrypt, decrypt } = require('./encryption');
const crypto = require('crypto');

const db = new sqlite3.Database('appdata.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        usersid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        UNIQ TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS AppData (
        appdataid INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        key TEXT UNIQUE,
        iv TEXT,
        tag TEXT,
        content TEXT,
        FOREIGN KEY(user_id) REFERENCES Users(usersid)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Housings (
        housingsid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        homeInsurance INTEGER,
        rentMortage INTEGER,
        utilitiesSum INTEGER,
        internet INTEGER,
        hoaFees INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(utilitiesSum) REFERENCES Utilities(utilitiesid),
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Utilities (
        utilitiesid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        water INTEGER,
        gas INTEGER,
        sewer INTEGER,
        electric INTEGER,
        utilitiesTotal INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Foodsupplies (
        foodSuppliesid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        memberships INTEGER,
        groceries INTEGER,
        takeOut INTEGER,
        cleaningSupplies INTEGER,
        tolietries INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Incomes (
        incomesid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        grossIncome INTEGER,
        netIncome INTEGER,
        bonuses INTEGER,
        taxes INTEGER,
        dividends INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Transportations (
        transportationsid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        carPayments INTEGER,
        carInsurance INTEGER,
        carRepair INTEGER,
        carFuel INTEGER,
        publicTransportation INTEGER,
        carWashes INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Families (
        familiesid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        childCare INTEGER,
        schoolTuition INTEGER,
        schoolSupplies INTEGER,
        collegeSavings INTEGER,
        clothing INTEGER,
        haircut INTEGER,
        petVet INTEGER,
        petFood INTEGER,
        petGrooming INTEGER,
        petInsurance INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Healths (
        healthsid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        healthInsurance INTEGER,
        dentalInsurance INTEGER,
        medicalBills INTEGER,
        gymMembership INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Leisures (
        leisuresid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        vacations INTEGER,
        entertainment INTEGER,
        subscriptions INTEGER,
        hobbies INTEGER,
        sports INTEGER,
        gifts INTEGER,
        donations INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Obligations (
        obligationsid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        creditCardPayments INTEGER,
        lifeInsurance INTEGER,
        studentLoans INTEGER,
        personalLoans INTEGER,
        retirement INTEGER,
        emergencySavings INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
        
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS Miscellaneous (
        miscid INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        bigHouseholdPurchases INTEGER,
        seasonalCosts INTEGER,
        unexpectedRepairs INTEGER,
        emergencyTravel INTEGER,
        bankFees INTEGER,
        technologyUpgrades INTEGER,
        userAccess INTEGER,
        FOREIGN KEY(userAccess) REFERENCES Users(usersid)
    )`)
});

module.exports = { db };
