const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const fs   = require('fs');
const path = require('path');

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
  var model = undefined;
  try {
    model = mongoose.model(modelName);
  } catch (error) {
    
  }
  if(model){
    return mongoose.model(modelName);
  } else {
    const newSchema = new Schema(resultSchema);
    mongoose.model(modelName, newSchema);
    return mongoose.model(modelName);
  }
  
}

function buildSchemaDoc(doc = []){
  var schemaDoc = new Object();

  for(var i = 0; i < doc.length; i++){
    schemaDoc[doc[i]] =  {"type": "String", default: "N/A"};
  }
  
  return JSON.stringify(schemaDoc);
}

function buildModel(schemaDoc={}, modelName){
  if (!(schemaDoc instanceof Object)){
    schemaDoc = JSON.parse(schemaDoc);
  }
  
  const newSchema = new Schema(schemaDoc);
  var model ;
  try {
    model = mongoose.model(modelName);
  } catch (error) {
    // do nothing
  }
  if(model){
    return mongoose.model(modelName)
  } else{
    mongoose.model(modelName, newSchema);
    return mongoose.model(modelName);
  }
}

module.exports = {
  buildResultSchema,
  buildSchemaDoc,
  buildModel
};