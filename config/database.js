let mongoURI = "";

if(process.env.NODE_ENV === "production"){
  mongoURI = "";
} else {
  mongoURI = "mongodb://127.0.0.1:27017/resultManagement";
}

module.exports = {mongoURI};