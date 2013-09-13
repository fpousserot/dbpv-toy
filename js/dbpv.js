dbpv.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider
		.when('/page/:id', {templateUrl: '/tpl/entity.html', controller: EntityCtrl})
		.when('/resource/:id', {redirectTo: function(params, a, search) {return '/page/'+params.id;} })
		.when('/entity/:id', {redirectTo: function(params, a, search) {return '/page/'+params.id;} })
		.when('/ontology/:id', {templateUrl: '/tpl/entity.html', controller: OwlCtrl})
		.when('/property/:id', {templateUrl: '/tpl/entity.html', controller: PropCtrl})
		.when('/class/:id', {templateUrl: '/tpl/entity.html', controller: ClassCtrl})

		.when('/ontology/:klas/:id', {templateUrl: '/tpl/entity.html', controller: OwlCtrl}) //FIXME Quick fix because Angular doesn't support slashes in routing parameters
		.when('/property/:klas/:id', {templateUrl: '/tpl/entity.html', controller: PropCtrl}) //FIXME same

		.otherwise({redirectTo: '/entity/404'});
});

dbpv.filter("valueFilter", function() {
	return function(input, query) {
		if (!query) return input;
		query = query.label;
		query = query.toLowerCase();
		var result = [];
		angular.forEach(input, function(value) {
			var label = value.label.toLowerCase();
			if (label.indexOf(query) != -1) result.push(value);
		});
		return result;
	};
});

dbpv.filter("predicateFilter", function() {
	return function(input, query) {
		if(!query) return input;
		query = query.toLowerCase();
		var result = [];
		angular.forEach(input, function(predicate) {
			var label = predicate.label.toLowerCase();
			if (label.indexOf(query) != -1) result.push(predicate);
		});
		return result;
	};
});

dbpv.filter("predicateValueFilter", function() { //XXX maybe merge with previous filter
	return function(input, query) {
		if (!query) return input;
		query = query.label;
		query = query.toLowerCase();
		var result = [];
		angular.forEach(input, function(predicate) {
			var hasvalues = false;
			for (var i = 0; i<predicate.values.length; i++) {	//simulates value filter
				var label = predicate.values[i].label.toLowerCase();
				if (label.indexOf(query) != -1) {
					hasvalues = true;
				}	
			}
			if (hasvalues) {
				result.push(predicate);
			}
		});
		return result;
	}
});

dbpv.filter("languageFilter", function() {
	return function(input, primary, fallback) {
		if(!primary || !fallback || input.length<2) return input;
		var result = [];
		var breek = false;
		angular.forEach(input, function(predval) {
			if (!breek){
				if (predval['xml:lang'] === undefined) {
					result.push(predval);
				}else{
					if (predval['xml:lang'] == primary) {
						result = [predval];
						breek = true;
					}else if (result.length == 0 && predval['xml:lang'] == fallback) {
						result = [predval];
					}
				}
			}
		});
		return result;
	};
});

dbpv.filter("actionFilter", function() {
	return function(actions, about, pred, val) {
		if(!pred || !val) return [];
		var result = [];
		angular.forEach(actions, function(action) {
			if (action.autobind !== undefined && action.autobind(about, pred, val)) {
				result.push(action);
			}
		});
		return result;
	};
});

dbpv.directive('compile', function($compile) {
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				return scope.$eval(attrs.compile);
			},
			function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			}
		);
	};
});

dbpv.directive('dbpvPreview', function($timeout) {
	return function(scope, element, attrs) {
		//alert(JSON.stringify(attrs));
		var to = undefined;
		element.bind('mouseenter', function () {
			to = $timeout(function() {
				var parent = element;
				var position = parent.offset();
//alert(JSON.stringify(position));
				position.top = position.top + parent.height();
				to = undefined;
				var url = attrs.dbpvPreview;
				scope.entityPreview(url, position.top, position.left);
				scope.previewItemHover();
			}, 800);
		});
		element.bind('mouseleave', function () {
			if(to) $timeout.cancel(to);
			scope.previewItemUnhover();
		});
	};
});

dbpv.directive('labelList', function(Preview, $filter, $compile) {
	return {
		link: function(scope, element, attrs) {
			var rurl = attrs.labelList;
			if (rurl.substr(0, scope.owlgraph.length) == scope.owlgraph) rurl = rurl.substr(scope.owlgraph.length);

			scope.labellist = Preview.getProperty(rurl, "http://www.w3.org/2000/01/rdf-schema#label", {"count":0}, scope.owlgraph, scope.owlendpoint);

			scope.updateLabellist = function (list) {
				element.html("<a dbpv-preview='"+attrs.labelList+"' href='"+attrs.labelList+"'>"+$filter("languageFilter")(list, scope.primary_lang, scope.fallback_lang)[0].label+"</a>");
				$compile(element.contents())(scope);
			};

			scope.$watch("labellist", function (list) {
				scope.updateLabellist(list);
			}, true);
			scope.$watch("primary_lang", function (list) {
				scope.updateLabellist(scope.labellist);
			});
		}
	};
});

dbpv.directive('sameOffset', function () {
	return {
		link:	function (scope, element, attrs) {
			var idToWatch = attrs.sameOffset;
			scope.$watch(
				function () {
					return angular.element(idToWatch).offset().top;
				},
				function (top) {
					element.css("top", top);
					//element.attr("smartscrollinit", top);
				}
			);
		}
	};
});

dbpv.directive('shortcut', function ($compile) {
	return {
		link: 	function (scope, element, attrs) {
				var pred = scope.$eval(attrs.shortcut);
				var label = scope.$eval(attrs.shortcutLabel);
				
				scope.useShortcut = function() {
					var amt = $("a[href='"+pred+"']");
					if (amt !== undefined) {
						amt = parseInt(amt.offset().top)-10.0;
						$('body,html').animate({scrollTop: amt}, 100);
						return false;
					}
				};
				
				element.html("<a href='javascript:void(0);' ng-click='useShortcut();'>"+label+"</a>");
				$compile(element.contents())(scope);
			}
		};
});

dbpv.directive('smartScroll', function ($window) {
	return {
		link:	function (scope, element, attrs) {
				var prevset = 0;
				var inittop = 0;
				var scrolled = false;
				var inittop = attrs.smartScroll;
				if (inittop !== undefined) element.offset({"top": inittop, 'left':element.offset().left});
				//alert(JSON.stringify(element.offset()));
				$(window).scroll (function () {
					if (inittop === undefined) inittop = attrs.smartScroll;
					if (inittop === undefined) inittop = element.attr("smartscrollinit");
					if (inittop === undefined) inittop = 0;
					var down = $(window).scrollTop() > prevset;
					prevset = $(window).scrollTop();

					var winh = $(window).height();
					var wins = $(window).scrollTop();
					var eleh = element.height();
					var eles = element.offset().top;
					var elel = element.offset().left;
					// distance top of element -> top of window
					var eletopmar = wins-eles;
					// distance bottom of window -> bottom element
					var elebotmar = eles+eleh-wins-winh;

					var cantop = wins;
					
					if (eleh > winh) {
						if (down) {
							if (eletopmar > 0) {
								var canelebotmar = elebotmar + eletopmar;
								if (elebotmar < 0) {
									cantop = wins - canelebotmar;
								}else{
									cantop = undefined;
								}						
							}
						}else{
							console.log(eletopmar);
							if (eletopmar < 0) {
								cantop = wins;
							} else {
								cantop = undefined;
							}
						}
					}
					if (cantop !== undefined) {
						if (cantop > inittop) {
							element.offset({"top":cantop, "left": elel});
						}else{
							element.offset({"top":inittop, "left": elel});
						}
					}
				});
			}
		};
});

dbpv.directive('dbpvTop', function ($compile) {
	return {
		link:	function (scope, element, attrs) {
				scope.goHome = function() {
					$('body,html').animate({scrollTop: 0}, 800);
					return false;
				}
				element.html("<a href='javascript:void(0);' ng-click='goHome();'><span class='glyphicon glyphicon-chevron-up'></span></a>");
				$compile(element.contents())(scope);
				
				if ($(window).scrollTop() < 150) {
					element.css("visibility","hidden");
				}

				$(window).scroll( function () {
					if ($(window).scrollTop() > 150) {
						element.css("visibility","visible");
					}else{
						element.css("visibility","hidden");
					}

				});
			}
		};
});

dbpv.directive('smartSlide', function () {
	return {
		link: 	function (scope, element, attrs) {
					var root = attrs.id;
					var original = $("#"+root+" "+attrs.smartSlideContent).css("right");
					$("#"+root+" "+attrs.smartSlideContent).hide();
					$("#"+root+" "+attrs.smartSlide).click( function() {
						var a = $("#"+root+" "+attrs.smartSlideContent).css("right");
						var a = a.substr(0, a.length-2);
						if ( a < 0) {
							$("#"+root+" "+attrs.smartSlideContent).show();
							$("#"+root+" "+attrs.smartSlideContent).animate({
								right: "0px"
							}, 200);
						} else {
							$("#"+root+" "+attrs.smartSlideContent).animate({
								right: original
							}, 200, function() {$("#"+root+" "+attrs.smartSlideContent).hide();});
						}
					});
				}
	};
});
