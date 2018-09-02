const xlsx = require('xlsx');

function read(fileName){
  var workbook = xlsx.readFile(fileName);
  return workbook;
}

function to_json(workbook){
    var result = {};
    workbook.SheetNames.forEach(function(sheetName){
      var roa = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if(roa.length > 0){
        result[sheetName] = roa;
      }
    })
    return result;
  }


module.exports = {
  read,
  to_json
};