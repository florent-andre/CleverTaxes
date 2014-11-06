function(doc) {
  if(doc.type && doc.graphicName && doc.lines ) {

	doc.lines.forEach(function(line) {
		emit(line.id, line.percentage);



    	});
  }
}

function(keys, values) {
  return (sum(values)/values.length);
}

"views": {
    "2011": {
        "map": "function(doc) {\n  if(doc.type=='2011' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "AEPLF2014": {
        "map": "function(doc) {\n  if(doc.type=='AEPLF2014' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "AELFi2014": {
        "map": "function(doc) {\n  if(doc.type=='AELFi2014' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "CPPLF2014": {
        "map": "function(doc) {\n  if(doc.type=='CPPLF2014' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "CPLFi2014": {
        "map": "function(doc) {\n  if(doc.type=='CPLFi2014' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "AELF2013": {
        "map": "function(doc) {\n  if(doc.type=='AELF2013' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    },
    "CPLF2013": {
        "map": "function(doc) {\n  if(doc.type=='CPLF2013' && doc.graphicName && doc.lines ) {\n\n\tdoc.lines.forEach(function(line) {\n\t\temit(line.id, line.percentage);\n\n\n\n    \t});\n  }\n}\n",
        "reduce": "function(keys, values) {\n  return (sum(values)/values.length);\n}"
    }
}
