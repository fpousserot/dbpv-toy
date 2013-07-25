angular.module('dbpvServices', [])
	.factory('Entity', ['$http', function($http) {
		return {
			triples: function(eid) {
				var entityUrl = "http://dbpedia.org/resource/"+eid;
				var trips = [];
				var preloaded = [];
				try{
					preloaded = $("#content");
				}catch(err){
//alert(err.message);
				}
				if (preloaded.length === 1) {
//alert("found something!!!");
					try{
						var tripledump = preloaded.rdf().databank.dump();
						alert(JSON.stringify(tripledump));
						for (var subj in tripledump) {
							var properties = tripledump[subj];
							for (var prop in properties) {
								var propertyvalues = properties[prop];
								for (var i = 0; i<propertyvalues.length; i++) {
									obj = propertyvalues[i]['value'];
									trips.push({'subject':subj, 'property':prop, 'object':obj});
								}
							}
						}
						//TODO parse RDFQuery results
						//trips = jQuery.parseJSON(preloaded.text());
						preloaded.remove();
					}catch(err){
alert("malformed JSON");
					}
				}else{
					$http.defaults.useXDomain = true;
					delete $http.defaults.headers.common['X-Requested-With'];
					var prevdef = $http.defaults.headers.post['Content-Type'];	
					$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
					var query = "SELECT ?hasprop ?v ?isprop where {{<"+entityUrl+"> ?hasprop ?v}UNION{?v ?isprop <"+entityUrl+">}} LIMIT 10000";
					query = encodeURIComponent(query);
				//alert(query);
					var endpoint = "http://live.dbpedia.org/sparql";
					$http.post(endpoint, "query="+query).success(function(data, status, headers, config) {
						var bindings = data['results']['bindings'];
						for (var i = 0; i<bindings.length; i++) {
							var propline = bindings[i];
							var val = propline['v']['value'];
							if ('hasprop' in propline) {
								var prop = propline["hasprop"]["value"];
								trips.push({'subject':entityUrl, 'property':prop, 'object': val});
							}else if ('isprop' in propline) {
								var prop = propline["isprop"]["value"];
								trips.push({'subject':val, 'property':prop, 'object': entityUrl});
							}else{
								alert("Error!");
							}
						}
					}).
					error(function (data, status, headers, config) {
						alert("Error");
					});
					$http.defaults.headers.post['Content-Type'] = prevdef;
				}
				return trips;
			}
		};
	}]);
