//Question to ask on ml.
// y(d.amount) give the y value, but how I can manage the inverse function ? From y position, get the amount ?
//will be really usefull for calculation during drag and drop

//function for the data transformation
function prepareData(/*{data : d, source : "sourceName", referenceBudget : value}*/){
	//console.log ("prepareData");
	
	var args = Array.prototype.slice.call(arguments, 0);

	//prepare data structure and add functions.

	//data transformation add the source attribute to objects
	args.forEach(function(d,i){
		
		Object.defineProperty(d, "unassignied", {
			value : null,
			writable : true,
			enumerable : false,
			configurable : false});


		d.data.forEach(function(a,j){
			//console.log (a);
			//console.log(j);
			Object.defineProperty(a, "_parent", {
				value : d,
				writable : false,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "_amount", {
				value : 0,
				writable : true,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "_percentage", {
				value : 0,
				writable : true,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "source", {
				get : function(){return this._parent.source},
				enumerable : true,
				});

			Object.defineProperty(a, "unassignied", {
				get : function(){
					if(this !== this._parent.unassignied) return this._parent.unassignied;
					return this;
				},
				enumerable : true,
				configurable : false});

			Object.defineProperty(a, "amount", {
				get : function(){return this._amount},
				set : function(a){
					this._percentage = a / this._parent.referenceBudget;
					//don't calculate the unassignied for the unassignied object
					if(this !== this.unassignied){
						this.unassignied.amount += this._amount - a;
					}
					this._amount = a;

				},
				enumerable : true,
				configurable : false});

			Object.defineProperty(a, "percentage", {
				get : function(){return this._percentage},
				set : function(a){
					this._amount = this._parent.referenceBudget * a /100;

					//don't calculate the unassignied for the unassignied object
					if(this !== this.unassignied){
						this.unassignied.percentage += this._percentage - a;
					}
					this._percentage = a;

				},
				enumerable : true,
				configurable : false});
			//We generate here a random id in order to be able to define a key
			//TODO : use a real unique number
			a.sourceID = Math.random();


			//if(a.source == "user" && a.id==0) unassignied = a;
			//add the unassignied element to the parent
			//console.log (a.source);
			//if (a.source != "allpeople"){
				if( (a.id == 0)){
					//init to 100% as after values are removed from unassignied
					a.percent = 100;
					d.unassignied = a;
				}
			//}
			//object data initialization
			a.percentage = a.percent;

		});//d.data.forEach
	});
}
function prepareDataBis(/*{data : d, source : "sourceName", referenceBudget : value}*/){
	//console.log ("prepareDataBis");
	
	var args = Array.prototype.slice.call(arguments, 0);

	//prepare data structure and add functions.

	//data transformation add the source attribute to objects
	args.forEach(function(d,i){
		
		Object.defineProperty(d, "unassignied", {
			value : null,
			writable : true,
			enumerable : false,
			configurable : false});


		d.data.forEach(function(a,j){
			//console.log (a);
			//console.log(j);
			Object.defineProperty(a, "_parent", {
				value : d,
				writable : false,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "_amount", {
				value : 0,
				writable : true,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "_percentage", {
				value : 0,
				writable : true,
				enumerable : false,
				configurable : false});

			Object.defineProperty(a, "source", {
				get : function(){return this._parent.source},
				enumerable : true,
				});

			Object.defineProperty(a, "unassignied", {
				get : function(){
					if(this !== this._parent.unassignied) return this._parent.unassignied;
					return this;
				},
				enumerable : true,
				configurable : false});

			Object.defineProperty(a, "amount", {
				get : function(){return this._amount},
				enumerable : true,
				configurable : false});

			Object.defineProperty(a, "percentage", {
				get : function(){return this._percentage},
				set : function(a){
					this._amount = this._parent.referenceBudget * a /100;

					//don't calculate the unassignied for the unassignied object
					
					this._percentage = a;

				},
				enumerable : true,
				configurable : false});
			//We generate here a random id in order to be able to define a key
			//TODO : use a real unique number
			a.sourceID = Math.random();


			//if(a.source == "user" && a.id==0) unassignied = a;
			//add the unassignied element to the parent
			//console.log (a.source);
			//if (a.source != "allpeople"){
				
				if( (a.id == 0)){
					//init to 100% as after values are removed from unassignied
					//a.percent = 100;
					d.unassignied = a;
				}
			//}
			//object data initialization
			a.percentage = a.percent;

		});
	});
}

/**
 * Main function, manage the render of the graph
 */
function print( /*An array of prepared data*/ args, /*boolean*/ initAxes, /*boolean*/ modifiable){
	console.log ("print");
	var data = [];
	var titleGraph = "";
	args.forEach(function(arr,i){
		arr.data.reduce(function(p,c){
			var i = p.lazyIndexOf(function(a,b){
					return a.lazyIndexOf(function(x,y){
						return x.id == y.id}
					,b) != -1;
				},c);
			//console.log (i);
			//console.log (c);
			if(i != -1){
				p[i].push(c);
			}else{
				p.push([c]);
			}
			return p;
		},data);

	});
	//console.log (data);
	var margin = {top: 20, right: 20, bottom: 430, left: 40},
		    width = 1060 - margin.left - margin.right,
		    height = 900 - margin.top - margin.bottom;

	var svg = d3.select("#chart svg g");
	if(svg.empty()){
		svg = d3.select("#chart").append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			    .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	}


	var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.ordinal()
	    //.range(["#98abc5", "#ff8c00","#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);
	.range(["#F0AD4E", "#428BCA","#5CB85C", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

	var xAxis = d3.svg.axis()
	    .scale(x0)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format(".2s"));



	function displayBar(data,svg,printAxes){
	
		//console.log ("displayBar" + titleGraph);
		function budgetId(d){
			//@TODO : see why this number generation
// 						return d.sourceID+d.amount/100000;
			//or a string id generation don't work
// 						return d.sourceID+"_"+d.amount+"_"+d.source;
			return Math.random();
		}

		function getHeight(d){
			//console.log ("getHeight");
			return height - y(d.amount);
		}

		function printAxis(){
			//console.log ("printAxis" + 	titleGraph);
			
			svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis)
		      .selectAll("text")
			    .attr("y", 0)
			    .attr("x", -10)
			    .attr("dy", ".35em")
			    .attr("transform", "rotate(-75)")
			    .style("text-anchor", "end");
		      ;

			svg.append("g")
			    .attr("class", "y axis")
			    .call(yAxis)
			    .append("text")
			    .attr("transform", "rotate(-90)")
			    .attr("y", 6)
			    .attr("dy", ".71em")
			    .style("text-anchor", "end")
			    .text("Amount");
			//pour le titre
			svg.append("text")
        		.attr("x", (width / 2))             
        		.attr("y", 0 - (margin.top / 2))
        		.attr("text-anchor", "middle")  
        		.style("font-size", "16px") 
        		.style("text-decoration", "underline")  
        		.text("");
		}

		function addModifyButtons(){
			

			var buttonHeight = 15,
				buttonColor = "#D9534F",
				pixelValue,
				starty,
				startValue,
				previousValue,
				maxValue
			;

			function dragmove(d) {
				//console.log ("dragmove");
				function amountFromPosition(y){
					return startValue + (starty - y - buttonHeight)*pixelValue;
				}

				var amount = amountFromPosition(d3.event.y);
				if(amount >= 0 && amount <= maxValue){
					d3.select(this).attr("y", d.y = d3.event.y);

					d.amount = amount;
				}

		    }

			var drag = d3.behavior.drag()
					    .on("dragstart",function(d){
					    	starty =  +d3.select(this).attr("y") + buttonHeight;
					    	pixelValue = d.amount / getHeight(d);
					    	startValue = d.amount;
					    	previousValue = d.amount;
					    	maxValue = d.amount + d.unassignied.amount;
					    })
					    .on("drag", dragmove)
							.on("dragend",function(d){
								displayBar(data,svg);
						});

			var buttons = state.selectAll("rect.button")
		      .data(function(d,i) {
		    	  return d.reduce(function(p,c) {
		    	   	if (((c.source == "Vous") || (c.source == "User") ) && c.id != 0) 
		    	   		p.push(c); return p; 
		    	   },[]);
		    	}, function(d){
		    		return budgetId(d);
		    	})
		    .enter();

			buttons.append("rect")
			  .attr("class","button")
		      .attr("width", x1.rangeBand())
		      .attr("x", function(d) {
		    	  return x1(d.source); })
		      .attr("y", function(d) {
		    	  return y(d.amount) - buttonHeight ; })
		      .attr("height", function(d) {
		    	  return buttonHeight; })
		      .style("fill", function(d) { return buttonColor; })
		      .attr("cursor","ns-resize")
		      //drag and drop related
		      .call(drag);
		      ;
		}

		var ageNames = [];
		args.forEach(function(p,i){
			  ageNames.push(p.source);
		});

		x0.domain(data.map(function(d) { return d[0].label; }));
		x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
		y.domain([0, d3.max(data, function(d) { return d3.max(data, function(arr){
			  return d3.max(arr,function(d) { return d.amount; })
		}); })]);

		if(printAxes) printAxis();

		var state = svg.selectAll("g.budgetLine")
		      .data(data,function(d){
		    	  //console.log(d.reduce(function(p,c){ return p+"|"+budgetId(c); },""));
		    	  return d.reduce(function(p,c){ return p+"|"+budgetId(c); },"");
		    	  //return Math.random();
		      });

		state.exit().remove();

		var newState = state.enter().append("g")
		      .attr("class", "budgetLine")
		      .attr("transform", function(d) {
		    	  return "translate(" + x0(d[0].label) + ",0)"; });

		var bars = state.selectAll("rect.bar")
		      .data(function(d,i) {
		    	  return d.map(function(v) { return v; });
		    	}, function(d){
		    		return budgetId(d);
		    	})
		    ;

		var t = bars.enter();
		bars.enter().append("rect")
			  .attr("class","bar")
		      .attr("width", x1.rangeBand())
		      .attr("x", function(d) {
		    	  return x1(d.source); })
		      .attr("y", function(d) {
		    	  return y(d.amount); })
		      .attr("height", function(d) {
		    	  return getHeight(d); })
		      .style("fill", function(d) { return color(d.source); });

		bars.exit().remove();

		if(modifiable){
			addModifyButtons();
		}

		var t = ageNames.slice().reverse();
		var tt = ageNames.slice();

		var legend = svg.selectAll(".legend")
						.data(ageNames.slice())
						.enter().append("g")
						.attr("class", "legend")
						.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
	      .attr("x", width - 18)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);

		legend.append("text")
	      .attr("x", width - 24)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d) { return d; });

	}
	//console.log (data);
	displayBar(data,svg,initAxes);


};

var ref,name, state, user, people;
var englais;
function graphRender(taxAmount, name){
	console.log (englais);
	//console.log ("graphRender");

	var realReferenceBudget = "378440180000"; //378 billions
	var userReferenceBudget = taxAmount;
	var name = name;

	//ref = realReferenceBudget;
	ref = userReferenceBudget;
	if (englais){
		state = {data : dataInit, source : "State",referenceBudget : ref};
		user = {data : dataInit2, source : "User", referenceBudget : ref, name:name};
	}else{
		state = {data : dataInit, source : "Etat",referenceBudget : ref};
		user = {data : dataInit2, source : "Vous", referenceBudget : ref, name:name};
	}
	prepareData(state);

	
	//console.log (dataInit2);
	//console.log (user);
	prepareData(user);
	//console.log (user);
	
	$.couch.db("clevertaxes").view("lines/lines", {

	    success: function(dataAvg) {
	    	var lines = new Array();
	    	//console.log(dataAvg);
	    	dataAvg.rows.forEach(function(entry) {
	      		var p = {
	      			"id":entry.key,
	      			"label":getLabelFromId(entry.key),
	      			"percent":entry.value * 1.0
	      		};
	      		lines.push(p);
      		});
			//console.log (lines);
      		function getLabelFromId(id){
      			switch(id) {		
					case 0 : 
						return "Non assigné"; break;
		  			case 1 : 
		  				return "Économie "; break;
		  			case 2 : 
		  				return "Écologie, développement et aménagement durables "; break;
		  			case 3 : 
		  				return "Ville et logement "; break;
		  			case 4 : 
		  				return "Travail et emploi "; break;
		  			case 5 : 
		  				return "Sécurité civile "; break;
		  			case 6 : 
		  				return "Sécurité "; break;
		  			case 7 : 
		  				return "Sport, jeunesse et vie associative "; break;
		  			case 8 : return "Solidarité, insertion et égalité des chances "; break;
		  			case 9 : return "Santé "; break;
		  			case 10: return "Régimes sociaux et de retraite "; break;
		  			case 11: return "Remboursements et dégrèvements "; break;
		  			case 12: return "Relations avec les collectivités territoriales "; break;
		  			case 13: return "Recherche et enseignement supérieur "; break;
		  			case 14: return"Provisions "; break;
		  			case 15: return"Pouvoirs publics "; break;
		  			case 16: return"Politique des territoires "; break;
		  			case 17: return"Outre-mer "; break;
		  			case 18: return"Médias, livre et industries culturelles "; break;
		  			case 19: return"Justice "; break;
		  			case 20: return"Immigration, asile et intégration "; break;
		  			case 21: return"Gestion des finances publiques et des ressources humaines "; break;
		  			case 22: return"Enseignement scolaire "; break;
		  			case 23: return"Engagements financiers de l'État "; break;
		  			case 24: return"Défense "; break;
		  			case 25: return"Direction de l'action du Gouvernement "; break;
		  			case 26: return"Culture "; break;
		  			case 27: return"Conseil et contrôle de l'État "; break;
		  			case 28: return"Anciens combattants, mémoire et liens avec la nation "; break;
		  			case 29: return"Aide publique au développement "; break;
		  			case 30: return"Agriculture, pêche, alimentation, forêt et affaires rurales "; break;
		  			case 31: return"Administration générale et territoriale de l'État "; break;
		  			case 32: return"Action extérieure de l'État "; break;
		  			default:
        				return "label";        				
				} 
      		}

      	if (englais){
			people = {data : lines, source : "Average", referenceBudget : ref};
		}else{
			people = {data : lines, source : "Moyenne", referenceBudget : ref};
		}
	    	
 
			prepareData(people);
	    },
	    error: function(status) {
	      console.log(status);
	    },
	    group: true //pour executer la fonction on reduce
	});

	
	/*
	people = {data : dataInit3, source : "allpeople", referenceBudget : ref}; 
	    	//console.log(people);  
	    	//console.log(people1); 
			prepareData(people);
	*/
	

	print([state],true);
};

function graphRenderById(docId){
	console.log (englais);
	var realReferenceBudget = "378440180000"; //378 billions
	
	$.ajaxSetup({
		async: false
	});

	var result = $.couch.db("clevertaxes").openDoc(docId);

	result.then(function(d,i){
		var lines = new Array();
		var sum = 0;
		var sum1 = 0;
	    d.lines.forEach(function(entry) {
	      	var p = {
	      		"id":entry.id,
	      		"label":entry.label,
	      		"percent":entry.percentage * 1.0
	      	};
	      		//console.log(entry.key+" " +entry.value);
	      		//console.log(p);
	      	//sum1 +=entry.amount* 1.0;
	      	//sum +=entry.amount* 1.0;
	      	lines.push(p);
      	});
      	//console.log(sum);
		if (englais){
			user = {data : lines, source : "User", referenceBudget : d.referenceBudget, name:d.name, graphicName : d.graphicName};
		}else{
		
			user = {data : lines, source : "Vous", referenceBudget : d.referenceBudget, name:d.name, graphicName : d.graphicName};
		}
		
		ref = d.referenceBudget;
		name = d.name;
		prepareDataBis(user);
		

	});
	if (englais){
		state = {data : dataInit, source : "State",referenceBudget : ref};
	}else{
		
		state = {data : dataInit, source : "Etat",referenceBudget : ref};
	}
	
	prepareData(state);	

	$.couch.db("clevertaxes").view("lines/lines", {
		
	    success: function(dataAvg) {
	    	var lines = new Array();
	    	//console.log(dataAvg);
	    	dataAvg.rows.forEach(function(entry) {
	      		var p = {
	      			"id":entry.key,
	      			"label":getLabelFromId(entry.key),
	      			"percent":entry.value * 1.0
	      		};
	      		//console.log(entry.key+" " +entry.value);
	      		//console.log(p);
	      		lines.push(p);
      		});
			//console.log (lines);
      		function getLabelFromId(id){
      			switch(id) {		
					case 0 : 
						return "Non assigné"; break;
		  			case 1 : 
		  				return "Économie "; break;
		  			case 2 : 
		  				return "Écologie, développement et aménagement durables "; break;
		  			case 3 : 
		  				return "Ville et logement "; break;
		  			case 4 : 
		  				return "Travail et emploi "; break;
		  			case 5 : 
		  				return "Sécurité civile "; break;
		  			case 6 : 
		  				return "Sécurité "; break;
		  			case 7 : 
		  				return "Sport, jeunesse et vie associative "; break;
		  			case 8 : return "Solidarité, insertion et égalité des chances "; break;
		  			case 9 : return "Santé "; break;
		  			case 10: return "Régimes sociaux et de retraite "; break;
		  			case 11: return "Remboursements et dégrèvements "; break;
		  			case 12: return "Relations avec les collectivités territoriales "; break;
		  			case 13: return "Recherche et enseignement supérieur "; break;
		  			case 14: return"Provisions "; break;
		  			case 15: return"Pouvoirs publics "; break;
		  			case 16: return"Politique des territoires "; break;
		  			case 17: return"Outre-mer "; break;
		  			case 18: return"Médias, livre et industries culturelles "; break;
		  			case 19: return"Justice "; break;
		  			case 20: return"Immigration, asile et intégration "; break;
		  			case 21: return"Gestion des finances publiques et des ressources humaines "; break;
		  			case 22: return"Enseignement scolaire "; break;
		  			case 23: return"Engagements financiers de l'État "; break;
		  			case 24: return"Défense "; break;
		  			case 25: return"Direction de l'action du Gouvernement "; break;
		  			case 26: return"Culture "; break;
		  			case 27: return"Conseil et contrôle de l'État "; break;
		  			case 28: return"Anciens combattants, mémoire et liens avec la nation "; break;
		  			case 29: return"Aide publique au développement "; break;
		  			case 30: return"Agriculture, pêche, alimentation, forêt et affaires rurales "; break;
		  			case 31: return"Administration générale et territoriale de l'État "; break;
		  			case 32: return"Action extérieure de l'État "; break;
		  			default:
        				return "label";        				
				} 
      		}

      		if (englais){
				people = {data : lines, source : "Average", referenceBudget : ref};
			}else{
		
				people = {data : lines, source : "Moyenne", referenceBudget : ref};
			}
	    	
 			//console.log(people);
			prepareDataBis(people);
	    },
	    error: function(status) {
	      console.log(status);
	    },
	    group: true //pour executer la fonction reduce
	});

		//console.log (user);
		//console.log (people);
		//console.log (state);
		//console.log (name);
		print( [state, user, people], true, false, name);
};


/**
 * User Interaction stuff
 */
$(document).ready(function(){

	var step0elems = [".step0", ".liste"],
			step1elems = [".step1",".liste"],
			step2elems = [".step2",$stepButton,".liste"],
			step3elems = [".step3",".liste"],
			step1local = [".step1local"],
			chart = [".chart"],
			$stepButton = $("#stepButton")
			$graphName = $(".nameGraph")
			;
	
	var urlCouch = location.protocol+"//"+location.hostname+":5984";
	
	var textSave    = "Enregistrer et...";
	var textShare   = "Partager sur Facebook !"
	var summaryText = "Voir ce que les autres ont suggérer aux politiciens"
	var alertName   = "Nom du graphique est obligatoire";
	var alertChamps = "Champs obligatoires";
	var name        = "Nom";

	//console.log (location.pathname);
	if ((location.pathname.indexOf("index_en")) != -1){
		englais     = true;
		textShare   = "Share on Facebook !";
		summaryText = 'See what others have suggest to politicians';
		alertName   = "Name is required";
		textSave    = "Save and...";
		alertChamps = "Required fields";
		name        = "Name";
	}
		
	//console.log (englais);
  	$.couch.urlPrefix = urlCouch;
  	docId = getURLargs()['docId'];
	//console.log ("docId " + docId + " urlcouch "+ $.couch.urlPrefix);
	if (docId != undefined) {

		graphRenderById(docId);
		var $stepButton = $("#stepButton");
		var step0elems1 = [".step0",".liste", ".step1",".step1local", ".step2",$stepButton ];
		if (englais){
			$graphName.html ("<p class=\"text-muted\">The distribution of <b>"+user.referenceBudget+"€</b> in the graph <b>" +user.graphicName+"</b></p>");
		}else{
			$graphName.html ("<p class=\"text-muted\">La répartition de <b>"+user.referenceBudget+"€</b> sur le graphique <b>" +user.graphicName+"</b></p>");
		}
		$stepButton.text(textShare);
		hideShow(step0elems1,step3elems);
		$stepButton.unbind( "click" );
		$stepButton.click(function(){
				
			var title   = encodeURIComponent(user.graphicName);
        	var summary = encodeURIComponent(summaryText);
        
        	var url     = encodeURIComponent(location.href+'?docId='+docId);
        	var image   = encodeURIComponent('https://pics.mysite.com/mylogo.png');
        	//console.log (url);
        	window.open('http://www.facebook.com/sharer.php?s=100&amp;p[title]=' + title + '&amp;p[summary]=' + summary + '&amp;p[url]=' + url + '&amp;p[images][0]=' + image,'sharer','toolbar=0,status=0,width=548,height=325');

        });	
	}else{

		$.couch.db("clevertaxes").view("docs/docs", {
		
		    success: function(data) {
		    	var html = "<table class=\"table table-hover\">";
		    	html    += "<thead><tr><th>"+name+"</th><th>Date</th></thead><tbody>";
		    	//$("#listOfGraphic").append("<table class=\"table table-hover\">");
		    	//$("#listOfGraphic").append("<thead><tr><th>Name</th><th>Date</th></thead><tbody>");
				
		    	data.rows.forEach(function(entry) {
		    		html += "<tr><td><a href=\""+location.href+'?docId='+entry.id+"\">"+entry.value+"<a></td><td>"+formatDate(entry.key)+"</td></tr>";
		    		//$("#listOfGraphic").append("<tr><td><a href=\""+location.href+'?docId='+entry.id+"\">"+entry.value+"<a></td><td>"+formatDate(entry.key)+"</td></tr>");
		      	
	      		});
	      		html += "</tbody></table>";
	      		$("#listOfGraphic").html(html);	
		    },
		    error: function(status) {
		      console.log(status);
		    },
		    limit: 5,
		    descending:true,

		});
		
	}	
	//user actions (on buttons)
	function hideShow(hide,show){
		hide.forEach(function(d){
			$(d).hide();
		});
		show.forEach(function(d){
			$(d).show();
		});
	}
	//manage the diffents steps
	function step1(taxAmount, name){
		//console.log ("step1");
		graphRender(taxAmount, name);
		hideShow(step0elems,step1elems);

		$stepButton.click(step2);
	}

	function step2(){

		//console.log ("step2");
		//var step1elems1 = [".step1",".step1local"];
		hideShow(step1elems,step2elems);

		print([state, user],false,true);
		$stepButton.text(textSave);
		$stepButton.unbind( "click" );
		$stepButton.click(function(){
			var graphicName = $("#graphicName").val();
			if (graphicName.trim() != ''){
				step3(graphicName, docId);
			}else
				alert (alertName);
		});
	}

	function step3(graphicName){
		console.log ("step3");
		var docId = saveDB(user,graphicName);
		console.log ("Fin saveDB : "+ docId);
		hideShow(step2elems,step3elems);
		print( [state, user, people]);  //ok
		//console.log (user);
		//console.log (people);
		if (englais){
			$graphName.html ("<p class=\"text-muted\">The distribution of <b>"+user.referenceBudget+"€</b> in the graph <b>" +graphicName+"</b></p>");
		}else{
			$graphName.html ("<p class=\"text-muted\">La répartition de <b>"+user.referenceBudget+"€</b> sur le graphique <b>" +graphicName+"</b></p>");
		}
		$stepButton.text(textShare);
		$stepButton.unbind( "click" );
		$stepButton.click(function(){
			
			//redirection
			if (englais)
				window.open("./index_en.html?docId="+docId);
			else	
				window.open("./index.html?docId="+docId);
				
			var title   = encodeURIComponent(graphicName);
        	var summary = encodeURIComponent(summaryText);
        
        	var url     = encodeURIComponent(location.href+'?docId='+docId);
        	var image   = encodeURIComponent('https://pics.mysite.com/mylogo.png');

        	window.open('http://www.facebook.com/sharer.php?s=100&amp;p[title]=' + title + '&amp;p[summary]=' + summary + '&amp;p[url]=' + url + '&amp;p[images][0]=' + image,'sharer','toolbar=0,status=0,width=548,height=325');

			
			
			
		});
	}

	
	
	function saveDB(user, graphicName){
		
      	var lines = new Array();
      	user.data.forEach(function(entry) {
      		/*
      		console.log (entry.label);
      		console.log (entry.amount);
      		console.log (entry.percentage);
      		console.log (entry.percent);
      		*/
      		var p       = {};
      		p['id']     = entry.id;
      		p['label']  = entry.label;
      		p['amount'] = entry.amount;
      		p['percent']= entry.percent;
      		//console.log (entry.percent == entry.percentage);
      		if (entry.percent  == entry.percentage )
      			p['percentage']= (entry.percentage * 1.0);
      		else
      			p['percentage']= (entry.percentage * 100.0);
      		lines.push(p);
      		//console.log (p['percentage']);

      	});
      	//console.log (lines);
   
		var doc = {
			"date":new Date().getTime(),
			"graphicName": graphicName,
			"name": user.name,
			"lines": lines,
			"referenceBudget":user.referenceBudget	
		};		

		var docIdUser;
		
		$.ajaxSetup({
			async: false
		});

		var result = $.couch.db("clevertaxes").saveDoc(doc);/*, {
			
			success: function(user) {
			docIdUser = user.id;
			
		},
		complete : function(user){
			docIdUser = user.id;
		},
			error: function(status) {

			console.log(status);
		}
		});*/
		
		result.then(function(d,i){
			console.log(this);
			console.log(docIdUser);
			console.log(d);
			docIdUser = d.id;
			
		});
		console.log(docIdUser);
		return(docIdUser);

		
	}
	function step1local(){
		alert("manage this !!")
		//query to the endpoint
		//display of saisie message if empty
	}

	function getURLargs () {
		var args = document.location.search.substring(1).split(/\&/);
		argsParsed = {};

		for (i = 0; i < args.length; i++) {
			arg = unescape(args[i]);

			if (arg.indexOf('=') == -1) {
				argsParsed[arg.trim()] = true;
			} else {
				kvp = arg.split('=');
				argsParsed[kvp[0].trim()] = kvp[1].trim();
			}
		}
		return argsParsed;
	}

	function formatDate (time) {
		//time en millisecondes
		if (time > 1408975839987){
			var d = new Date(parseInt(time));
		//	console.log (d);
			var theyear  = d.getFullYear();
			var themonth = d.getMonth()+1;
			var thetoday = d.getDate();
			var thehour  = d.getHours();
			var themn    = d.getMinutes();
			//var thesc    =d.getSeconds();
			if(thetoday<10){
        thetoday='0'+thetoday;
    	}
    	if(themonth<10){
        themonth='0'+themonth;
    	}
			if(thehour<10){
				thehour='0'+thehour;
			}
			if(themn<10){
				themn='0'+themn;
			}

			return (thetoday+"/"+themonth+"/"+theyear+ " "+thehour+":"+themn);
		}else return "";
	}

	var dfd = $.Deferred();

	$("#valid").click(function(){
		//console.log ("point de depart");
		
		var taxAmount = $("#taxamount").val();
		var name      = $("#name").val();
		if ((taxAmount.trim()) != '' && (name .trim() != '')){
			$.when(dfd.promise()).then(function(){
				step1(taxAmount, name);
			});

		 	dfd.resolve();
		}else{
			$("#name").addClass("red");
			$("#taxamount").addClass("red");
			alert (alertChamps);
		} 	
		 	
	});

	$("#golocal").click(function(){
		var taxAmount = +$("#taxamount").val();

		$.when(dfd.promise()).then(function(){
			step1local(taxAmount);
		});

	 	dfd.resolve();
	});

	$("#validCity").click(function(){

		//TODO : hacky solution, do it cleaner
		if(ref == null) ref = 5000;
		//TODO : if town exist on the server or not
		if($("#cityName").val() == "demo"){
			console.log("we are in");
			//display graph
			$.ajax({
				url : "http://localhost:8080/skosifier?name=demo",
				contentType : "application/json",
				accepts : "application/json"
			})
			.done(function(data){
				data = JSON.parse(data);


				data.forEach(function(d,i){
					d.realId = d.id;
					d.id = i;
				})

				//test
				var people = {data : dataInit3, source : "allpeople", referenceBudget : ref};
				prepareData(people);

				console.log(people.data);

				hideShow(step1local,chart);
				var city = {data : data, source : "allpeople", referenceBudget : ref};
				prepareData(city);
				console.log(city.data);
				print([city]);

			});
		}
		else{
			//display city filling default webcomponent


		}
	});

	$('#calculatebtn').click(function() {
		$("#name").val("florent");
		$("#taxamount").val("5000");
		$("#caRow").hide();
        $('#myModal').modal('hide');
    });

	$("#caConnect").click(function(){

		$('#myModal').modal('show');

	});

//	console.warn("remove this, as it's test");
//
//	$("#taxamount").attr("value",800);
//	$("#valid").click();

});
