const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

function buildResultSchema(modelName) {
  
  const resultSchema = {
    REG_NO: {
      type: String,
      required: true
    }
    ,
    NAME: {
      type: String,
      required: true
    }
    ,
    CA1: {
      type: Number,
      required: true
    }
    ,
    CA2: {
      type: Number,
      required: true
    }
    ,
    PRACTICAL: {
      type: Number,
      required: true
    }
    ,
    EXAM: {
      type: Number,
      required: true
    }
    ,
    TOTAL: {
      type: Number,
      required: true
    }
    ,
    GRADE: {
      type: String,
      required: true
    }
  }

  const newSchema = new Schema(resultSchema);

  mongoose.model(modelName, newSchema);

  return mongoose.model(modelName);
}

function getResultModel(modelName) {
  
}

module.exports = {
  buildResultSchema
};