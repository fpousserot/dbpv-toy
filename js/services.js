angular.module('dbpvServices', [])
	.factory('Entity', ['$http', function($http) {
		return {
			triples: function(id, scope, dir, fwd) {
				if (typeof(dir) === 'undefined') dir = 'resource';
				if (typeof(fwd) === 'undefined') fwd = false;
				var graph = "http://dbpedia.org"; //XXX to dist
				var space = location.protocol+"//"+location.host; //XXX
				var entityUrl = graph+"/"+dir+"/"+id;
				scope.about = {"uri": entityUrl, "type":"uri"};
				var trips = [];
				var preloaded = $("#content");
				var about = $("[about]").attr("about");

				var preloaded = $("#static");
				if (preloaded.length === 1) {
					preloaded.remove();
				}
				//$http.defaults.useXDomain = true;
				delete $http.defaults.headers.common['X-Requested-With'];
				var prevdef = $http.defaults.headers.post['Content-Type'];
				$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
				var inquery = encodeURIComponent("SELECT ?hasprop ?v where {<" + entityUrl + "> ?hasprop ?v}");
				var outquery = encodeURIComponent("SELECT ?v ?isprop where { ?v ?isprop <" + entityUrl + ">} LIMIT 1000");
				var endpoint = "http://dbpedia.org/sparql"; //XXX to dist
				//endpoint = "/sparql";

				// START XXX NEW
				scope.entitySemaphore += 1;
				$http.post(endpoint, "query="+inquery, {timeout:60000}).success(function(data, status, headers, config) {
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

						predid  = "i-"+property.uri;
						predicate = predicates[predid];
						if (predicate === undefined) { // add it
							predicates[predid] = property;
							predicate = property;
							predicate.predid = predid;
							predicate.values = [];
						}
						predicate.values.push(object);
						object.taf = {}; // TAF
					}
					}catch(err){alert("error in loop");}
					scope.predicates = jQuery.extend({}, scope.predicates, predicates);
					scope.entitySemaphore -= 1;
				}).
				error(function (data, status, headers, config) {
					alert("Inquery loading error");
					scope.entitySemaphore -= 1;
				});
				// MEDIAS RES XXX NEW
				if (!fwd) {
					scope.entitySemaphore += 1;
					$http.post(endpoint, "query="+outquery, {timeout: 60000}).success(function(data, status, headers, config) {
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

							predid = "o-"+property.uri;
							predicate = predicates[predid];
							if (predicate === undefined) { // add it
								predicates[predid] = property;
								predicate = property;
								predicate.predid = predid;
								predicate.values = [];
							}
							predicate.values.push(subject);
							subject.taf = {};
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
						scope.entitySemaphore -= 1;
					}).
					error(function (data, status, headers, config) {
						alert("Outquery loading error");
						scope.entitySemaphore -= 1;
					});
				}
				// END XXX NEW
				$http.defaults.headers.post['Content-Type'] = prevdef;
			}
		};
	}])
	.factory('Spotlight', ['$http', function($http) {
		return {
			annotate: function(text) {
				delete $http.defaults.headers.common['X-Requested-With'];
				var endpoint = "http://spotlight.dbpedia.org/rest/annotate";
				$http.get(endpoint, "text="+text).success(function (data, status, headers, config) {

				})
				.error(function (data, status, headers, config) {

				});
			},
			annotate_async: function(text, callback, coming_through) {
								delete $http.defaults.headers.common['X-Requested-With'];
				var endpoint = "http://spotlight.dbpedia.org/rest/annotate";
				$http.get(endpoint+"?text="+encodeURIComponent(text)).success(function (data, status, headers, config) {	
					callback(data, coming_through);
				})
				.error(function (data, status, headers, config) {
					alert("Annotation error");
				});
			}
		};
	}])
	.factory('Preview', ['$http', function($http) {
		return {
			/*entityPreview: function (rurl) {
				var properties = {
					'http://dbpedia.org/ontology/thumbnail':'thumbnail',
					'http://www.w3.org/2000/01/rdf-schema#comment':'description',
					'http://www.w3.org/2000/01/rdf-schema#label':'label'
				};
				var graph = "http://dbpedia.org/"; //XXX
				var uri = graph+rurl;
				var preview = {};
				delete $http.defaults.headers.common['X-Requested-With'];
				var prevdef = $http.defaults.headers.post['Content-Type'];
				$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
				var endpoint = "http://live.dbpedia.org/sparql"; //XXX
				for (var i in properties) {
					var query = "SELECT ?prop WHERE {<"+uri+"> <"+i+"> ?prop}";
					query = encodeURIComponent(query);
					$http.post(endpoint, "query="+query).success(function (data, status, headers, config) {
						//alert(JSON.stringify(data));
						var values = data["results"]["bindings"];
						var vals = [];
						for (var j = 0; j<values.length; j++) {
							vals.push(values[j]['prop']);
						}
						preview[properties[i]] = vals;
						alert(JSON.stringify(preview));
					})
					.error(function (data, status, headers, config) {
						alert("Could load preview property");
					});
				}
				$http.defaults.headers.post['Content-Type'] = prevdef;
				return preview;
			},*/
			getProperty: function (rurl, prop, loadingSemaphore) {
				if (typeof(loadingSemaphore) == "undefined") loadingSemaphore = {"count":0};
				var vals = [];
				var graph = "http://dbpedia.org"; //XXX
				var uri = graph+rurl;
				delete $http.defaults.headers.common['X-Requested-With'];
				var prevdef = $http.defaults.headers.post['Content-Type'];
				$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
				var endpoint = "http://dbpedia.org/sparql"; //XXX
				var query = "SELECT ?prop WHERE {<"+uri+"> <"+prop+"> ?prop}";
				query = encodeURIComponent(query);
				loadingSemaphore.count += 1;
				$http.post(endpoint, "query="+query, {timeout:60000}).success(function (data, status, headers, config) {
					loadingSemaphore.count -= 1;
					var values = data["results"]["bindings"];
					for (var j = 0; j<values.length; j++) {
						var val = values[j]['prop'];
						dbpv_preprocess_triple_value(val);
						vals.push(val);
					}
				})
				.error(function (data, status, headers, config) {
					loadingSemaphore.count -= 1;
					//alert("Couldn't load preview property");
				});
				$http.defaults.headers.post['Content-Type'] = prevdef;
				return vals;
			}
		};
	}]);
