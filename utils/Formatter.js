class Formatter{
  constructor(){}

  formatTableHeading(headings){
    let tableHeading = [];

    if(headings.length > 0){
      for(const heading of headings){
        switch(heading){
          case '__v':
          break;
          case '_id':
          break;
          default:
           tableHeading.push({title: heading.toUpperCase()});
        }
      }
    }

    return tableHeading;
  }
  formatCompositeSheet(resultData){
    let formatted = [];
    let tableHeading = [];

    //retrieve each student result
    for(const result of resultData){
      let resultObj = Object.getOwnPropertyNames(result._doc);
      let grades = [];
      if(tableHeading.length === 0){
        tableHeading = this.formatTableHeading(resultObj);
      }
      // retrieve each course grade
      for(const temp of resultObj){
        switch(temp){
          case '__v':
          break;
          case '_id':
          break;
          case 'regNo':
          break;
          default:
           grades.push({grade: result[temp]});
        }
      }

      formatted.push({regNo: result.regNo, grades: grades})
    }
    return {formatted, tableHeading};
  }
}

module.exports = Formatter;