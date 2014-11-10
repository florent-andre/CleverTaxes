
fs = require('fs')
fs.readFile('./plf.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  //console.log(data);
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
  var propSelected = "AELF2013";
  //creer une structure hierarchique
 /* {
    "CodeMinistere":1,
    "name":"Affaires étrangères",
    "children": [
        {
        "CodeProgramme":105,
        "name":"Action de la France en Europe et dans le monde",  
        "children": [
              {"CodeAction":1,"name":"Coordination de l'action diplomatique","size": 61044798+24971363+2315000},
              {"CodeAction":2,"name": "Action européenne", "size": 9609087+35000+38865461},
              {"CodeAction":4,"name": "Contributions internationales", "size":845831562},
              {"CodeAction":5,"name": "Coopération de sécurité et de défense", "size": 58462045+5676661+26277081},
              {"CodeAction":6,"name": "Soutien", "size": 109429225+110637689+5050000}
              {"CodeAction":7,"name": "Réseau diplomatique", "size": 349089186+202934006+6555000}
        ]
      },{
        "CodeProgramme":151,
        "name":"Français à l'étranger et affaires consulaires",  
        "children": [
              {"CodeAction":1,"name": "Offre d'un service public de qualité aux Français à l'étranger","size": 167115109+14361800+20039430},
              {"CodeAction":2,"name": "Accès des élèves français au réseau AEFE", "size":110300000},
              {"CodeAction":3,"name": "Instruction des demandes de visa", "size": 45379858 + 0}
        ]
      }
    ]  
  }
 */

 var data1 = dataPrepared.reduce(function(prev,cur,i,original){

    if(prev[cur.CodeMinistere]){
      prev[cur.CodeMinistere] = cur[CodeMinistere];
      prev[cur.name]          = cur[NomMinistere];
      //prev[cur.children] =

    }else{
      prev[cur.CodeMinistere] = cur;
      
    }

    return prev;

  },{});

});
