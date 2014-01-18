// Linked Heritage 2012
// Array

(function (){

//-- arrays utilities
	
	toArray = function(v){
		return [].slice.call(v);
	};
	
	//TODO : create a lib for array management
	//look at array imps here and see if include in the lib : https://github.com/mbostock/d3/wiki/Arrays#wiki-d3_nest	

	//add the last() utility to array
	
	// ## Array.last
	// Get the last value of Array
	// **Returns**:
	// *{Array[]}* : Last value of Array
	// **Example**:
	//
	//var last = Tab.last();
	if(!Array.prototype.last) {
	    Array.prototype.last = function() {
	        return this[this.length - 1];
	    };
	}
	
	// ## Array.prototype.lazyIndexOf
	// Array.prototype.lazyIndexOf = function (f,searchElement /*, fromIndex */ )
	//lazy indexOf allow you to define your own comparator.
	// **Parameters**:
	// *{function}* **f** The array caller param
	// *{string}* **searchElement** the variable pass to indexOf
	// **Returns**:
	// *{bool}* : this comparator must compare two variables and return true/false
	// **Example**:
	// var lazyindex = Tab.lazyIndexOf(function(a,b){return a == b;}, "var search");
	
	if (!Array.prototype.lazyIndexOf) {  
	    Array.prototype.lazyIndexOf = function (f,searchElement /*, fromIndex */ ) {  
	        "use strict";  
	        if (this == null) {  
	            throw new TypeError();  
	        }  
	        var t = Object(this);  
	        var len = t.length >>> 0;  
	        if (len === 0) {  
	            return -1;  
	        }  
	        var n = 0;  
	        if (arguments.length > 0) {  
	            n = Number(arguments[2]);
	            if (n != n) { // shortcut for verifying if it's NaN  
	                n = 0;  
	            } else if (n != 0 && n != Infinity && n != -Infinity) {  
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));  
	            }  
	        }  
	        if (n >= len) {  
	            return -1;  
	        }  
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
	        for (; k < len; k++) {
	            //if (k in t && t[k] === searchElement) {
	        	if (k in t && f.call(this,t[k],searchElement)) {
	                return k;  
	            }  
	        }  
	        return -1;  
	    };
	} 
	
	// ## Array.prototype.merge
	// Array.prototype.merge = function(/* variable number of arrays */)
	//	Put many arrays in one, with unique element (remove duplicates)
	// **Parameters**:
	// *{function}* **f** The array caller param
	// *{array}* **searchElement** the others array 
	// **Returns**:
	// *{array}* : return the first array merge with others array
	// **Example**:
	// 	tab.merge(function(a,b){return a == b;}, tab2, tab3);	

	Array.prototype.merge = function(/* variable number of arrays */){
	    for(var i = 0; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < array.length; j++){
	            if(this.indexOf(array[j]) === -1) {
	                this.push(array[j]);
	            }
	        }
	    }
	    return this;
	};
	
	// ## Array.prototype.lazyMerge
	// Array.prototype.lazyMerge = function(f /* variable number of arrays */)
	// lazy merge, merge array with lazy comparator
	// **Parameters**:
	// *{function}* **f** The array caller param
	// *{array}* **searchElement** the others array 
	// **Returns**:
	// *{array}* : return the first array
	// **Example**:
	// 	tab.lazyMerge(function(a,b){return a == b;}, tab2, tab3);	


	Array.prototype.lazyMerge = function(f /* variable number of arrays */){
	    for(var i = 1; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < array.length; j++){
	            if(this.lazyIndexOf(f,array[j]) === -1) {
	                this.push(array[j]);
	            }
	        }
	    }
	    return this;
	};

	// ## Array.prototype.lazyMinus
	// Array.prototype.lazyMinus = function(f /* variable number of arrays */)
	// lazy minus, substract content of all array in param from the caller
	// **Parameters**:
	// *{function}* **f** The array caller param
	// *{array}* **searchElement** the others array 
	// **Returns**:
	// *{array}* : return a new array
	// **Example**:
	// 	tab.lazyMinus(function(a,b){return a == b;}, tab2, tab3);	
	
	Array.prototype.lazyMinus = function(f /* variable number of arrays */){
		var result = new Array();
	    for(var i = 1; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < this.length; j++){
	        	var po = array.lazyIndexOf(f,this[j]);
	            if(po === -1) {
	                result.push(this[j]);
	            }
	        }
	    }
	    return result;
	};
	
	// ## Array.prototype.lazyUnion
	// Array.prototype.lazyUnion = function(f /* variable number of arrays */)
	// lazyunion : only keep elements in the original array that is in *all* params arrays
	// **Parameters**:
	// *{function}* **f** The array caller param
	// *{array}* **searchElement** the others array 
	// **Returns**:
	// *{array}* : return the first array
	// **Example**:
	// 	var lazyunion = Tab.lazyUnion(function(a,b){return a == b;}, Tab2, Tab3);
		
	Array.prototype.lazyUnion = function(f /* variable number of arrays */){
	    for(var i = 1; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < this.length; j++){
	            if(array.lazyIndexOf(f,this[j]) === -1) {
					this.splice(j,1);
					j--;
				}
	        }
	    }
	    return this;
	};
	
	// ## Array.prototype.lazyUnionAndMerge
	// Array.prototype.lazyUnionAndMerge = function(f /* variable number of arrays */)
	// lazyunion + lazymerge
	// **Parameters**:
	// *{array}* **searchElement** the others array 
	// **Example**:
	// 	Tab.lazyUnionAndMerge(function(a,b){return a == b;}, Tab2, Tab3);

	//TODO : test if multiple array is well passing throw
	Array.prototype.lazyUnionAndMerge = function(f /* variable number of arrays */){
		this.lazyUnion.apply(this, arguments);
		this.lazyMerge.apply(this, arguments);
	};
	
	//-- end arrays utilities
})();	