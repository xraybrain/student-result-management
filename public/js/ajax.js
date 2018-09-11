
// var asyncApp = (function(){
//   var xmlHttp;

//   function createXMLHttpObject (){
//     var http = {};
//     if(window.XMLHttpRequest){
//       http = new XMLHttpRequest();
//     }else {
//       http = new ActiveXObject("Microsoft.XMLHTTP");
//     }

//     return http;
//   }

//   xmlHttp = createXMLHttpObject();

//   function preview(form){
//     if(xmlHttp){
//       xmlHttp.open('POST', '/lecturer/previewupload');
//       xmlHttp.send();
//       console.log(form)
//     }
//   }

//   return {
//     preview: preview
//   }
// })();