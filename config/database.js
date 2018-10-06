let mongoURI = "";

if(process.env.NODE_ENV === "production"){
  mongoURI = "mongodb://xraybrain:jude6053@ds125073.mlab.com:25073/resultmanagement-prod";
} else {
  mongoURI = "mongodb://127.0.0.1:27017/resultManagement";
}

module.exports = {mongoURI};