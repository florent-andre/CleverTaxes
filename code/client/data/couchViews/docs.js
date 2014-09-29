function(doc) {
  if(doc.date &&doc.lines && doc.graphicName) {
	emit(doc.date, doc.graphicName);		

  }
}