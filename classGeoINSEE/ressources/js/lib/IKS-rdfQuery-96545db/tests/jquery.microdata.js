/*
 * jquery.microdata.js unit tests
 */
(function($){

var ns = { namespaces: {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#",
	ex: "http://example.org/",
	sioc: "http://rdfs.org/sioc/ns#",
	xhv: "http://www.w3.org/1999/xhtml/vocab#",
	prism: "http://prism.talis.com/schema#",
	xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/',
  schema: 'http://schema.org/'
}};

function setup(microdata) {
	$('#main').html(microdata);
};

function testTriples (received, expected) {
	var i, triples = received;
	equals(triples.length, expected.length, 'there should be ' + expected.length + ' triples');
	if (triples.length >= expected.length) {
  	for (i = 0; i < expected.length; i += 1) {
  		equals(triples[i].toString(), expected[i].toString());
  	}
  	for (i; i < triples.length; i += 1) {
  	  ok(false, 'also got ' + triples[i].toString());
  	}
	} else {
  	for (i = 0; i < triples.length; i += 1) {
  		equals(triples[i].toString(), expected[i].toString());
  	}
  	for (i; i < expected.length; i += 1) {
  	  ok(false, 'did not get ' + expected[i].toString());
  	}
	}
};



module("Parsing Tests");

test("Simple parsing test!", function () {
var main = $('<div itemscope>' +
 '  <p itemprop="a">1</p>' +
 '  <p itemprop="a">2</p>' +
 '  <p itemprop="a">3</p>' +
 '  <p itemprop="b">test</p>' +
 '</div>');
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  equals(rdf.size(), 4);
});

test("Complex parsing test, based on http://schema.org", function () {
  var main = $('<div itemscope itemtype="http://schema.org/Person">' + 
  '<span itemprop="name">Jane Doe</span>' + 
  '<img src="http://www.example.com/janedoe.jpg" itemprop="image" />' + 
  '<span itemprop="jobTitle">Professor</span>' + 
  '<span>This here is a dummy that should <b>not</b> get processed!</span>' +
  '<span>This here is a <span itemprop="name">dummy</span> that should get processed!</span>' +
  '<div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">' + 
  '  <span itemprop="streetAddress">' + 
  '    20341 Whitworth Institute' + 
  '    405 N. Whitworth' + 
  '  </span>' + 
  '  <span itemprop="addressLocality">Seattle</span>,' + 
  '  <span itemprop="addressRegion">WA</span>' + 
  '  <span itemprop="postalCode">98052</span>' + 
  '</div>' + 
  '<span itemprop="telephone">(425) 123-4567</span>' + 
  '<a href="mailto:jane-doe@xyz.edu" itemprop="email">' + 
  '  jane-doe@xyz.edu</a>' + 
  'Jane\'s home page:' + 
  '<a href="www.janedoe.com" itemprop="url">janedoe.com</a>' + 
  'Graduate students:' + 
  '<a href="www.xyz.edu/students/alicejones.html" itemprop="colleagues">' + 
  '  Alice Jones</a>' + 
  '<a href="www.xyz.edu/students/bobsmith.html" itemprop="colleagues">' + 
  '  Bob Smith</a>' + 
  '</div>');
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  equals(rdf.size(), 16);
});

test("Most-Complex parsing test", function () {
  var main = $('<div itemscope itemtype="http://example.org/Thing">' + 
  '<span itemprop="name">Jane Doe</span>' + 
  '<span itemprop="name">Jane Doe2</span>' + 
  '<a href="http://example2.org/sample.html" itemprop="link">Jane Doe</a>' + 
  '<img src="http://www.example.com/janedoe.jpg" itemprop="image" />' + 
  '<div itemprop="something" itemscope itemtype="http://example.org/Thing2" itemid="http://example.org/#test">' +
  '<figure itemprop="work" itemscope itemtype="http://n.whatwg.org/work" itemref="licenses">' +
  ' <img itemprop="work" src="images/mailbox.jpeg" alt="Outside the house is a mailbox. It has a leaflet inside.">' +
  ' <figcaption itemprop="title">The mailbox.</figcaption>' +
  '</figure>' +
  '</div>' +
  '<p id="licenses">All images licensed under the ' +
  '<a itemprop="license" href="http://www.opensource.org/licenses/mit-license.php">MIT license</a>' +
  '.</p>' +
  '</div>');
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  equals(rdf.size(), 12);
});

module("Performance Tests");

test("multiple elements with itemid and itemprop attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<div itemscope itemtype="http://xmlns.com/foaf/0.1/Person">'+
				'<p itemid="bPerson' + i + '" itemprop="name">Person ' + i + '</p></div>');
  }
  var t1 = new Date();
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
});

test("multiple elements with itemid, rel and resource attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<div itemscope itemtype="http://xmlns.com/foaf/0.1/Image">'+
					'<p itemid="photo' + i + '.jpg" </p>'+
					'<div itemprop="depicts" itemscope itemtype="http://xmlns.com/foaf/0.1/Person" '+
					'itemid="aPerson' + i + '">Paragraph ' + i + '</div>'+
				'</div>');
  }
  var t1 = new Date();
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  var triples = $.microdata.triples($(main));
  var rdf = $.rdf.databank(triples);
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
});

module("RDF Gleaner");

test("Test 0001", function() {
	setup('<p itemscope itemid="photo1.jpg">This photo was taken by <span class="author" itemprop="http://purl.org/dc/elements/1.1/creator">Mark Birbeck</span>.</p>');
	var triples = $.microdata.triples($('#main > p'));
	testTriples(triples, 
	            [$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});


module("Microdata Test Suite");

test("Test 0001", function() {
	setup('<p>This photo was taken by <span class="author" itemscope itemid="photo1.jpg"><span itemprop="http://purl.org/dc/elements/1.1/creator">Mark Birbeck</span></span>.</p>');
	var triples = $.microdata.triples($('#main > p > span'));
	var rdf = $.rdf.databank(triples);
	testTriples(triples, 
	            [$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0002", function() {
	setup('<p>This photo was taken by <a id="id1" itemprop="http://purl.org/dc/elements/1.1/creator" href="http://www.blogger.com/profile/1109404"><span itemscope itemid="photo1.jpg" itemref ="id1">Mark Birbeck</span></a>.</p>');
	var triples = $.microdata.triples($('#main > p > a > span'));
	var rdf = $.rdf.databank(triples);
	testTriples(triples, 
	            [$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns)]);
	$('#main > p').remove();
});

test("Test 0006", function() {
	setup('<p>This photo was taken by <span itemscope>'+
			'<span itemprop="http://xmlns.com/foaf/0.1/img" itemscope itemid="photo1.jpg">'+
				'<a itemprop="http://purl.org/dc/elements/1.1/creator" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>'+
			'.</span></span></p>');
	var triples = $.microdata.triples($('#main > p > span'));
	testTriples(triples, 
	            [$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404>', ns), 
	             $.rdf.triple('<> foaf:img <photo1.jpg>', ns)]);
	$('#main > p').remove();
});

test("Test 0007", function() {
	setup('<p>This photo was taken by <span itemscope>'+
	'<span itemprop="http://xmlns.com/foaf/0.1/img" itemscope itemid="photo1.jpg">'+
		'<meta itemprop="http://purl.org/dc/elements/1.1/title" content="Portrait of Mark"/>'+
		'<a itemprop="http://purl.org/dc/elements/1.1/creator"  href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.'+
	'</span</span></p>');
	var triples = $.microdata.triples($('#main > p > span'));
	testTriples(triples, 
	            [$.rdf.triple('<photo1.jpg> dc:title "Portrait of Mark" .', ns),
	             $.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns),
	             $.rdf.triple('<> foaf:img <photo1.jpg> .', ns)]);
	$('#main > p').remove();
});

test("Test 0008", function() {
	setup('<p>This document is licensed under a <span itemscope itemid="">'+
			'<a itemprop="http://creativecommons.org/ns#license" href="http://creativecommons.org/licenses/by-nc-nd/2.5/">Creative Commons</a>.'+
			'</span></p>');
	var triples = $.microdata.triples($('#main > p > span'));
	testTriples(triples, 
	            [$.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by-nc-nd/2.5/> .', ns)]);
	$('#main > p').remove();
});

test("Test 0009", function() {
	$('#main').append('<span itemscope itemid="http://example.org/people#Person2"><link itemprop="http://purl.org/dc/elements/1.1/knows"'+
	'href="http://example.org/people#Person1"/></span>');
	var triples = $.microdata.triples($('#main > span'));
	testTriples(triples, 
	            [$.rdf.triple('<http://example.org/people#Person2> dc:knows <http://example.org/people#Person1> .', ns)]);
	$('#main > span').remove();
});

test("Test 0011", function() {
	setup('<div itemscope itemid="">Author: <span itemprop="http://purl.org/dc/elements/1.1/creator">Albert Einstein</span>'+
			'<h2 itemprop="http://purl.org/dc/elements/1.1/title">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	var triples = $.microdata.triples($('#main > div'));
	testTriples(triples,
		[$.rdf.triple('<> dc:creator "Albert Einstein" .', ns),
		$.rdf.triple('<> dc:title "E = mc2: The Most Urgent Problem of Our Time" .', ns)]);
	$('#main > div').remove();
});

test("Test 0012", function() {
	$('#main').append('<span itemscope itemid="http://example.org/node"><meta itemprop="http://example.org/property" xml:lang="fr" content="chat" /></span>');
	var triples = $.microdata.triples($('#main > span'));
	testTriples(triples, 
		[$.rdf.triple('<http://example.org/node> <http://example.org/property> "chat" .')]);
	$('#main > span').remove();
})

/* This test has been amended because replacing the head is difficult in the QUnit test runner. The logic is the same. */
test("Test 0013", function() {
	setup('<div itemscope itemid="" xml:lang="fr">'+
			'<h1 xml:lang="en">Test 0013</h1>'+
			'<span itemscope itemid="http://example.org/node"><meta itemprop="http://example.org/property" content="chat"/></span>'+
		  '</div>');
	var triples = $.microdata.triples($('#main > div > span'));
	testTriples(triples, 
		[$.rdf.triple('<http://example.org/node> <http://example.org/property> "chat" .')]);
	$('#main > div').remove();
});
//datatype (except datetime) is not supported by microdata
test("Test 0014", function() {
	setup('<p><span	itemscope itemid="http://example.org/foo"><meta itemprop="http://example.org/bar" content="10" datatype="xsd:integer"/>ten</span></p>');
	var triples = $.microdata.triples($('#main > p'));
	testTriples($.microdata.triples($('#main > p > span')), 
		[$.rdf.triple('<http://example.org/foo> <http://example.org/bar> "10" .')]);
	$('#main > p').remove();
});

test("Test 0015", function() {	
	$('#main').append('<span itemscope>'+
		'<link itemprop="http://purl.org/dc/elements/1.1/source" href="urn:isbn:0140449132" /></span><p itemscope><meta  itemprop="http://purl.org/dc/elements/1.1/creator" content="Fyodor Dostoevsky" /></p>');
	testTriples($.microdata.triples($('span')), 
		[$.rdf.triple('<> dc:source <urn:isbn:0140449132> .', ns)]);
	testTriples($.microdata.triples($('p')), 
		[$.rdf.triple('<> dc:creator "Fyodor Dostoevsky"  .', ns)]);
	$('link[href="urn:isbn:0140449132"]').remove();
	$('#main > span').remove();
})

test("Test 0017", function() {
	setup('<p><span itemscope itemid="_:a">'+ 
				'<span itemprop="http://xmlns.com/foaf/0.1/name">Manu Sporny</span>'+
				'<span itemprop="http://xmlns.com/foaf/0.1/knows" itemscope itemid="_:b">knows'+
					'<span itemprop="http://xmlns.com/foaf/0.1/name">Ralph Swick</span>'+
				'</span>'+
		  '</span>.</p>');
	testTriples($.microdata.triples($('#main > p > span').eq(0)),
		[$.rdf.triple('_:a foaf:name "Manu Sporny" .', ns),
		$.rdf.triple('_:b foaf:name "Ralph Swick" .', ns),
		$.rdf.triple('_:a foaf:knows _:b .', ns)
		]);
	$('#main > p').remove();
});

test("Test 0018", function() {
	setup('<p itemscope itemid="photo1.jpg">This photo was taken by <a itemprop="http://purl.org/dc/elements/1.1/creator" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
		testTriples($.microdata.triples($('#main > p')),
		[$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns)]);
	$('#main > p').remove();
});

test("Test 0019", function() {
	setup('<div itemscope itemid="mailto:manu.sporny@digitalbazaar.com"><link itemprop="http://xmlns.com/foaf/0.1/knows" href="mailto:michael.hausenblas@joanneum.at"/></div>');
	testTriples($.microdata.triples($('#main > div')),
		[$.rdf.triple('<mailto:manu.sporny@digitalbazaar.com> foaf:knows <mailto:michael.hausenblas@joanneum.at> .', ns)]);
	$('#main > div').remove();
});

test("Test 0021", function() {
	setup('<div><span class="attribution-line" itemscope>this photo was taken by <span  itemprop="http://purl.org/dc/elements/1.1/creator">Mark Birbeck</span></span></div>');
	testTriples($.microdata.triples($('#main > div > span')),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > div').remove();
});

test("Test 0023", function() {
	setup('<div itemscope id="photo1">This photo was taken by <span itemprop="http://purl.org/dc/elements/1.1/creator">Mark Birbeck</span></div>');
	testTriples($.microdata.triples($('#main > div')),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > div').remove();
});

test("Test 0025", function() {
	setup('<p itemscope>This paper was written by '+
			'<span itemprop="http://purl.org/dc/elements/1.1/creator" itemscope itemid="#me">'+
			'<span itemprop="http://xmlns.com/foaf/0.1/name">Ben Adida</span>.</span></p>');
	testTriples($.microdata.triples($('#main > p')),
		[$.rdf.triple('<#me> foaf:name "Ben Adida" .', ns),
		$.rdf.triple('<> dc:creator <#me> .', ns)]);
	$('#main > p').remove();
});

test("Test 0026", function() {
	setup('<p itemscope itemid="http://internet-apps.blogspot.com/"><meta itemprop="http://purl.org/dc/elements/1.1/creator" content="Mark Birbeck" /></p>');
	testTriples($.microdata.triples($('#main > p')),
		[$.rdf.triple('<http://internet-apps.blogspot.com/> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0029", function() {
	setup('<p itemscope itemid="http://example.org/foo"><span  itemprop="http://purl.org/dc/elements/1.1/creator" datatype="xsd:string"><b>M</b>ark <b>B</b>irbeck</span>.</p>');
	testTriples($.microdata.triples($('#main > p > span > b')), []);
	testTriples($.microdata.triples($('#main > p')),
		[$.rdf.triple('<http://example.org/foo> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0030", function() {
	setup('<p itemscope>This document is licensed under a <a itemprop="http://creativecommons.org/ns#license" href="http://creativecommons.org/licenses/by-nc-nd/2.5/">Creative Commons License</a>.</p>');
	testTriples($.microdata.triples($('#main > p')),
		[$.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by-nc-nd/2.5/> .', ns)]);
	$('#main > p').remove();
});

test("Test 0033", function() {
	var md, triple;
	setup('<p itemscope>This paper was written by <span itemprop="http://purl.org/dc/elements/1.1/creator" itemscope><span itemprop="http://xmlns.com/foaf/0.1/name">Ben Adida</span>.</span></p>');
	md = $.microdata.triples($('#main > p'));
	testTriples(md,[$.rdf.triple('<> foaf:name "Ben Adida" .',ns),$.rdf.triple('<> dc:creator <> .',ns)]); //?? check for blank node

	triple = md[0];
	equals(triple.property, $.rdf.resource('foaf:name', ns));
	equals(triple.object, $.rdf.literal('"Ben Adida"'));
	
	triple = md[1];
	equals(triple.subject, $.rdf.resource('<>'));
	equals(triple.property, $.rdf.resource('dc:creator', ns));
	ok(md[1].object === md[0].subject, "the object of the first triple should be the same as the subject of the second triple");
	
	$('#main > p').remove();
});

test("Test 0034", function() {
	setup('<div itemscope itemid="http://sw-app.org/mic.xhtml#i">'+
			'<img itemprop="http://xmlns.com/foaf/0.1/img" src="http://sw-app.org/img/mic_2007_01.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($.microdata.triples($('#main > div > img')), []);
	testTriples($.microdata.triples($('#main > div')),
		[$.rdf.triple('<http://sw-app.org/mic.xhtml#i> foaf:img <http://sw-app.org/img/mic_2007_01.jpg> .', ns)]);
	$('#main > div').remove();
});

test("Test 0035", function () {
  setup('<div itemscope itemid="http://sw-app.org/mic.xhtml#i"><img	itemprop="http://xmlns.com/foaf/0.1/img" src="http://sw-app.org/img/mic_2007_01.jpg" href="http://sw-app.org/img/mic_2006_03.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($.microdata.triples($('#main > div')), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/img/mic_2007_01.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0036", function () {
  setup('<div itemscope itemid="http://sw-app.org/mic.xhtml#i"><img	itemprop="http://xmlns.com/foaf/0.1/img" src="http://sw-app.org/img/mic_2007_01.jpg" resource="http://sw-app.org/img/mic_2006_03.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($.microdata.triples($('#main > div')), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/img/mic_2007_01.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0037", function () {
  setup('<div 	itemscope itemid="http://sw-app.org/mic.xhtml#i"><img itemprop="http://xmlns.com/foaf/0.1/img" src="http://sw-app.org/img/mic_2007_01.jpg"  href="http://sw-app.org/img/mic_2006_03.jpg" resource="http://sw-app.org/mic.xhtml#photo"  alt="A photo depicting Michael" /></div>');
	testTriples($.microdata.triples($('#main > div')), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/img/mic_2007_01.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0042", function () {
  setup('<div><img 	itemprop="http://xmlns.com/foaf/0.1/img" src="http://sw-app.org/img/mic_2007_01.jpg"  alt="A photo depicting Michael" /></div>');
	testTriples($.microdata.triples($('#main > div')), []);
	$('#main > div').remove();
});

test("Test 0046", function () {
  setup('<div itemscope itemtype="http://xmlns.com/foaf/0.1/Document">'+
			'<span itemprop="http://xmlns.com/foaf/0.1/maker" itemscope>'+
				'<p itemprop="http://xmlns.com/foaf/0.1/name">John Doe</p>'+
			'</span></div>');
  var triples = $.microdata.triples($('#main > div'));
  testTriples(triples,[$.rdf.triple('<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Document> .',ns),
					   $.rdf.triple('<> foaf:name "John Doe" .',ns),
					   $.rdf.triple('<> <http://xmlns.com/foaf/0.1/maker> <> .',ns)]);
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Document');
  equals(triples[0].subject, triples[1].subject);
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[1].object.value, 'John Doe');
  equals(triples[2].property.value, 'http://xmlns.com/foaf/0.1/maker');
  equals(triples[2].object, triples[2].subject);
  $('#main > div').remove();
});

test("Test 0047", function () {
  setup('<div itemscope itemtype="http://xmlns.com/foaf/0.1/Document">'+
			'<span itemprop="http://xmlns.com/foaf/0.1/maker"  itemscope itemid="http://www.example.org/#me">'+
				'<p itemprop="http://xmlns.com/foaf/0.1/name">John Doe</p>'+
			'</span></div>');
  var triples = $.microdata.triples($('#main > div'));
  testTriples(triples,[$.rdf.triple('<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Document> .',ns),
					   $.rdf.triple('<http://www.example.org/#me> foaf:name "John Doe" .',ns),
					   $.rdf.triple('<> <http://xmlns.com/foaf/0.1/maker> <http://www.example.org/#me> .',ns)]);
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Document');
  equals(triples[0].subject, triples[2].subject);
  equals(triples[2].property.value, 'http://xmlns.com/foaf/0.1/maker');
  equals(triples[2].object.value, 'http://www.example.org/#me');
  equals(triples[1], $.rdf.triple('<http://www.example.org/#me> <http://xmlns.com/foaf/0.1/name> "John Doe" .'));
	$('#main > div').remove();
});

test("Test 0048", function () {
  setup('<div itemscope itemid="http://www.example.org/#me" itemtype="http://xmlns.com/foaf/0.1/Person">'+
			'<span itemprop="http://xmlns.com/foaf/0.1/knows" itemscope>'+
				'<p itemprop="http://xmlns.com/foaf/0.1/name">John Doe</p>'+
			'</span></div>');
  var triples = $.microdata.triples($('#main > div'));
  testTriples(triples,[$.rdf.triple('<http://www.example.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .',ns),
					   $.rdf.triple('<> foaf:name "John Doe" .',ns),
					   $.rdf.triple('<http://www.example.org/#me> foaf:knows <> .',ns)]);
 
  equals(triples[0], $.rdf.triple('<http://www.example.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .'));
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[1].object.value, 'John Doe');
  equals(triples[2].subject.value, 'http://www.example.org/#me');
  equals(triples[2].property.value, 'http://xmlns.com/foaf/0.1/knows');
  equals(triples[2].object, triples[1].subject);
	$('#main > div').remove();
});

test("Test 0049", function () {
  setup('<div itemscope itemid="http://www.example.org/#me" itemtype="http://xmlns.com/foaf/0.1/Person">'+
			'<p itemprop="http://xmlns.com/foaf/0.1/name">John Doe</p>'+
		'</div>');
	testTriples($.microdata.triples($('#main > div')), [
	$.rdf.triple('<http://www.example.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .'),
	  $.rdf.triple('<http://www.example.org/#me> <http://xmlns.com/foaf/0.1/name> "John Doe" .')
	]);
	$('#main > div').remove();
});

test("Test 0050", function () {
  setup('<div itemscope itemtype="http://xmlns.com/foaf/0.1/Person"><p itemprop="http://xmlns.com/foaf/0.1/name">John Doe</p></div>');
  var triples = $.microdata.triples($('#main > div'));
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Person');
  equals(triples[0].subject, triples[1].subject);
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[1].object.value, 'John Doe');
	$('#main > div').remove();
});


test("Test 0086", function () {
  setup('<div itemscope itemid="http://www.example.org/#somebody" itemprop="foobar"><p resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p></div>');
	testTriples($.microdata.triples($('#main > div')), []);
	$('#main > div').remove();
});

test("Test 0092", function () {
  setup('<div itemscope itemid="">Author: <span itemprop="http://purl.org/dc/elements/1.1/creator">Albert Einstein</span><h2 itemprop="http://purl.org/dc/elements/1.1/title" datatype="rdf:XMLLiteral">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	testTriples($.microdata.triples($('#main > div')), [
	  $.rdf.triple('<> <http://purl.org/dc/elements/1.1/creator> "Albert Einstein" .'),
	  $.rdf.triple('<> <http://purl.org/dc/elements/1.1/title>  "E = mc2: The Most Urgent Problem of Our Time" .')
	]);
	$('#main > div').remove();
});

test("Test 0093", function () {
  setup('<div xmlns:ex="http://www.example.org/" itemscope itemid="">Author: <span itemprop="http://purl.org/dc/elements/1.1/creator">Albert Einstein</span><h2 itemprop="http://purl.org/dc/elements/1.1/title" datatype="ex:XMLLiteral">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	testTriples($.microdata.triples($('#main > div')), [
    $.rdf.triple('<> <http://purl.org/dc/elements/1.1/creator> "Albert Einstein" .'),
    $.rdf.triple('<> <http://purl.org/dc/elements/1.1/title>  "E = mc2: The Most Urgent Problem of Our Time" .')
	]);
	$('#main > div').remove();
});

module("Adding microdata to elements");

test("adding microdata to an element", function() {
  var eventFired = false;
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.bind("rdfChange", function () {//??????
    eventFired = true;
  });
  $.microdata.addMicrodata($(span),'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  ok(eventFired, "should trigger any functions bound to the changeRDF event");
  $('#main > p').remove();
});

test("adding microdata to an element whose text matches the literal value of the microdata", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals($('#main > p > span > span').attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  $('#main > p').remove();
});

test("adding microdata to an element: adding microdata typed item", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:Person .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals(span.attr('itemtype'), 'http://xmlns.com/foaf/0.1/Person');
  $('#main > p').remove();
});

test("adding microdata to an element whose text matches the literal value of the microdata", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals(span.attr('itemid'), undefined);
  equals($('#main > p > span > span').attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  equals(span.attr('itemscope'), "");
  $('#main > p').remove();
});

test("adding microdata to an element whose value has a datatype - datetime", function() {
  setup('<p>Last updated <time datetime="2008-10-19">today</time></p>');
  var time = $('#main > p > time');
  $.microdata.addMicrodata($(time),'<> <http://purl.org/dc/elements/1.1/date> "2008-10-19" .');
  equals($('#main > p > time > span').attr('itemscope'), "");
  equals($('#main > p > time > span').attr('itemid'), undefined);
  equals($('#main > p > time').attr('itemprop'), 'http://purl.org/dc/elements/1.1/date');
  equals($('#main > p > time').attr('datetime'), '2008-10-19');
  $('#main > p').remove();
});

test("adding microdata to an element: adding microdata where the object is a resource which is already referenced", function() {
	setup('<p>This photo was taken by <a href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  $.microdata.addMicrodata($(a),'<photo1.jpg> <http://purl.org/dc/elements/1.1/creator> <http://www.blogger.com/profile/1109404> .');
  equals($('#main > p > a > span').attr('itemscope'), "");
  equals($('#main > p > a > span').attr('itemid'), 'photo1.jpg');
  equals(a.attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  $('#main > p').remove();
});

test("adding microdata to an element: adding a triple with a literal, where the subject is already present", function() {
	setup('<p>This photo was taken by <a id="id1" itemprop="http://purl.org/dc/elements/1.1/creator" href="http://www.blogger.com/profile/1109404"><span itemscope itemid="photo1.jpg" itemref ="id1">Mark Birbeck</span></a>.</p>');
	var span = $('#main > p > a > span');
	$.microdata.addMicrodata($(span),'<photo1.jpg> dc:title "Mark Birbeck" .');
	equals(span.attr('itemid'), 'photo1.jpg');
	equals($('#main > p > a > span > span').attr('itemprop'), 'http://purl.org/dc/elements/1.1/title');
	equals($('#main > p > a').attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
	equals($('#main > p > a > span > span').text(), 'Mark Birbeck');
	$('#main > p').remove();
});

test("adding microdata to an element: adding a triple whose subject is a blank node", function() {
	setup('<p><span>Manu Sporny</span> <span>knows</span> <span itemscope itemid="[_:b]"><span itemprop="http://xmlns.com/foaf/0.1/name">Ralph Swick</span></span>.</p>');
	var span1 = $('#main > p > span:eq(0)');
	$.microdata.addMicrodata($(span1),'_:a <http://xmlns.com/foaf/0.1/name> "Manu Sporny" .');
	equals(span1.attr('itemid'), '[_:a]');
	equals(span1.attr('itemscope'), '');
	equals($('#main > p > span > span').attr('itemprop'), 'http://xmlns.com/foaf/0.1/name');
	$('#main > p').remove();
});

test("adding microdata to an element: attempting to add a triple whose object is a resource, when the element has a different href", function() {
	setup('<p>The book <b>Weaving the Web</b> (hardcover) has the ISBN <a href="http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907">0752820907</a>.</p>');
	var a = $('#main > p > a');
	raises(function() {
		$.microdata.addMicrodata($(a),'<#wtw> <http://purl.org/dc/elements/1.1/identifier> <urn:ISBN:0752820907> .')},"must throw an exception");
	equals(a.attr('href'), 'http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907');
	$('#main > p').remove();
});

test('adding microdata to an element: adding a triple where the element already has the triple with a different value', function() {
  setup('<p>This is about <span itemscope itemid="#SusannahDarwin"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></span></p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<#SusannahDarwin> <http://www.w3.org/1999/02/22-rdf-syntax-ns#label> "Susannah" .');
  equals(span.attr('itemid'), '#SusannahDarwin');
  equals($('#main > p > span > span').attr('itemprop'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#label');
  span = span.children('span');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemprop'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#label');
  equals($('#main > p > span > span').text(), 'Susannah Darwin');
  $('#main > p').remove();
});

test('adding microdata to an element: adding a triple where the element already has a triple with the same literal value', function() {
  setup('<p>This is about <span itemscope itemid="#SusannahDarwin"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></span></p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<#SusannahDarwin> <http://xmlns.com/foaf/0.1/name> "Susannah Darwin" .');
  equals(span.attr('itemid'), '#SusannahDarwin');
  equals($('#main > p > span >span').attr('itemprop'), 'http://xmlns.com/foaf/0.1/name');
  equals($('#main > p > span>span').text(), 'Susannah Darwin');
  ok($('#main > p > span >span').children('*').length === 1, 'the span has one child element');
  $('#main > p').remove();
});

test('adding microdata to an element: adding a triple where the element already has the triple with a different object', function() {
  setup('<p>This is about <span itemscope itemid="#SusannahDarwin"><meta itemprop="http://xmlns.com/foaf/0.1/son" content="#CharlesDarwin">Susannah Darwin</span></span></p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<#SusannahDarwin> <http://xmlns.com/foaf/0.1/son> <#ErasmusDarwin> .');
  equals(span.attr('itemid'), '#SusannahDarwin');
  $('#main > p').remove();
});

test('adding microdata to an element: adding a repeat of a triple', function () {
  setup('<p><span datatype="" itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="#CharlesRobertDarwin">'+
			'<span itemprop="firstName">Charles</span> Robert '+
			'<span itemprop="surname">Darwin</span></span></p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<#CharlesRobertDarwin> <http://www.w3.org/1999/02/22-rdf-syntax-ns#label> "Charles Robert Darwin" .');
  var triples = $.microdata.triples(span);
  equals(triples[1].object.value,"Charles Robert Darwin");
  equals(triples[1].property.value.toString(),"http://www.w3.org/1999/02/22-rdf-syntax-ns#label");
  equals(span.attr('itemid'), '#CharlesRobertDarwin');
  equals(span.attr('itemtype'), 'http://xmlns.com/foaf/0.1/Person');
  equals(span.attr('datatype'), '');
  $('#main > p').remove();
});

module("removing microdata from elements");

test("removing microdata from an element", function() {
  var eventFired = false;
  setup('<p>This document is by <span itemscope><span itemprop="http://purl.org/dc/elements/1.1/creator">Jeni Tennison</span></span>.</p>');
  var span = $('#main > p > span');
  span.bind("rdfChange", function () {
    eventFired = true;
  })
  $.microdata.removeMicrodata(span);
  ok(eventFired, "should trigger any functions bound to the changeRDF event");
  $('#main > p').remove();
});

test("removing microdata from an element with children", function() {
  setup('<p>This document is by <span itemscope><span itemprop="http://purl.org/dc/elements/1.1/creator">Jeni Tennison</span></span>.</p>');
  var span = $('#main > p > span');
  $.microdata.removeMicrodata(span);
  equals($('#main > p > span > span').attr('itemprop'), undefined, "the itemprop attribute should be removed");
  equals($('#main > p > span').attr('itemscope'), undefined, "the itemscope attribute should be removed");
  $('#main > p').remove();
});

test("removing a itemprop from an element", function() {
  setup('<p>This document is by <span itemscope><span itemprop="http://purl.org/dc/elements/1.1/creator">Jeni Tennison</span></span>.</p>');
  var span = $('#main > p > span');
  $.microdata.removeMicrodata(span,'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals($('#main > p > span > span').attr('itemprop'), undefined, "the itemprop attribute should be removed");
  equals($('#main > p > span').attr('itemscope'), undefined, "the itemscope attribute should be removed");
  $('#main > p').remove();
});

test("attempting to remove a itemprop from an element when the itemprop doesn't match", function() {
  setup('<p>This document is by <span itemscope><span itemprop="http://purl.org/dc/elements/1.1/creator">Jeni Tennison</span></span>.</p>');
  var span = $('#main > p > span');
  raises(function() {
    $.microdata.removeMicrodata(span,'<> <http://purl.org/dc/elements/1.1/modified> "Jeni Tennison" .');
  }, "must throw exception to pass");	
  equals($('#main > p > span > span').attr('itemprop'), "http://purl.org/dc/elements/1.1/creator", "the itemprop attribute should not be removed");
  $('#main > p').remove();
});

test("removing a itemprop from an element when the itemprop contains multiple values", function() {
  setup('<p>This document is by <span itemscope><span itemprop="http://purl.org/dc/elements/1.1/creator http://purl.org/dc/elements/1.1/contributor">Jeni Tennison</span></span>.</p>');
  var span = $('#main > p > span');
  $.microdata.removeMicrodata(span,'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  $('#main > p').remove();
});

test("removing a type from an element", function () {
  setup('<p>This document is by <a itemscope itemid="http://www.jenitennison.com/" itemtype="http://xmlns.com/foaf/0.1/Person">Jeni Tennison</span>.</p>');
  var span = $('#main > p > a');
    $.microdata.removeMicrodata(span);
  equals(span.attr('itemtype'), undefined, "The typeof attribute should be removed");
  $('#main > p').remove();
});

module("Add and then remove microdata");

test("test1", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals($('#main > p > span > span').attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  $.microdata.removeMicrodata(span);
  equals($('#main > p > span')[0], span[0]);
  $('#main > p').remove();
});

test("test2", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals($('#main > p > span > span').attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  $.microdata.removeMicrodata(span,'<> <http://purl.org/dc/elements/1.1/creator> "Jeni Tennison" .');
  equals($('#main > p > span')[0], span[0]);
  $('#main > p').remove();
});

test("test3", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:Person .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals(span.attr('itemtype'), 'http://xmlns.com/foaf/0.1/Person');
  $.microdata.removeMicrodata($(span),'<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:Person .');
  equals($('#main > p > span')[0], span[0]);
  $('#main > p').remove();
});

test("test4", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  $.microdata.addMicrodata($(span),'<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:Person .');
  equals(span.attr('itemid'), undefined);
  equals(span.attr('itemscope'), "");
  equals(span.attr('itemtype'), 'http://xmlns.com/foaf/0.1/Person');
  $.microdata.removeMicrodata($(span));
  equals($('#main > p > span')[0], span[0]);
  $('#main > p').remove();
});

test("test5", function() {
  setup('<p>Last updated <time datetime="2008-10-19">today</time></p>');
  var time = $('#main > p > time');
  $.microdata.addMicrodata($(time),'<> <http://purl.org/dc/elements/1.1/date> "2008-10-19" .');
  equals($('#main > p > time > span').attr('itemscope'), "");
  equals($('#main > p > time > span').attr('itemid'), undefined);
  equals($('#main > p > time').attr('itemprop'), 'http://purl.org/dc/elements/1.1/date');
  equals($('#main > p > time').attr('datetime'), '2008-10-19');
  $.microdata.removeMicrodata($(time),'<> <http://purl.org/dc/elements/1.1/date> "2008-10-19" .');
  equals($('#main > p > time')[0], time[0]);
  $('#main > p').remove();
});

test("test6", function() {
  setup('<p>Last updated <time datetime="2008-10-19">today</time></p>');
  var time = $('#main > p > time');
  $.microdata.addMicrodata($(time),'<> <http://purl.org/dc/elements/1.1/date> "2008-10-19" .');
  equals($('#main > p > time > span').attr('itemscope'), "");
  equals($('#main > p > time > span').attr('itemid'), undefined);
  equals($('#main > p > time').attr('itemprop'), 'http://purl.org/dc/elements/1.1/date');
  equals($('#main > p > time').attr('datetime'), '2008-10-19');
  $.microdata.removeMicrodata($(time));
  equals($('#main > p > time')[0], time[0]);
  $('#main > p').remove();
});

test("test7", function() {
	setup('<p>This photo was taken by <a href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  $.microdata.addMicrodata($(a),'<photo1.jpg> <http://purl.org/dc/elements/1.1/creator> <http://www.blogger.com/profile/1109404> .');
  equals($('#main > p > a > span').attr('itemscope'), "");
  equals($('#main > p > a > span').attr('itemid'), 'photo1.jpg');
  equals(a.attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  $.microdata.removeMicrodata($(a),'<photo1.jpg> <http://purl.org/dc/elements/1.1/creator> <http://www.blogger.com/profile/1109404> .');
  equals($('#main > p > a')[0], a[0]);
  $('#main > p').remove();
});

test("test8", function() {
	setup('<p>This photo was taken by <a href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  $.microdata.addMicrodata($(a),'<photo1.jpg> <http://purl.org/dc/elements/1.1/creator> <http://www.blogger.com/profile/1109404> .');
  equals($('#main > p > a > span').attr('itemscope'), "");
  equals($('#main > p > a > span').attr('itemid'), 'photo1.jpg');
  equals(a.attr('itemprop'), 'http://purl.org/dc/elements/1.1/creator');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  $.microdata.removeMicrodata($(a));
  equals($('#main > p > a')[0], a[0]);
  $('#main > p').remove();
});

module("Testing Selectors");

test('selecting nodes with a particular subject', function () {
  setup('<p><span itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="#CharlesRobertDarwin"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label"><span itemprop="firstName">Charles</span> Robert <span itemprop="surname">Darwin</span></span></span> and his mother <span itemscope itemid="#SusannahDarwin"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:itemid('#CharlesRobertDarwin')");
  equals(darwin.length, 4, "there should be three spans of itemid #CharlesRobertDarwin");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[1]);
  equals(darwin[2], spans[2]);
  equals(darwin[3], spans[3]);
  $('#main > p').remove();
});

test('selecting nodes with any subject', function () {
  setup('<p><span datatype="" itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label" itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="#CharlesRobertDarwin"><span itemprop="firstName">Charles</span> Robert <span itemprop="surname">Darwin</span></span> and his mother <span itemscope itemid="#SusannahDarwin" itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:itemid");
  equals(darwin.length, 4, "there should be four spans that are about (itemid) something or other");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[1]);
  equals(darwin[2], spans[2]);
  equals(darwin[3], spans[3]);
  $('#main > p').remove();
});

test('selecting nodes with a CURIE subject', function () {
  setup('<p><span datatype="" itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="http://example.org/Someone"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">someone</span></span> and <span itemscope itemid="http://example.org/SomeoneElse">someone else</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:itemid('[ex:Someone]')");
  equals(darwin.length, 2, "there should be one span itemid [ex:Someone]");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[1]);
  $('#main > p').remove();
});

test('selecting nodes that represent a particular type of thing', function () {
  setup('<p><span itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="#CharlesRobertDarwin">'+
  '<span datatype="" itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">'+
		'<span itemprop="http://xmlns.com/foaf/0.1/firstName">Charles</span> Robert '+
		'<span itemprop="http://xmlns.com/foaf/0.1/surname">Darwin</span>'+
  '</span></span> and his mother <span itemscope itemid="#SusannahDarwin" itemtype="http://xmlns.com/foaf/0.1/Person"> <span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:itemtype('foaf:Person')");
  equals(darwin.length, 2, "there should be two spans whose type is a person");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[4]);
  $('#main > p').remove();
});

test('selecting nodes that represent any thing', function () {
  setup('<p><span datatype="" itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label"  itemscope itemtype="http://xmlns.com/foaf/0.1/Person" itemid="#CharlesRobertDarwin"><span itemprop="firstName">Charles</span> Robert <span itemprop="surname">Darwin</span></span> and his mother <span itemscope itemid="#SusannahDarwin" itemtype="http://xmlns.com/foaf/0.1/Person"><span itemprop="http://www.w3.org/1999/02/22-rdf-syntax-ns#label">Susannah Darwin</span></span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:itemtype");
  equals(darwin.length, 2, "there should be two spans with a type");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[3]);
  $('#main > p').remove();
});

})(jQuery);