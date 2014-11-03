

console.log("hello");

fs = require('fs')
fs.readFile('./plf.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  //console.log(data);
  //TODO : renomer test en une variable qui à du sens
  var dataPrepared = eval(data);
  //console.log(dataPrepared.length);

  dataPrepared.forEach(function(d,i){

  	Object.keys(d).forEach(function(key){

  		var val = d[key];
  		delete d[key];

  		var newKey = key.replace(" ","").replace("è","e");

  		d[newKey] = val;

  	});

  });

  var propSelected = "AEPLF2014";

  var sumTotal = 0;
  //TODO : faire le calcul sur la propriété propSelected pour avoir la somme par ministère et le % de chaque ligne de budget
  var dataSum = dataPrepared.reduce(function(prev,cur,i,original){

  	sumTotal += cur[propSelected];
  	
    if(prev[cur.CodeMinistere]){
  		prev[cur.CodeMinistere].amount += cur[propSelected];
  		
  	}else{
  		prev[cur.CodeMinistere] = cur;
      prev[cur.CodeMinistere].amount = cur[propSelected];    
  	}

  	return prev;

  },{});

  console.log(dataSum);
  console.log("==============");
  console.log(sumTotal);
  console.log(Object.keys(dataSum).length);

  //TODO : parcours des items de dataSum pour calculer le %age

  //TODO : recréer la structure attendue à partir des objects de la hasmap

  //console.log(dataPrepared);

  var content = "var dataInit = " + JSON.stringify(dataPrepared) + ";"; 
  fs.writeFile("./result.js", content, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  }); 
});
