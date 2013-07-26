var dbpv = angular.module('dbpv', ['dbpvServices']);
/*dbpv.config(function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
			when('/', {templateUrl: 'tpl/list.html', controller: ListCtrl}).
			when('/entity/:id', {templateUrl: 'tpl/entity.html', controller: EntityCtrl}).
			when('/search/:id', {templateUrl: 'tpl/search.html', controller: SearchCtrl}).
			otherwise({redirectTo: '/'});
	});

*/
dbpv.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider
		.when('/entity/:id', {templateUrl: '/tpl/entity.html', controller: EntityCtrl})
		.when('/search/:id', {templateUrl: '/tpl/search.html', controller: SearchCtrl})
		.when('/list.html', {templateUrl: '/tpl/list.html', controller: ListCtrl})
		.otherwise({redirectTo: '/entity/404'});
});


function dbpv_preprocess_triples(triples) {
	var prefixes = {
		"http://dbpedia.org/resource/": "dbpedia",
		"http://http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
		"http://xmlns.com/foaf/0.1/": "foaf",
		"http://dbpedia.org/ontology/": "dbpedia-owl"
	};
	var localns = "http://dbpedia.org/resource/";

	for (var i = 0; i<triples.length; i++) {
		var triple = triples[i];
		for (var key in triple) {
			var sing = triple[key];
			if (sing.type=="uri") {
				for (var start in prefixes) {
					if (sing.url.slice(0, start.length) == start) {
						sing.prefix = prefixes[start];
						sing.short = sing.url.slice(start.length, sing.url.length);
					}
				}
				if (sing.url.slice(0, localns.length) == localns) {
					sing.uri = sing.url;
					sing.url = "/entity/"+sing.url.slice(localns.length, sing.url.length);
				}
				if (sing.prefix!==undefined && sing.short !== undefined) {
					sing.label = sing.prefix + ":" + sing.short;
				}else{
					sing.label = sing.url;
				}

			}else{
				sing.label = sing.value;
			}
		}
	}
}
