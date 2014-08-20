//Question to ask on ml.
// y(d.amount) give the y value, but how I can manage the inverse function ? From y position, get the amount ?
//will be really usefull for calculation during drag and drop

//function for the data transformation
function prepareData(/*{data : d, source : "sourceName", referenceBudget : value}*/){
	console.log ("prepareData");
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
			if(a.id == 0){
				//init to 100% as after values are removed from unassignied
				a.percent = 100;
				d.unassignied = a;
			}

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
	args.forEach(function(arr,i){
		arr.data.reduce(function(p,c){
			var i = p.lazyIndexOf(function(a,b){
					return a.lazyIndexOf(function(x,y){
						return x.id == y.id}
					,b) != -1;
				},c);
			if(i != -1){
				p[i].push(c);
			}else{
				p.push([c]);
			}
			return p;
		},data);

	});

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
	console.log ("displayBar");
	var seen = []
	var json = JSON.stringify(data, function(key, val) {
   if (typeof val == "object") {
        if (seen.indexOf(val) >= 0){
        	return seen.push(val)
        }
        var i =0;
       val.forEach(function(entry) {
       	//console.log("entry"+entry);
    		//console.log("entry"+i+ "= "+entry);
    		i++;
		});
            return seen.push(val)
    }
    return val
})
	console.log( "json "+json);
		function budgetId(d){
			//@TODO : see why this number generation
// 						return d.sourceID+d.amount/100000;
			//or a string id generation don't work
// 						return d.sourceID+"_"+d.amount+"_"+d.source;
			return Math.random();
		}

		function getHeight(d){
			console.log ("getHeight");
			return height - y(d.amount);
		}

		function printAxis(){
			console.log ("printAxis");
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
		}

		function addModifyButtons(){
			console.log ("addModifyButtons");

			var buttonHeight = 15,
				buttonColor = "#D9534F",
				pixelValue,
				starty,
				startValue,
				previousValue,
				maxValue
			;

			function dragmove(d) {
				console.log ("dragmove");
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
							console.log(user.data);
							if(typeof(Storage) !== "undefined") {
    							// Code for localStorage/sessionStorage.
							} else {
    							// Sorry! No Web Storage support..
							}
							/*
							var fs = require('fs');
							var outputFilename = 'my.json';
							fs.writeFile(outputFilename, JSON.stringify(user.data, null, 4), function(err) {
    						if(err) {
      						console.log(err);
    						} else {
      						console.log("JSON saved to " + outputFilename);
    						}
							}); */
							displayBar(data,svg);
						})
						;

			var buttons = state.selectAll("rect.button")
		      .data(function(d,i) {
		    	  return d.reduce(function(p,c) { if (c.source == "user" && c.id != 0) p.push(c); return p; },[]);
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

	displayBar(data,svg,initAxes);


};

var ref, state, user, people;

function graphRender(taxAmount){

	console.log ("graphRender");

	var realReferenceBudget = "378440180000"; //378 billions
	var userReferenceBudget = taxAmount;

	//ref = realReferenceBudget;
	ref = userReferenceBudget;

	state = {data : dataInit, source : "state",referenceBudget : ref};
	prepareData(state);

	user = {data : dataInit2, source : "user", referenceBudget : ref};
	prepareData(user);

	people = {data : dataInit3, source : "allpeople", referenceBudget : ref};
	prepareData(people);

	print([state],true);
};


/**
 * User Interaction stuff
 */
$(document).ready(function(){

	//user actions (on buttons)
	function hideShow(hide,show){
		hide.forEach(function(d){
			$(d).hide();
		});
		show.forEach(function(d){
			$(d).show();
		});
	}

	var step0elems = [".step0"],
		step1elems = [".step1"],
		step2elems = [".step2",$stepButton],
		step3elems = [".step3"],
		step1local = [".step1local"],
		chart = [".chart"],
		$stepButton = $("#stepButton")
		;

	//manage the diffents steps
	function step1(taxAmount){
		console.log ("step1");
		graphRender(taxAmount);
		hideShow(step0elems,step1elems);

		$stepButton.click(step2);
	}

	function step2(){
		console.log ("step2");
		hideShow(step1elems,step2elems);

		print( [state, user],false,true);
		$stepButton.text("Save and...")
		$stepButton.click(step3)
	}

	function step3(){
		hideShow(step2elems,step3elems);
		print( [state, user, people]);
		console.log (user);
		$stepButton.text("Share !")
		$stepButton.click(function(){
			alert("Sharing function comming soon !");
		});
	}

	function step1local(){
		alert("manage this !!")
		//query to the endpoint
		//display of saisie message if empty
	}

	var dfd = $.Deferred();

	$("#valid").click(function(){
		console.log ("point de depart");
		var taxAmount = +$("#taxamount").val();

		$.when(dfd.promise()).then(function(){
			step1(taxAmount);
		});

	 	dfd.resolve();
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
