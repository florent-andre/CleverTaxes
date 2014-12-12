/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/**
* @requires jquery.rdf.js
*/
(function($){
  //var $ = jQuery;

  $.microdata = {};

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-time-string
  function validTimeStringLength(s) {
    var m = /^(\d\d):(\d\d)(:(\d\d)(\.\d+)?)?/.exec(s);
    if (m && m[1]<=23 && m[2]<=59 && (!m[4] || m[4]<=59))
      return m[0].length;
    return 0;
  }

  function isValidTimeString(s) {
    return s && validTimeStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#number-of-days-in-month-month-of-year-year
  function daysInMonth(year, month) {
    if (month==1 || month==3 || month==5 || month==7 ||
        month==8 || month==10 || month==12) {
      return 31;
    } else if (month==4 || month==6 || month==9 || month==11) {
      return 30;
    } else if (month == 2 && (year%400==0 || (year%4==0 && year%100!=0))) {
      return 29;
    } else {
      return 28;
    }
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-date-string
  function validDateStringLength(s) {
    var m = /^(\d{4,})-(\d\d)-(\d\d)/.exec(s);
    if (m && m[1]>=1 && m[2]>=1 && m[2]<=12 && m[3]>=1 && m[3]<=daysInMonth(m[1],m[2]))
      return m[0].length;
    return 0;
  }

  function isValidDateString(s) {
    return s && validDateStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-global-date-and-time-string
  function isValidGlobalDateAndTimeString(s) {
    var skip = validDateStringLength(s);
    if (skip && s[skip] == 'T') {
      s = s.substr(skip+1);
      skip = validTimeStringLength(s);
      if (skip) {
        s = s.substr(skip);
        if (s == 'Z')
          return true;
        var m = /^[+-](\d\d):(\d\d)$/.exec(s);
        if (m && m[1]<=23 && m[2]<=59)
          return true;
      }
    }
    return false;
  }

  $.microdata.isValidGlobalDateAndTimeString = isValidGlobalDateAndTimeString;
  $.microdata.isValidDateString = isValidDateString;

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }
	
  function getItems(types) {
    var doc = this[0];
    if (doc.getItems)
      return $(types ? doc.getItems(types) : doc.getItems());
    var selector = $.map(splitTokens(types), function(t) {
      return '[itemtype~="'+t.replace(/"/g, '\\"')+'"]';
    }).join(',') || '*';
    // filter results to only match top-level items.
    // because [attr] selector doesn't work in IE we have to
    // filter the elements. http://dev.jquery.com/ticket/5637
    return $(selector, this).filter(function() {
      return (this.getAttribute('itemscope') != null &&
              this.getAttribute('itemprop') == null);
    });
  }

  // find the furthest ancestor (usually Document)
  function ancestor(node) {
    while (node.parentNode)
      node = node.parentNode;
    return node;
  }

  function resolve(elm, attr) {
    // in order to handle <base> and attributes which aren't properly
    // reflected as URLs, insert a temporary <img> element just before
    // elm and resolve using its src attribute. the <img> element must
    // be created using the parent document due IE security policy.
	var url = elm.getAttribute(attr);
    if (!url)
      return $.rdf.resource($.uri(''));
	else if(url.substring(0,2)=='_:')
	  return $.rdf.blank(url);	
	else {		
    var a = ancestor(elm);
    var p = elm.parentNode;
    var img = (a.createElement ? a : document).createElement('img');
    img.setAttribute('src', url);
    if (p)
      p.insertBefore(img, elm);
    url = img.src;
    if (p)
      p.removeChild(img);
    return $.rdf.resource($.uri(url));}
  }

  function getSubject(elm){
	if(elm.attr("itemid") || $(elm)===$("body")){
		return resolve(elm[0],"itemid");
	}
	else{
		if(elm.attr("id")){
			var ref = $('[itemref*="'+elm.attr("id")+'"]');
			if(ref.length!=0){
				return getSubject(ref[0]);
			}
			else{
				var p = elm.parent();
				return getSubject(parent);
			}
		}
		else{
			var p = elm.parent();
			return getSubject($(p));
		}
	}
  }
  
  function tokenList(attr) {
    return function() {
      return $(splitTokens(this.attr(attr)));
    };
  }

  function itemValue() {
    var elm = this[0];
    if (this.attr('itemprop') === undefined)
      return null;
    if (this.itemScope()) {
      return elm; // or a new jQuery object?
    }
    switch (elm.tagName.toUpperCase()) {
    case 'META':
      return this.attr('content') || '';
    case 'AUDIO':
    case 'EMBED':
    case 'IFRAME':
    case 'IMG':
    case 'SOURCE':
    case 'TRACK':
    case 'VIDEO':
      return resolve(elm, 'src');
    case 'A':
    case 'AREA':
    case 'LINK':
      return resolve(elm, 'href');
    case 'OBJECT':
      return resolve(elm, 'data');
    case 'TIME':
      var datetime = this.attr('datetime');
      if (!(datetime === undefined))
        return datetime;
    default:
      return this.text();
    }
  }

  	function parseEntities(string) {
      var result = "", m, entity;
      if (!/&/.test(string)) {
         return string;
      }
      while (string.length > 0) {
        m = /([^&]*)(&([^;]+);)(.*)/g.exec(string);
        if (m === null) {
          result += string;
          break;
        }
        result += m[1];
        entity = m[3];
        string = m[4];
        if (entity.charAt(0) === '#') {
          if (entity.charAt(1) === 'x') {
              result += String.fromCharCode(parseInt(entity.substring(2), 16));
          } else {
              result += String.fromCharCode(parseInt(entity.substring(1), 10));
          }
        } else {
          switch(entity) {
            case 'amp':
              result += '&';
              break;
            case 'nbsp':
              result += String.fromCharCode(160);
              break;
            case 'quot':
              result += '"';
              break;
            case 'apos':
              result += "'";
              break;
            default:
              result += '&' + entity + ';';
          }
        }
      }
      return result;
    }

    function getAttributes(elem) {
      var i, e, a, tag, name, value, attMap, prefix,
        atts = {},
        nsMap = {};
      e = elem[0];
      nsMap[':length'] = 0;
      if (e.attributes && e.attributes.getNamedItemNS) {
        attMap = e.attributes;
        for (i = 0; i < attMap.length; i += 1) {
          a = attMap[i];
          if (/^xmlns(:(.+))?$/.test(a.nodeName) && a.nodeValue !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(a.nodeValue);
              nsMap[':length'] += 1;
            }
          } else if (/lang|xml:lang|itemid|href|src|itemprop|itemtype|content|datetime/.test(a.nodeName)) {
            atts[a.nodeName] = a.nodeValue === null ? undefined : a.nodeValue;
          }
        }
      } else {
        tag = /<[^>]+>/.exec(e.outerHTML);
        a = attRegex.exec(tag);
        while (a !== null) {
          name = a[1];
          value = a[2] || a[3] || a[4];
          if (/^xmlns/.test(name) && name !== 'xmlns:' && value !== '') {
            prefix = /^xmlns(:(.+))?$/.exec(name)[2] || '';
            if (ncNameRegex.test(prefix) && (prefix !== 'xml' || a.nodeValue === ns.xml) && (a.nodeValue !== ns.xml || prefix === 'xml') && prefix !== 'xmlns' && a.nodeValue !== ns.xmlns) {
              nsMap[prefix] = $.uri(value);
              nsMap[':length'] += 1;
            }
          } else if (/lang|xml:lang|itemid|href|src|imemprop|itemtype|content|datetime/.test(name)) {
            atts[name] = parseEntities(value);
          }
          a = attRegex.exec(tag);
        }
        attRegex.lastIndex = 0;
      }
      return { atts: atts, namespaces: nsMap };
    }
	
    function gleaner(options) {
      var type, atts;
      if (options && options.itemid !== undefined) {
        atts = getAttributes(this).atts;
        if (options.itemid === null) {
          return atts.itemprop !== undefined ||
                 atts['itemtype'] !== undefined;
        } else {
          return getSubject(this).value === options.itemid;
        }
      } else if (options && options.itemtype !== undefined) {
        type = this.attr('itemtype');
        if (type !== undefined) {
          return options.itemtype === null ? true : $.uri(type) === options.itemtype;
        }
        return false;
      } else {
        //return rdfa.call(this, options);
      }
    }	
  
  function properties(name) {
    // Find all elements that add properties to the item, optionally
    // filtered by a property name. Look in the subtrees rooted at the
    // item itself and any itemref'd elements. An item can never have
    // itself as a property, but circular reference is possible.

    var props = [];

    function crawl(root) {
      var toTraverse = [root];

      function traverse(node) {
        for (var i = 0; i < toTraverse.length; i++) {
          if (toTraverse[i] == node)
            toTraverse.splice(i--, 1);
        }
        var $node = $(node);
        if (node != root) {
          var $names = $node.itemProp();
          if ($names.length) {
            if (!name || $.inArray(name, $names.toArray()) != -1)
              props.push(node);
          }
          if ($node.itemScope())
            return;
        }
        $node.children().each(function() {
          traverse(this);
        });
      }

      var context = ancestor(root);
      $(root).itemRef().each(function(i, id) {
        var $ref = $('#'+id, context);
        if ($ref.length)
          toTraverse.push($ref[0]);
      });
      $.unique(toTraverse);

      while (toTraverse.length) {
        traverse(toTraverse[0]);
      }
    }

    if (this.itemScope())
      crawl(this[0]);

    // properties are already sorted in tree order
    return $(props);
  }

  // feature detection to use native support where available
  var t = $('<div itemscope itemtype="type" itemid="id" itemprop="prop" itemref="ref">')[0];

  $.fn.extend({
    items: getItems,
    itemScope: t.itemScope ? function() {
      return this[0].itemScope;
    } : function () {
      return this.attr('itemscope') != undefined;
    },
    itemType: t.itemType ? function() {
      return this[0].itemType;
    } : function () {
      return this.attr('itemtype') || '';
    },
    itemId: t.itemId ? function() {
      return this[0].itemId;
    } : function () {
      return resolve(this[0], 'itemid');
    },
    itemProp: t.itemProp && t.itemProp.length ? function() {
      return $(this[0].itemProp);
    } : tokenList('itemprop'),
    itemRef: t.itemRef && t.itemRef.length ? function() {
      return $(this[0].itemRef);
    } : tokenList('itemref'),
    itemValue: t.itemValue ? function() {
      return this[0].itemValue;
    } : itemValue,
    properties: t.properties && t.properties.namedItem ? function(name) {
      return $(name ? this[0].properties.namedItem(name) : this[0].properties);
    } : properties
  });
  
  $.rdf.gleaners.push({
      name: "microdata",
      gleaner: gleaner
  });
})(jQuery);
