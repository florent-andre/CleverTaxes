
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

  var propSelected = "CPLF2013";//AEPLF2014;"AELFi2014";"CPPLF2014";"CPLFi2014";"AELF2013";"CPLF2013

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

  var rawData = new Array();
  var dataInit = new Array();
  var firstElt = {
      "id" : 0,
      "label" : "Non assigné",
      "percent" : 0
    };
    dataInit.push(firstElt);
  //TODO : parcours des items de dataSum pour calculer le %age
  for (var i in dataSum) {
    var elt = dataSum[i];
    var percent  = (elt.amount/sumTotal)*100;
    //console.log(percent);
    // add a item
    elt["percent"] = percent;
    var m = {};
    var m1 = {};
    m['id']      = elt.CodeMinistere;
    m['label']   = elt.Ministere;
    m['percentage'] = percent ;
    m['amount'] = elt.amount,
    rawData.push(m);

    m1['id']      = elt.CodeMinistere;
    m1['label']   = elt.Ministere;
    m1['percent'] = percent ;
    dataInit.push(m1);
  }
 //console.log(dataInit);
  //TODO : recréer la structure attendue à partir des objects de la hasmap

  //console.log(dataPrepared);


  var content1 = "var dataInit"+propSelected+" = " + JSON.stringify(dataInit) + ";";
  fs.writeFile("./dataInitresult"+propSelected+".js", content1, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file dataInitresult"+propSelected+" was saved!");
    }
  });

  var content2 = "var dataInit2"+propSelected+" = " + JSON.stringify(dataInit) + ";";
  fs.writeFile("./dataInitresult2"+propSelected+".js", content2, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file dataInitresult2"+propSelected+" was saved!");
    }
  });

});
