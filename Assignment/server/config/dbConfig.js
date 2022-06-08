if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGO_URI; // production DB server
}
export const dbConfig = {
    database: process.env.DB_URL,
    userMongoClient: true,
    connectOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }

}