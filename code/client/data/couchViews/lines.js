function(doc) {
  if(doc.name && doc.lines) {
	doc.lines.forEach(function(line) {
		emit(line.id, line.percentage);
		
		
    		
    	});
  }
}

function(keys, values) {
  return (sum(values)/values.length);
}

var result = 0;
	for (var i in values) {
    		var elt = values[i];
    		result +=elt.percentage;
	}
return (result);
/*
//console.log(values);
	var test = false;
	var result = "";
	values.forEach(function(d,i){
		log(d);
		//result += JSON.parse(d).percentage || 0;
		//result += typeof JSON.parse(d).percentage;
		var t = JSON.parse(d);
		result =  t;
	});

	//JSON.parse("{\"id\":0,\"label\":\"Non assigné\",\"amount\":1.5486871041989332,\"percent\":100,\"percentage\":0.2212410148855619}")
	
  return //JSON.parse(values[0]);;//values[0];//JSON.parse('{"tto" : 1}');//values[0];//JSON.parse(values[0]);//.length;// values[0][0];//result; //values.length; //result;//(sum(values.percent)/values.length);
*/