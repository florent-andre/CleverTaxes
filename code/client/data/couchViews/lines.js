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