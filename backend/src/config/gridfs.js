const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket = null;

function initializeGridFS() {
    const database = mongoose.connection.db;

    if (!database) {
        throw new Error(
            "MongoDB must be connected before initializing GridFS."
        );
    }

    bucket = new GridFSBucket(database, {
        bucketName: "projectImages",
    });

    console.log("MongoDB GridFS initialized successfully.");
}

function getGridFSBucket() {
    if (!bucket) {
        throw new Error("GridFS has not been initialized.");
    }

    return bucket;
}

module.exports = {
    initializeGridFS,
    getGridFSBucket,
};