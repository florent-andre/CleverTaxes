/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */

// http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#rdf
(function() {
  var $ = jQuery;

  // a small set of prefixes used by the microdata spec.
  // additional prefixes can be added externally, e.g.:
  //
  // jQuery.extend(jQuery.microdata.rdf.prefix, {
  //   'foo': 'http://example.com/foo#'
  // });
  $.microdata.rdf = {};
  $.microdata.rdf.prefix = {
    'xhv': 'http://www.w3.org/1999/xhtml/vocab#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'owl': 'http://www.w3.org/2002/07/owl#',
    'cc': 'http://creativecommons.org/ns#',
    'dc': 'http://purl.org/dc/terms/'
  };

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }

  function URI(uri) {
    if (uri)
      this.uri = uri; // URI node
    else
      this.uri = '_:n'+URI.prototype.blanks++; // blank node
  }
  URI.prototype.isBlank = function() {
    return this.uri.substr(0, 2) == '_:';
  };
  URI.prototype.equals = function(other) {
    return other instanceof URI && this.uri == other.uri;
  };
  
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#absolute-url
  function isAbsoluteURL(url) {
    // FIXME: not really!
    return url.substr(0, 7) == 'http://';
  }

  function getLang($elem) {
    for (; $elem[0].getAttribute; $elem = $elem.parent()) {
      if ($elem.attr('lang'))
        return $elem.attr('lang');
    }
    return undefined;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#fragment-escaped
  function fragmentEscape(s) {
    return s.replace(/[\"\#\%\<\>\[\\\]\^\{\|\}]/g, function(c) {
      return '%'+c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  
  function createCurieAttr(elem, attr, uri) {
      var m, curie, value;
      try {
        curie = elem.createCurie(uri);
      } catch (e) {
        if (uri.toString() === rdfXMLLiteral) {
          elem.attr('xmlns:rdf', ns.rdf);
          curie = 'rdf:XMLLiteral';
        } else {
          m = /^(.+[\/#])([^#]+)$/.exec(uri);
          elem.attr('xmlns:ns' + nsCounter, m[1]);
          curie = 'ns' + nsCounter + ':' + m[2];
          nsCounter += 1;
        }
      }
      value = getAttribute(elem, attr);
      if (value !== undefined) {
        if ($.inArray(curie, value.split(/\s+/)) === -1) {
          elem.attr(attr, value + ' ' + curie);
        }
      } else {
        elem.attr(attr, curie);
      }
    }

	function	createResourceAttr(elem, attr, resource) {
      var ref;
      if (resource.type === 'bnode') {
        ref = '[_:' + resource.id + ']';
      } else {
        ref = $(elem).base().relative(resource.value);
      }
      elem.attr(attr, ref);
    }
	

	
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#extracting-rdf
  function extractDocumentTriples(triples) {
    var $title = $('title').first();
    if ($title.length == 1)
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri('http://purl.org/dc/terms/title'),
                              $rdf.literal($title.text(), getLang($title))));

    $('a[rel][href],area[rel][href],link[rel][href]').each(function(i, elm) {
      var $elm = $(elm);
      var tokens = {};
      $.each(splitTokens($elm.attr('rel')), function(i, t) {
        t = t.toLowerCase();
        if (tokens[t])
          tokens[t]++;
        else
          tokens[t] = 1;
      });
      if (tokens.up && tokens.up > 1)
        delete tokens.up;
      if (tokens.alternate && tokens.stylesheet) {
        delete tokens.alternate;
        delete tokens.stylesheet;
        tokens['ALTERNATE-STYLESHEET'] = 1;
      }
      for (t in tokens) {
        var predicate;
        if (t.indexOf(':') == -1)
          predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(t);
        else if (isAbsoluteURL(t))
          predicate = t;
        else
          continue;
        // FIXME: resolve href
        triples.push($.rdf.triple($.uri(document.location.href),
                                $.uri(predicate),
                                $.uri(elm.href)));
      }
    });

    $('meta[name][content]').each(function(i, meta) {
      var $meta = $(meta);
      var name = $meta.attr('name');
      var predicate;
      if (name.indexOf(':') == -1)
        predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(name.toLowerCase());
      else if (isAbsoluteURL(name))
        predicate = name;
      else
        return;
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri(predicate),
                              $.rdf.literal($meta.attr('content'), getLang($meta))));
    });

    $('blockquote[cite],q[cite]').each(function(i, elm) {
      // FIXME: resolve cite attribute
      triples.push($.rdf.triple($.uri(document.location.href),
                              $.uri('http://purl.org/dc/terms/source'),
                              $.uri($(elm).attr('cite'))));
    });

    // list of {item: ..., subject: ...} objects
    var memory = [];
    $(document).items().each(function(i, item) {
      var t = $.rdf.triple($.uri(document.location.href),
                         $.uri('http://www.w3.org/1999/xhtml/microdata#item'),
                         generateItemTriples(triples, item, memory));
      triples.push(t);
    });
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#generate-the-triples-for-an-item
  function generateItemTriples(triples, item, memory, fallbackType) {
    var $item = $(item);
    var subject;
    $.each(memory, function(i, e) {
      if (e.item == item) {
        subject = e.subject;
        return false;
      }
    });
    if (subject)
      return subject;
	subject = $item.itemId();
    memory.push({item: item, subject: subject});
    var type = '';
    if (isAbsoluteURL($item.itemType())) {
      type = $item.itemType();
      triples.push($.rdf.triple(subject,
                              $.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')),
                              $.rdf.resource($.uri(type))));
      if (type.indexOf('#') == -1)
        type += '#';
      if (type.indexOf(':') < type.indexOf('#'))
        type += ':';
    }
    if (!type && fallbackType)
      type = fallbackType;
    $item.properties().each(function(i, prop) {
      var $prop = $(prop);
      $prop.itemProp().each(function(i, name) {
        var value;
		if ($prop.itemScope()) {
          value = generateItemTriples(triples, prop, memory, type);
        } else if (/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(prop.tagName.toUpperCase())) {
          value = $prop.itemValue();
        } else {
          value = $.rdf.literal('"'+$prop.itemValue()+'"');
        }
        var predicate;
        if (isAbsoluteURL(name)) {
          predicate = name;
        } else if (name.indexOf(':') == -1) {
          predicate = 'http://www.w3.org/1999/xhtml/microdata#'+fragmentEscape(type+name);
        }
        triples.push($.rdf.triple(subject, $.rdf.resource($.uri(predicate)), value));
      });
    });
    return subject;
  }

  function getTurtle(triples) {
    var used = [];

    function format(term) {
      if (term instanceof Triple) {
        return format(term.s)+' '+format(term.p)+' '+format(term.o)+' .';
      } else if (term instanceof URI) {
        // blank nodes
        if (term.isBlank())
          return term.uri;
        // prefixed notation
        for (name in $.microdata.rdf.prefix) {
          var uri = $.microdata.rdf.prefix[name];
          if (term.uri.substr(0, uri.length) == uri) {
            if ($.inArray(name, used) == -1)
              used.push(name);
            return name+':'+term.uri.substr(uri.length);
          }
        }
        // plain URIs
        return '<'+term.uri+'>';
      } else if (term instanceof Literal) {
        return '"'+term.string.replace(/([\\"])/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n')+'"'+
          (term.lang ? ('@'+term.lang) : '');
      }
    }

    var body = '';
    while (triples.length) {
      var subject = triples[0].s;
      var batch = [];
      // extract all triples that share same subject into batch
      triples = $.grep(triples, function (t) {
        if (subject.equals(t.s)) {
          batch.push(t);
          return false;
        }
        // leave for the next round
        return true;
      });

      // print batch with same subject
      if (batch.length == 1) {
        // single-line output
        body += format(batch[0])+'\n';
      } else {
        // subject on first line, predicate-objects follow indented
        body += format(batch[0].s)+'\n';
        $.each(batch, function(i, t) {
          body += '  '+format(t.p)+' '+format(t.o)+' '+((i+1<batch.length)?';':'.')+'\n';
        });
      }
    }

    var head = '';
    $.each(used, function(i, name) {
        head += '@prefix '+name+': <'+$.microdata.rdf.prefix[name]+'> .\n';
    });
    return head+'\n'+body;
  }

  $.microdata.triples = function(selector, options) {
    options = $.extend({owl:false}, options);
    URI.prototype.blanks = 0;
    var triples = [];
    if (selector) {
      var memory = [];
      $(selector).each(function(i, item) {
			generateItemTriples(triples, item, memory);
      });
    } else {
      extractDocumentTriples(triples);
    }

    if (options.owl) {
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Awork'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/2002/07/owl#sameAs')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Atitle'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://purl.org/dc/terms/title')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Aauthor'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://creativecommons.org/ns#attributionName')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Alicense'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/1999/xhtml/vocab#license')));
    }

    return triples;
  };
  
  function addItemscope(selector){
	if(!selector.itemScope()){
		selector.attr("itemscope","");
		return true;
	}
	else{
		throw 'Failed to add "itemscope". Element already has "itemscope" attribute';
		return false;
	}
  }
  
  function addItemtype(selector,type){
	if(!selector.itemType()&&selector.itemScope()){
		createResourceAttr(selector, "itemtype", type);
		return true;
	}
	else{
		if(selector.itemType())
			{throw 'Failed to add "itemtype". Element already has "itemtype" attribute';}
		if(!selector.itemScope())
			{throw 'Failed to add "itemtype". Element must have "itemscope" attribute';}	
		return false;
	}
  }
  
  function addItemid(selector,id){
	if(!selector.attr("itemid") && selector.itemScope()){
		if(id!=$.uri("") && id!=$.rdf.resource("<>"))
			createResourceAttr(selector, "itemid", id);
		return true;
	}
	else{
		if(selector.attr("itemid")){
			if(id==selector.attr("itemid")){
				return true;
			}
			else{
				throw 'Failed to add "itemid". Element already has "itemid" attribute';
			}
		}
		if(!selector.itemScope()){
			throw 'Failed to add "itemid". Element must have "itemscope" attribute';
			return false;
		}	
	}
  }
  
  function addProperty(selector,name){
	createResourceAttr(selector,"itemprop",name);
  }
  
  $.microdata.addMicrodata = function(selector,triple){
	ns = $(selector).xmlns();
	if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: ns, base: $(selector).base() });
      } else if (triple.rdfquery) {
        addMicrodata.call($(selector), triple.sources().get(0));
        return $(selector);
      } else if (triple.length) {
        for (i = 0; i < triple.length; i += 1) {
          addMicrodata.call($(selector), triple[i]);
        }
        return $(selector);
      }

	var subject = triple.subject;
	var object = triple.object;
	var property = triple.property;

	var d = Date.parse(object);
	var hasMicrodata = selector.itemScope()||selector.attr('itemid')||selector.itemType()||selector.attr('itemprop')||selector.attr('itemref');
	var typedItem = property===$.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
	var fits;
	if(selector){
		if(!hasMicrodata){
			if(!(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO|META|TIME$/.test(selector[0].tagName.toUpperCase()))){
				fits = selector.text() == object.value || typedItem;
				if(fits){
					addItemscope(selector);
					addItemid(selector, subject);
					if(typedItem){
						addItemtype(selector, object);
					}
					else{
						selector.wrapInner('<span class="microdata"/>');
						createResourceAttr($(selector.children('.microdata')[0]), "itemprop", property);			
					}
				}
				else{
					throw "Failed to add microdata. Triple's object doesn't fit into the element.";
				}
			}
			else{
				selector.attr("itemprop","");
				fits = typedItem || selector.itemValue() == object.value || selector.itemValue().value == object.value;
				if(fits){
					createResourceAttr(selector, "itemprop", property);
					if(selector.attr("id")){
						selector.wrapInner('<span itemscope itemref="'+selector.attr("id")+'" class="microdata"/>');
					}
					else{
						var id = URI();
						selector.attr("id",subject.toString());
						selector.attr("class","microdata");
						selector.wrapInner('<span itemscope itemref="'+subject.toString()+'" class="microdata"/>');
					}
					addItemid($(selector.children('.microdata')[0]), subject);
					if(typedItem){
						addItemtype($(selector.children('.microdata')[0]), object);
					}
				}
				else{
					selector.removeAttr("itemprop");
					throw "Failed to add microdata. Triple's object doesn't fit into the element.";
				}	
			}
		}
		else{
			fits = typedItem && (selector.itemScope()&& subject == selector.itemId());
			if(fits){ //add type to item
				if(typedItem){
					addItemtype(selector, object);
				}	
			}
			fits = selector.itemScope()&& subject == selector.itemId() && object.value == selector.text();
			if(fits){ //add new property to item
				selector.wrapInner('<span class="microdata"/>');
				createResourceAttr($(selector.children('.microdata')[0]), "itemprop", property);
			}
		}
	}	
	selector.trigger("rdfChange");	
  };
  
    $.microdata.removeMicrodata = function(selector,triple){
		if(!triple){
			selector.removeAttr("itemscope");
			selector.removeAttr("itemid");
			selector.removeAttr("itemtype");
			if(selector.hasClass("microdata")&& !selector.attr("id")){
				selector.removeAttr("id");
			}
			selector.removeAttr("itemprop");
			if(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(selector[0].tagName.toUpperCase())){
				selector.removeAttr("itemprop");
			}
			else{
				selector.children().each(function(){
					if($(this).hasClass("microdata")){
						var inner = $(this).html();
						var parent = $(this).parent();
						var toremove = $(this); 
						toremove.remove();
						$(parent).append(inner);
					}
				});
				selector.children().each(function(){
					$.microdata.removeMicrodata($(this));
				});
			}
		}
		else{
			ns = $(selector).xmlns();
			if (typeof triple === 'string') {
				triple = $.rdf.triple(triple, { namespaces: ns, base: $(selector).base() });
			} else if (triple.rdfquery) {
				$.microdata.removeMicrodata.call($(selector), triple.sources().get(0));
				return $(selector);
			} else if (triple.length) {
				for (i = 0; i < triple.length; i += 1) {
					$.microdata.removeMicrodata.call($(selector), triple[i]);
				}
				return $(selector);
			}

			var subject = triple.subject;
			var object = triple.object;
			var property = triple.property;
			if(!(/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO|META|TIME$/.test(selector[0].tagName.toUpperCase()))){
				var typedItem = property===$.rdf.resource($.uri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
				var fits = selector.text() == object.value || typedItem;
				fits = fits && subject == selector.itemId();
				var propChild = $('span[itemprop*="'+property.value.toString()+'"]');//??? add check that found elements are children of selector
				if(propChild.length!=0 && !typedItem){
					fits = true;}
				else{
					if(!typedItem){
						fits = false;
					}
				}
				if(fits){
					selector.removeAttr("itemscope");
					selector.removeAttr("itemid");
					if(typedItem){
						selector.removeAttr("itemtype");
					}
					else{
						if(propChild.hasClass("microdata")){
							var inner = propChild.html();
							var parent = propChild.parent();
							var toremove = $(this); 
							toremove.remove();
							parent.append(inner);
						}					
						else{
							propChild.removeAttr("itemprop");
						}
					}
				}
				else{
					throw "Failed to remove microdata. Triple's object doesn't fit into the element.";
				}
			}	
		} 
		selector.trigger("rdfChange");	
	};
	
})();
