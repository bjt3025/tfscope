const mongoose = require('mongoose')

/**
 * @description Establishes a MongoDB Atlas connection via Mongoose. Must be
 *   called once at server startup before any database queries are made.
 * @calledBy server.js on startup
 * @calls mongoose.connect(process.env.MONGODB_URI)
 * @returns {Promise<void>}
 * @errorHandling Logs the error and calls process.exit(1) on failure.
 *   Rationale: the server must not start without a working database connection.
 *   Allowing startup to continue would produce a running server that silently
 *   fails every query — harder to diagnose than a clean crash at boot.
 */
async function connectDB() {
  try {
    // Attempt connection using the Atlas URI from environment.
    // mongoose.connect() returns a promise — we await it so any connection
    // error is caught by the catch block below rather than becoming an
    // unhandled promise rejection.
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    // Log the host portion of the connection so it's easy to confirm in
    // the terminal which Atlas cluster we actually connected to.
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    // Log the full error before exiting so the cause is visible in the terminal.
    // process.exit(1) signals an abnormal exit — exit code 0 means success,
    // any non-zero code means failure. This makes it easy to detect in scripts
    // or process managers (e.g. nodemon) that something went wrong.
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
