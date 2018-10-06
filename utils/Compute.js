class Compute{
  constructor (model, creditUnits){
   this.recordModel = model;
   this.creditUnits = creditUnits;
   this.grade = [];
  }

 setGrade(grade=""){
   this.grade.push(grade);
 }
 getGrade(){
   return this.grade;
 }
 updateStudent(regNo="", grade="", courseCode){
   this.recordModel.findOne({regNo: regNo})
     .then(record => {
       if(record){
         record[courseCode] = grade;
         record.save();
       } else {
         this.updateStudent(regNo, grade, courseCode);
       }
     })
     .catch(err => {
       console.log(err);
     });
     return grade;
 }

 getGradePoint(grade = ""){
   let gradePoint = 0;
   grade = grade.toUpperCase();

   switch(grade){
     case "A":
       gradePoint = 4.0;
       break;
     case "AB":
       gradePoint = 3.5;
       break;
     case "B":
       gradePoint = 3.0;
       break;
     case "BC":
       gradePoint = 2.5;
       break;
     case "C":
       gradePoint = 2.0;
       break;
     default:
       gradePoint = 0;
   }

   return gradePoint;
 }

 computeGPA(regNo = ""){
   setTimeout(()=>{
    this.recordModel.findOne({regNo: regNo})
    .then(record => {
      if(record !== null){
       let totalGradePoint = 0;
       let totalCreditUnit = 0;
 
       for(const prop of this.creditUnits){
        totalGradePoint += this.getGradePoint(record[prop.courseCode]) * prop.creditUnit;
        totalCreditUnit += prop.creditUnit;
        // console.log(record[prop.courseCode]);
       }
 
       let GPA = Math.round((totalGradePoint/totalCreditUnit) * 100) / 100;
       record.GPA = GPA;
       record.save();
       
      } else {
        console.log();
        this.computeGPA(regNo);
      }
    })
    .catch(err => {
      console.log(err);
    });
   }, 9000);
   
 }

 setModel(model){
   this.recordModel = model;
 }
 loadRegNo(students){
   let regNo = [];

   for(let i = 0; i < students.length; i++){
     regNo.push(students[i].regNo);
     let currentRegNo =  regNo[i];
     //-- save each student regNo into the composite sheet
     this.recordModel.findOne({"regNo": currentRegNo})
       .then(record => {
         if(!record){
           //-- insert this regno if not exists
           new this.recordModel({"regNo": currentRegNo}).save();
         }
       })
       .catch(err =>{
         console.log(err);
       })
   }
   return regNo;
 }
}

module.exports = Compute;