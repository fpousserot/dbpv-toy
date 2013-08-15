function MetaCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview, dir, fwd) {
	$scope.$parent.$root.$watch("primary_lang", function(lang){
		$scope.primary_lang = lang;
	});

	$scope.showMore = function(id) {
		var predicate = $scope.revpredicates[id];
		var destination = $scope.predicates[id];
		var transfer = [];
		if (destination !== undefined && destination.complete == false && predicate!== undefined && predicate.values.length > 0) { // then show more
			var amount = 2000;
			amount = Math.min(amount, predicate.values.length);
			for (var i = 0; i<amount ; i++) {
				transfer.push(predicate.values[0]);
				predicate.values.splice(0, 1);
			}
			destination.values = destination.values.concat(transfer);
			if (predicate.values.length == 0) {
				destination.complete = true;
			}
		}
	};

	$scope.previewSemaphore = {};
	$scope.previewSemaphore.count = 0;

	$scope.entityPreview = function(rurl, top, left) {
		var entityPre = "/resource";
		var ontologyPre = "/ontology";
		var propertyPre = "/property";
		if (rurl[0]=='/') { //local XXX
			$scope.preview = {};
			$scope.preview.top = top;
			$scope.preview.left = left;
			$scope.preview.show = true;
			if (rurl.substring(0, entityPre.length) == entityPre) {
				$scope.preview.type = "entity";
				$scope.preview.label = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#label", $scope.previewSemaphore);
				$scope.preview.thumbnail = Preview.getProperty(rurl, "http://dbpedia.org/ontology/thumbnail", $scope.previewSemaphore);
				$scope.preview.description = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#comment", $scope.previewSemaphore);
			}else if (rurl.substring(0, ontologyPre.length) == ontologyPre || rurl.substring(0, propertyPre.length) == propertyPre) {
				$scope.preview.type = "property";
				$scope.preview.description = [];
				$scope.preview.label = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#label", $scope.previewSemaphore);
				$scope.preview.range = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#range", $scope.previewSemaphore);
				$scope.preview.domain = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#domain", $scope.previewSemaphore);
			}
		}
	};

	$scope.previewItemHover = function() {
		$scope.preview.itemhover = true;
		$scope.preview.previewhover = false;
	};

	$scope.previewItemUnhover = function() {
		$scope.preview.itemhover = false;
		$scope.previewDisabled();
	};

	$scope.previewHover = function() {
		$scope.preview.previewhover = true;
	};

	$scope.previewUnhover = function() {
		$scope.preview.previewhover = false;
		$scope.previewDisabled();
	};

	$scope.previewDisabled = function() {
		$timeout(function() {
			if ($scope.preview.previewhover == false && $scope.preview.itemhover == false) {	
				$scope.preview = {};
			}
		},200);
	};

	$scope.taf_actions = dbpv_taf_actions;

	$scope.sortPredicates = function(item) {
		return item.predid;
	};

	$scope.predicates = {};
	$scope.revpredicates = {};
	$scope.entitySemaphore = 0;

	Entity.triples($routeParams.id, $scope, dir, fwd);
	$scope.dbpvp = {};

	$scope.$watch('predicates', function(predicates) {
		if (predicates !== undefined) {
			// Pretty Box
			for (var id in predicates) {
				if (id!==undefined) {
					dbpvp_process_predicate($scope.dbpvp, predicates[id]);
				}
			}
		}
	},true);

}

function EntityCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview) {
	MetaCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview, "resource", false);	
}

function OwlCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview) {
	MetaCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview, "ontology", true);
}

function PropCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview) {
	MetaCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview, "ontology", true);
}

function ClassCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview) {
	MetaCtrl($scope, $routeParams, $filter, $timeout, Entity, Preview, "ontology", true);
}

function LookupCtrl($scope, $http, $timeout) {
	$scope.languages = dbpv_languages;
	var timer = false;
	var delay = 500;
	
	$scope.$watch('primary_language', function(lang) {
		$scope.$parent.$root.primary_lang = lang;
	});

	$scope.primary_language = "en";

	$scope.$watch('term', function(term) {
		if ($scope.term === undefined || $scope.term == "") {
			$scope.results = [];
		}else{
			if (timer) {
				$timeout.cancel(timer);
			}
			timer = $timeout(function() {
				// DO LOOK UP
				$scope.dolookup();
			}, delay);
		}
	});

	$scope.dolookup = function () {
		if ($scope.term === undefined || $scope.term == "") {
			$scope.results = [];
		}else{
			delete $http.defaults.headers.common['X-Requested-With'];
			$http.get("http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=5&QueryString="+$scope.term).success(function(data) {
				var results = data["results"];
				var res = [];
				for (var i = 0; i<results.length ; i++) {
					var result = results[i];
					var r = {"type": "uri", "l_label": result['label'], "url": result['uri']};
					dbpv_preprocess_triple_value(r);
					res.push(r);
				}
				$scope.results = res;
			});
		}
	}

	$scope.clearResults = function() {
		$scope.results = [];
	};
}




// XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

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

function routerEntityCtrl ($scope, $routeParams, $http, Entity) {
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
