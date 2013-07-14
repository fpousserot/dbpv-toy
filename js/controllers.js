function ListCtrl($scope) {
	var content = [];
	var def = false;
//alert("right");
	try {
		var cont = $(".test").text();
//		alert(cont);
		content = jQuery.parseJSON(cont);
	}catch (err) {
		def = true;
//		alert("faulty JSON"+err.message);
	}
	if (def) {
		content = [
			{'uri': '/entity/Lenka', 'title': 'Lenka'},
			{'uri': '/entity/Lena_Soderberg', 'title': 'Lena Soderberg'}
		];
	}
	$scope.links = content;
}

function NestTest($scope) {
	$scope.tripls = [{"subject":"X", "property":"Y", "object":"Z"}];
}

function SearchCtrl($scope, $routeParams, $http) {
	delete $http.defaults.headers.common['X-Requested-With'];
	$http.get("http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=5&QueryString="+$routeParams.id).success(function(data) {	
alert(data["results"].length);
		var results = data["results"];
		var res = [];
		for (var i = 0; i<results.length ; i++) {
			var result = results[i];
			res.push({"label": result['label'], "uri": result['uri']});
		}
		$scope.results = res;
	});
}

function newPostEntityCtrl($scope, $routeParams, Entity) {
	$scope.triples = Entity.triples($routeParams.id);
}

function postEntityCtrl ($scope, $routeParams, $http) {
	$http.defaults.useXDomain = true;
	delete $http.defaults.headers.common['X-Requested-With'];
	var prevdef = $http.defaults.headers.post['Content-Type'];	
	$http.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded";
	var entityUrl = "http://dbpedia.org/resource/"+$routeParams.id;
	var query = "SELECT ?hasprop ?v ?isprop where {{<"+entityUrl+"> ?hasprop ?v}UNION{?v ?isprop <"+entityUrl+">}} LIMIT 10000";
	query = encodeURIComponent(query);
//alert(query);
	var trips = [];
	var endpoint = "http://dbpedia.org/sparql";
	$http.post(endpoint, "query="+query).success(function(data, status, headers, config) {
//	$http.get(endpoint+"?query="+query).success(function(data) {
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
		$scope.triples = trips;
	}).
	error(function (data, status, headers, config) {
		alert("Error");
	});
	$http.defaults.headers.post['Content-Type'] = prevdef;
}


/*function EntityCtrl ($scope, $routeParams, $http) {
	delete $http.defaults.headers.common['X-Requested-With'];
	var query = encodeURIComponent("SELECT ?p ?v where {<http://dbpedia.org/resource/"+$routeParams.id+"> ?p ?v}");
//	$http.defaults.headers.common['Content-Type'] = "application/sparql-query";

//	$http.get('http://dbpedia.org/sparql?query=describe+%3Chttp%3A%2F%2Fdbpedia.org%2Fresource%2F'+$routeParams.id+'%3E').success(function(data) {
		var triples = [];
alert($routeParams.id);
		for (var key in data) {
//alert("subj-loop");
			currentSubject = key;
			diplets = data[key];
//alert(currentSubject);
			for (var dkey in diplets) {
				currentProp = dkey;
//alert(currentProp);
				valueList = diplets[dkey];
				for (var i = 0; i<valueList.length; i++) {
					currentObject = valueList[i]['value'];
					triples.push({"subject":currentSubject, "property": currentProp, "object": currentObject});
				}
			}
		}
		$scope.triples = triples;
	});
//		$http.defaults.headers.common['Content-Type'] = prevdef;
}*/

function EntityCtrl ($scope, $routeParams, $http, Entity) {
//	getEntityCtrl($scope, $routeParams, $http);
//	postEntityCtrl($scope,$routeParams, $http);
	newPostEntityCtrl($scope, $routeParams, Entity);
}


function getEntityCtrl ($scope, $routeParams, $http) {
	delete $http.defaults.headers.common['X-Requested-With'];
	var entityUrl = "http://dbpedia.org/resource/"+$routeParams.id;
	var query = "SELECT ?hasprop ?v ?isprop where {{<"+entityUrl+"> ?hasprop ?v}UNION{?v ?isprop <"+entityUrl+">}} LIMIT 10000";
	query = encodeURIComponent(query);
	//alert(query);
	var trips = [];
	var endpoint = "http://live.dbpedia.org/sparql";
	$http.get(endpoint+"?query="+query).success(function(data) {
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
		$scope.triples = trips;
	});
}
