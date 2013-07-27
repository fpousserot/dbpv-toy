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
				if (preloaded.length === 1 && about !== undefined) {
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
					$http.defaults.useXDomain = true;
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
					var tripls = [];
					$http.post(endpoint, "query="+inquery).success(function(data, status, headers, config) {
						//alert("query a - 1");
						var bindings = data["results"]["bindings"];
						for (var i = 0; i<bindings.length; i++) {	
							var trip = new Object();
							var subject = {'type':'uri', 'url':entityUrl};
							var object = new Object();
							var tripleline = bindings[i];
							var val = tripleline['v'];
							for (var key in val) {
								object[key] = val[key];
							}
							if (object.hasOwnProperty("type") && object.type=="uri") {
								object.url = object.value;
							}
							var property = {"type":"uri", "url": tripleline["hasprop"]["value"]};
							tripls.push({'subject':subject, 'property':property, 'object': object, 'query':'a'});
							
						}
						//alert("query a - 2");
						dbpv_preprocess_triples(tripls);
						scope.triples = scope.triples.concat(tripls);

						//alert("query a - 3");
						//trips = trips+tripls;
						//trips = trips.concat(tripls);
						//trips.push.apply(trips,tripls);
						/*for (var k = 0; k<tripls.length; k++) {
							trips.push(tripls[k]);
						}*/
						
					}).
					error(function (data, status, headers, config) {
						alert("Inquery loading error");
					});
					// MEDIAS RES XXX NEW
					tripls = [];
					$http.post(endpoint, "query="+outquery).success(function(data, status, headers, config) {
						//alert("query b - 1");
						var bindings = data["results"]["bindings"];
						for (var i = 0; i<bindings.length; i++) {	
							var trip = new Object();
							var object = {'type':'uri', 'url':entityUrl};
							var subject = new Object();
							var tripleline = bindings[i];
							var val = tripleline['v'];
							for (var key in val) {
								subject[key] = val[key];
							}
							if (subject.hasOwnProperty("type") && subject.type=="uri") {
								subject.url = subject.value;
							}
							var property = {"type":"uri", "url": tripleline["isprop"]["value"]};
							tripls.push({'subject':subject, 'property':property, 'object': object, 'query':'b'});
							
						}
						//alert("query b - 2");
						dbpv_preprocess_triples(tripls);
						scope.triplesB = scope.triples.concat(tripls);
						//alert("done"+scope.triplesB.length);
						//alert("query b - 3");
						//trips = trips+tripls;
						//trips = trips.concat(tripls);
						//trips.push.apply(trips,tripls);
						/*for (var k = 0; k<tripls.length; k++) {
							trips.push(tripls[k]);
						}*/
					}).
					error(function (data, status, headers, config) {
						alert("Outquery loading error");
					});
					// END XXX NEW

					$http.defaults.headers.post['Content-Type'] = prevdef;
				}
				//alert("trips:"+JSON.stringify(trips));
				//return trips;
			}
		};
	}]);
