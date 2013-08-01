angular.module('dbpvServices', [])
	.factory('Entity', ['$http', function($http) {
		return {
			triples: function(eid, scope) {
				var localns = "http://dbpedia.org/resource/"; //XXX
				var entityUrl = localns+eid;
				var trips = [];
				var preloaded = [];
				try{
					preloaded = $("#content");
				}catch(err){
//alert(err.message);
				}
				var about = $("[about]").attr("about");
				if (false && preloaded.length === 1 && about !== undefined) {
//alert("found something!!!");
					try{
						var rdf = preloaded.rdf();
						var baseURI = rdf.databank.baseURI;
						var tripledump = rdf.databank.dump();
						//alert(JSON.stringify(tripledump));
						for (var subj in tripledump) {
							var properties = tripledump[subj];
							if (subj == baseURI) {
								subj = about;
							}
							for (var prop in properties) {
								var propertyvalues = properties[prop];
								for (var i = 0; i<propertyvalues.length; i++) {
									var trip = new Object();
									var propval = propertyvalues[i];
									var subject = {'type':'uri', 'url':subj};
									var property = {'type':'uri', 'url':prop};
									var object = {};
									for (var objkey in propval) {
										object[objkey] = propval[objkey];
									}
									if (object.hasOwnProperty("type") && object.type=="uri") {
										object.url = object.value;
										
										if (object.url == baseURI) {
											object.url = about;
										}
									}
									trip.subject = subject;
									trip.property = property;
									trip.object = object;
									trips.push(trip);
								}
							}
						}
						//TODO parse RDFQuery results
						//trips = jQuery.parseJSON(preloaded.text());
						preloaded.remove();

						dbpv_preprocess_triples(trips);
						scope.triples = trips;
					}catch(err){
alert("malformed JSON");
					}
				}else{
					//$http.defaults.useXDomain = true;
					delete $http.defaults.headers.common['X-Requested-With'];
					var prevdef = $http.defaults.headers.post['Content-Type'];	
					$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
					var query = "SELECT ?hasprop ?v ?isprop where {{<"+entityUrl+"> ?hasprop ?v}UNION{?v ?isprop <"+entityUrl+">}} LIMIT 10000";

					var inquery = encodeURIComponent("SELECT ?hasprop ?v where {<" + entityUrl + "> ?hasprop ?v}");
					var outquery = encodeURIComponent("SELECT ?v ?isprop where { ?v ?isprop <" + entityUrl + ">}");
					query = encodeURIComponent(query);
					var endpoint = "http://dbpedia.org/sparql";


/*					$http.post(endpoint, "query="+query).success(function(data, status, headers, config) {
						var bindings = data['results']['bindings'];
						for (var i = 0; i<bindings.length; i++) {
							var trip = new Object();
							var oneject = {'type':'uri', 'url':entityUrl};
							var twoject = new Object();
							var tripleline = bindings[i];
							var val = tripleline['v'];
							for (var key in val) {
								twoject[key] = val[key];
							}
							if (twoject.hasOwnProperty("type") && twoject.type=="uri") {
								twoject.url = twoject.value;
							}
							var property = {"type":"uri"};
							if ('hasprop' in tripleline) {
								property.url = tripleline["hasprop"]["value"];
								trips.push({'subject':oneject, 'property':property, 'object': twoject});
							}else if ('isprop' in tripleline) {
								property.url = tripleline["isprop"]["value"];
								trips.push({'subject':twoject, 'property':property, 'object': oneject});
							}else{
								alert("Error!");
							}
						}
						dbpv_preprocess_triples(trips);
					}).
					error(function (data, status, headers, config) {
						alert("Error");
					});*/


					// START XXX NEW
					$http.post(endpoint, "query="+inquery).success(function(data, status, headers, config) {
						var predicates = {};
						var bindings = data["results"]["bindings"];
						try{
						for (var i = 0; i<bindings.length; i++) {	
							var trip = new Object();

							var object = new Object();
							var tripleline = bindings[i];
							var val = tripleline['v'];
							for (var key in val) {
								object[key] = val[key];
							}
							if (object.hasOwnProperty("type") && object.type=="uri") {
								object.url = object.value;
							}
							var property = {"type":"uri", "url": tripleline["hasprop"]["value"], "reverse":false, "complete":true};
							dbpv_preprocess_triple_value(property);
							dbpv_preprocess_triple_value(object);

							predid  = "i-"+property.url;
							predicate = predicates[predid];
							if (predicate === undefined) { // add it
								predicates[predid] = property;
								predicate = property;
								predicate.predid = predid;
								predicate.values = [];
							}
							predicate.values.push(object);
						}
						}catch(err){alert("error in loop");}
						scope.predicates = jQuery.extend({}, scope.predicates, predicates);
					}).
					error(function (data, status, headers, config) {
						alert("Inquery loading error");
					});
					// MEDIAS RES XXX NEW
					$http.post(endpoint, "query="+outquery).success(function(data, status, headers, config) {
						predicates = {};
						var bindings = data["results"]["bindings"];
						try{
						for (var i = 0; i<bindings.length; i++) {	
							var trip = new Object();
							var subject = new Object();
							var tripleline = bindings[i];
							var val = tripleline['v'];
							for (var key in val) {
								subject[key] = val[key];
							}
							if (subject.hasOwnProperty("type") && subject.type=="uri") {
								subject.url = subject.value;
							}
							var property = {"type":"uri", "url": tripleline["isprop"]["value"], "reverse":true};
							dbpv_preprocess_triple_value(property);
							dbpv_preprocess_triple_value(subject);

							predid = "o-"+property.url;
							predicate = predicates[predid];
							if (predicate === undefined) { // add it
								predicates[predid] = property;
								predicate = property;
								predicate.predid = predid;
								predicate.values = [];
							}
							predicate.values.push(subject);
						}
						}catch(err){alert("error in loop");}
						scope.revpredicates = jQuery.extend({}, scope.revpredicates, predicates);
						for (var revpred in scope.revpredicates) {
							var totransfer = scope.revpredicates[revpred];
							var transfer = {};
							for (var predkey in totransfer) {
								if (predkey != "values" && predkey != "$$hashKey") {
									transfer[predkey] = totransfer[predkey];
								}
							}
							var init_amount = 5;
							init_amount = Math.min(init_amount, totransfer["values"].length);
							transfer.values = [];
							for (var i = 0; i< init_amount; i++) {
								transfer["values"].push(totransfer["values"][0]);
								totransfer["values"].splice(0, 1);
							}
							if (totransfer["values"].length == 0) {
								transfer["complete"] = true;
							}else{
								transfer["complete"] = false;
							}
							scope.predicates[revpred] = transfer;
						}
					}).
					error(function (data, status, headers, config) {
						alert("Outquery loading error");
					});
					// END XXX NEW

					$http.defaults.headers.post['Content-Type'] = prevdef;
				}
			}
		};
	}]);
