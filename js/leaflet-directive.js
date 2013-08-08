

    Explore
    Gist
    Blog
    Help

    lukovnikov

    18
    149
    55

public tombatossals/angular-leaflet-directive

angular-leaflet-directive / src / angular-leaflet-directive.js
tombatossals 3 hours ago
Added the scrollWheelZoom to the "defaults" property:

11 contributors
file 580 lines (509 sloc) 23.826 kb
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277 278 279 280 281 282 283 284 285 286 287 288 289 290 291 292 293 294 295 296 297 298 299 300 301 302 303 304 305 306 307 308 309 310 311 312 313 314 315 316 317 318 319 320 321 322 323 324 325 326 327 328 329 330 331 332 333 334 335 336 337 338 339 340 341 342 343 344 345 346 347 348 349 350 351 352 353 354 355 356 357 358 359 360 361 362 363 364 365 366 367 368 369 370 371 372 373 374 375 376 377 378 379 380 381 382 383 384 385 386 387 388 389 390 391 392 393 394 395 396 397 398 399 400 401 402 403 404 405 406 407 408 409 410 411 412 413 414 415 416 417 418 419 420 421 422 423 424 425 426 427 428 429 430 431 432 433 434 435 436 437 438 439 440 441 442 443 444 445 446 447 448 449 450 451 452 453 454 455 456 457 458 459 460 461 462 463 464 465 466 467 468 469 470 471 472 473 474 475 476 477 478 479 480 481 482 483 484 485 486 487 488 489 490 491 492 493 494 495 496 497 498 499 500 501 502 503 504 505 506 507 508 509 510 511 512 513 514 515 516 517 518 519 520 521 522 523 524 525 526 527 528 529 530 531 532 533 534 535 536 537 538 539 540 541 542 543 544 545 546 547 548 549 550 551 552 553 554 555 556 557 558 559 560 561 562 563 564 565 566 567 568 569 570 571 572 573 574 575 576 577 578 579 	

var leafletDirective = angular.module("leaflet-directive", []);

leafletDirective.directive('leaflet', [
    '$http', '$log', '$parse', '$rootScope', function ($http, $log, $parse, $rootScope) {

    var defaults = {
        maxZoom: 14,
        minZoom: 1,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileLayerOptions: {
            attribution: 'Tiles &copy; Open Street Maps'
        },
        icon: {
            url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon.png',
            retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon@2x.png',
            size: [25, 41],
            anchor: [12, 40],
            popup: [0, -40],
            shadow: {
                url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
                retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
                size: [41, 41],
                anchor: [12, 40]
            }
        },
        path: {
            weight: 10,
            opacity: 1,
            color: '#0000ff'
        }
    };

    var str_inspect_hint = 'Add testing="testing" to <leaflet> tag to inspect this object';

    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            center: '=center',
            maxBounds: '=maxbounds',
            bounds: '=bounds',
            marker: '=marker',
            markers: '=markers',
            legend: '=legend',
            geojson: '=geojson',
            defaults: '=defaults',
            paths: '=paths',
            tiles: '=tiles',
            leaflet: '=testing',
            events: '=events'
        },
        template: '<div class="angular-leaflet-map"></div>',
        link: function ($scope, element, attrs /*, ctrl */) {
            var centerModel = {
                lat:$parse("center.lat"),
                lng:$parse("center.lng"),
                zoom:$parse("center.zoom")
            };

            if (attrs.width) {
                element.css('width', attrs.width);
            }
            if (attrs.height) {
                element.css('height', attrs.height);
            }


            $scope.leaflet = {};

            $scope.leaflet.maxZoom = !!(attrs.defaults && $scope.defaults && $scope.defaults.maxZoom) ?
                parseInt($scope.defaults.maxZoom, 10) : defaults.maxZoom;
            $scope.leaflet.minZoom = !!(attrs.defaults && $scope.defaults && $scope.defaults.minZoom) ?
                parseInt($scope.defaults.minZoom, 10) : defaults.minZoom;
            $scope.leaflet.doubleClickZoom = !!(attrs.defaults && $scope.defaults && (typeof($scope.defaults.doubleClickZoom) == "boolean") ) ? $scope.defaults.doubleClickZoom : defaults.doubleClickZoom;
            $scope.leaflet.scrollWheelZoom = !!(attrs.defaults && $scope.defaults && (typeof($scope.defaults.scrollWheelZoom) == "boolean") ) ? $scope.defaults.scrollWheelZoom : defaults.scrollWheelZoom;

            var map = new L.Map(element[0], {
                maxZoom: $scope.leaflet.maxZoom,
                minZoom: $scope.leaflet.minZoom,
                doubleClickZoom: $scope.leaflet.doubleClickZoom,
                scrollWheelZoom: $scope.leaflet.scrollWheelZoom
            });

            map.setView([0, 0], 1);
            $scope.leaflet.map = !!attrs.testing ? map : str_inspect_hint;
            setupTiles();
            setupCenter();
            setupMaxBounds();
            setupBounds();
            setupMainMarker();
            setupMarkers();
            setupPaths();
            setupLegend();
            setupEvents();
            setupGeojson();

            // use of leafletDirectiveSetMap event is not encouraged. only use
            // it when there is no easy way to bind data to the directive
            $scope.$on('leafletDirectiveSetMap', function(event, message) {
                var meth = message.shift();
                map[meth].apply(map, message);
            });

            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    $scope.$eval(fn);
                } else {
                    $scope.$apply(fn);
                }
            };

             /*
* Event setup watches for callbacks set in the parent scope
*
* $scope.events = {
* dblclick: function(){
* // doThis()
* },
* click: function(){
* // doThat()
* }
* }
* */

             function setupEvents(){
                 if ( typeof($scope.events) != 'object'){
                     return false;
                 }else{
                     for (var bind_to in $scope.events){
                         map.on(bind_to,$scope.events[bind_to]);
                     }
                 }
             }

            function setupTiles(){
                // TODO build custom object for tiles, actually only the tile string
                // TODO: http://leafletjs.com/examples/layers-control.html

                var tileLayerObj, key;
                $scope.leaflet.tileLayer = !!(attrs.defaults && $scope.defaults && $scope.defaults.tileLayer) ?
                                            $scope.defaults.tileLayer : defaults.tileLayer;

                if ($scope.defaults && $scope.defaults.tileLayerOptions) {
                    for (key in $scope.defaults.tileLayerOptions) {
                        defaults.tileLayerOptions[key] = $scope.defaults.tileLayerOptions[key];
                    }
                }

                if (attrs.tiles) {
                    if ($scope.tiles && $scope.tiles.url) {
                        $scope.leaflet.tileLayer = $scope.tiles.url;
                    }
                    if ($scope.tiles && $scope.tiles.options) {
                        for (key in $scope.tiles.options) {
                            defaults.tileLayerOptions[key] = $scope.tiles.options[key];
                        }
                    }

                    $scope.$watch("tiles.url", function (url) {
                        if (!url) return;
                        tileLayerObj.setUrl(url);
                    });
                }
                tileLayerObj = L.tileLayer($scope.leaflet.tileLayer, defaults.tileLayerOptions);
                tileLayerObj.addTo(map);

                $scope.leaflet.tileLayerObj = !!attrs.testing ? tileLayerObj : str_inspect_hint;
            }

            function setupLegend() {

                if ($scope.legend) {
                    if (!$scope.legend.colors || !$scope.legend.labels || $scope.legend.colors.length != $scope.legend.labels.length) {
                         $log.warn("[AngularJS - Leaflet] legend.colors and legend.labels must be set.");

                    } else {
                        var position = $scope.legend.position || 'bottomright';
                        var legend = L.control({position: position });
                        legend.onAdd = function (map) {
                            var div = L.DomUtil.create('div', 'info legend');
                            for (var i = 0; i < $scope.legend.colors.length; i++) {
                                div.innerHTML +=
                                    '<i style="background:' + $scope.legend.colors[i] + '"></i> ' + $scope.legend.labels[i] + '<br />';
                            }
                            return div;
                        };
                        legend.addTo(map);
                    }
                }
            }

            function setupMaxBounds() {
                if (!$scope.maxBounds) {
                    return;
                }
                if ($scope.maxBounds.southWest && $scope.maxBounds.southWest.lat && $scope.maxBounds.southWest.lng && $scope.maxBounds.northEast && $scope.maxBounds.northEast.lat && $scope.maxBounds.northEast.lng) {
                    map.setMaxBounds(
                        new L.LatLngBounds(
                            new L.LatLng($scope.maxBounds.southWest.lat, $scope.maxBounds.southWest.lng),
                            new L.LatLng($scope.maxBounds.northEast.lat, $scope.maxBounds.northEast.lng)
                        )
                    );

                    $scope.$watch("maxBounds", function (maxBounds) {
                        if (maxBounds.southWest && maxBounds.northEast && maxBounds.southWest.lat && maxBounds.southWest.lng && maxBounds.northEast.lat && maxBounds.northEast.lng) {
                            map.setMaxBounds(
                                new L.LatLngBounds(
                                    new L.LatLng(maxBounds.southWest.lat, maxBounds.southWest.lng),
                                    new L.LatLng(maxBounds.northEast.lat, maxBounds.northEast.lng)
                                )
                            );
                        }
                    });
                }
            }

            function tryFitBounds(bounds) {
                if (bounds) {
                    var southWest = bounds.southWest;
                    var northEast = bounds.northEast;
                    if (southWest && northEast && southWest.lat && southWest.lng && northEast.lat && northEast.lng) {
                        var sw_latlng = new L.LatLng(southWest.lat, southWest.lng);
                        var ne_latlng = new L.LatLng(northEast.lat, northEast.lng);
                        map.fitBounds(new L.LatLngBounds(sw_latlng, ne_latlng));
                    }
                }
            }

            function setupBounds() {
                if (!$scope.bounds) {
                    return;
                }
                $scope.$watch('bounds', function (new_bounds) {
                    tryFitBounds(new_bounds);
                });
            }

            function setupCenter() {
                $scope.$watch("center", function (center) {
                    if (!center) {
                        $log.warn("[AngularJS - Leaflet] 'center' is undefined in the current scope, did you forget to initialize it?");
                        return;
                    }
                    if (center.lat !== undefined && center.lng !== undefined && center.zoom !== undefined) {
                        map.setView( [center.lat, center.lng], center.zoom, { reset: true });
                    } else if (center.autoDiscover === true) {
                        map.locate({ setView: true, maxZoom: $scope.leaflet.maxZoom });
                    }
                }, true);

                map.on("moveend", function (/* event */) {
                    $scope.safeApply(function (scope) {
                        centerModel.lat.assign(scope, map.getCenter().lat);
                        centerModel.lng.assign(scope, map.getCenter().lng);
                        centerModel.zoom.assign(scope, map.getZoom());
                    });
                });
            }

            function setupGeojson() {
                $scope.$watch("geojson", function (geojson) {
                    if (!geojson) {
                        return;
                    }

                    if ($scope.leaflet.geojson) {
                        map.removeLayer($scope.leaflet.geojson);
                    }

                    if (geojson.hasOwnProperty("data")) {
                        $scope.leaflet.geojson = L.geoJson($scope.geojson.data, {
                            style: $scope.geojson.style,
                            onEachFeature: function(feature, layer) {
                                layer.on({
                                    mouseover: function(e) {
                                        $scope.safeApply(function (scope) {
                                            geojson.selected = feature;
                                        });
                                        if (!geojson.mouseover) return;
                                        geojson.mouseover(e);
                                    },
                                    mouseout: function(e) {
                                        $scope.safeApply(function (scope) {
                                            geojson.selected = undefined;
                                        });
                                        if (!geojson.mouseout) return;
                                        geojson.mouseout(e);
                                    },
                                    click: function(e) {
                                        if (geojson.click) {
                                            geojson.click(geojson.selected, e);
                                        }
                                    }
                                });
                            }
                        }).addTo(map);
                    }
                });
            }

            function setupMainMarker() {
                var main_marker;
                if (!$scope.marker) {
                    return;
                }
                main_marker = createMarker('marker', $scope.marker, map);
                $scope.leaflet.marker = !!attrs.testing ? main_marker : str_inspect_hint;
                main_marker.on('click', function(e) {
                    $rootScope.$apply(function() {
                        $rootScope.$broadcast('leafletDirectiveMainMarkerClick');
                    });
                });
            }

            function setupMarkers() {
                var markers = {};
                $scope.leaflet.markers = !!attrs.testing ? markers : str_inspect_hint;
                if (!$scope.markers) {
                    return;
                }

                function genMultiMarkersClickCallback(m_name) {
                    return function(e) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('leafletDirectiveMarkersClick', m_name);
                        });
                    };
                }

                for (var name in $scope.markers) {
                    markers[name] = createMarker(
                            'markers.'+name, $scope.markers[name], map);
                    markers[name].on('click', genMultiMarkersClickCallback(name));
                }

                $scope.$watch('markers', function(newMarkers) {
                    // Delete markers from the array
                    for (var name in markers) {
                        if (newMarkers[name] === undefined) {
                            delete markers[name];
                        }
                    }
                    // add new markers
                    for (var new_name in newMarkers) {
                        if (markers[new_name] === undefined) {
                            markers[new_name] = createMarker(
                                'markers.'+new_name, newMarkers[new_name], map);
                            markers[new_name].on('click', genMultiMarkersClickCallback(new_name));
                        }
                    }
                }, true);
            }

            function createMarker(scope_watch_name, marker_data, map) {
                var marker = buildMarker(marker_data);
                map.addLayer(marker);

                if (marker_data.focus === true) {
                    marker.openPopup();
                }

                marker.on("dragend", function () {
                    $scope.safeApply(function (scope) {
                        marker_data.lat = marker.getLatLng().lat;
                        marker_data.lng = marker.getLatLng().lng;
                    });
                    if (marker_data.message) {
                        marker.openPopup();
                    }
                });

                // Set up marker event broadcasting
                var markerEvents = [
                    'click',
                    'dblclick',
                    'mousedown',
                    'mouseover',
                    'mouseout',
                    'contextmenu',
                    'dragstart',
                    'drag',
                    'dragend',
                    'move',
                    'remove',
                    'popupopen',
                    'popupclose'
                ];

                for( var i=0; i < markerEvents.length; i++) {
                    var eventName = markerEvents[i];

                    marker.on(eventName, function(e) {
                        var broadcastName = 'leafletDirectiveMarker.' + this.eventName;
                        $rootScope.$apply(function(){
                            $rootScope.$broadcast(broadcastName, {
                                markerName: scope_watch_name.replace('markers.', ''),
                                leafletEvent: e
                            });
                        });
                    }, {
                        eventName: eventName,
                        scope_watch_name: scope_watch_name
                    });
                }

                var clearWatch = $scope.$watch(scope_watch_name, function (data, old_data) {
                    if (!data) {
                        map.removeLayer(marker);
                        clearWatch();
                        return;
                    }

                    if (old_data) {
                        if (data.draggable !== undefined && data.draggable !== old_data.draggable) {
                            if (data.draggable === true) {
                                marker.dragging.enable();
                            } else {
                                marker.dragging.disable();
                            }
                        }

                        if (data.focus !== undefined && data.focus !== old_data.focus) {
                            if (data.focus === true) {
                                marker.openPopup();
                            } else {
                                marker.closePopup();
                            }
                        }

                        if (data.message !== undefined && data.message !== old_data.message) {
                            marker.bindPopup(data);
                        }

                        if (data.lat !== old_data.lat || data.lng !== old_data.lng) {
                            marker.setLatLng(new L.LatLng(data.lat, data.lng));
                        }

                        if (data.icon && data.icon !== old_data.icon) {
                            marker.setIcon(data.icon);
                        }
                    }
                }, true);
                return marker;
            }

            function buildMarker(data) {
                var micon = null;
                if (data.icon) {
                    micon = data.icon;
                } else {
                    micon = buildIcon();
                }
                var marker = new L.marker(data,
                    {
                        icon: micon,
                        draggable: data.draggable ? true : false
                    }
                );
                if (data.message) {
                    marker.bindPopup(data.message);
                }
                return marker;
            }

            function buildIcon() {
                return L.icon({
                    iconUrl: defaults.icon.url,
                    iconRetinaUrl: defaults.icon.retinaUrl,
                    iconSize: defaults.icon.size,
                    iconAnchor: defaults.icon.anchor,
                    popupAnchor: defaults.icon.popup,
                    shadowUrl: defaults.icon.shadow.url,
                    shadowRetinaUrl: defaults.icon.shadow.retinaUrl,
                    shadowSize: defaults.icon.shadow.size,
                    shadowAnchor: defaults.icon.shadow.anchor
                });
            }

            function setupPaths() {
                var paths = {};
                $scope.leaflet.paths = !!attrs.testing ? paths : str_inspect_hint;

                if (!$scope.paths) {
                    return;
                }

                $log.warn("[AngularJS - Leaflet] Creating polylines and adding them to the map will break the directive's scope's inspection in AngularJS Batarang");

                for (var name in $scope.paths) {
                    paths[name] = createPath(name, $scope.paths[name], map);
                }

                $scope.$watch("paths", function (newPaths) {
                    for (var new_name in newPaths) {
                        if (paths[new_name] === undefined) {
                            paths[new_name] = createPath(new_name, newPaths[new_name], map);
                        }
                    }
                    // Delete paths from the array
                    for (var name in paths) {
                        if (newPaths[name] === undefined) {
                            delete paths[name];
                        }
                    }

                }, true);
            }

            function createPath(name, scopePath, map) {
                var polyline = new L.Polyline([], {
                    weight: defaults.path.weight,
                    color: defaults.path.color,
                    opacity: defaults.path.opacity
                });

                if (scopePath.latlngs !== undefined) {
                    var latlngs = convertToLeafletLatLngs(scopePath.latlngs);
                    polyline.setLatLngs(latlngs);
                }

                if (scopePath.weight !== undefined) {
                    polyline.setStyle({ weight: scopePath.weight });
                }

                if (scopePath.color !== undefined) {
                    polyline.setStyle({ color: scopePath.color });
                }

                if (scopePath.opacity !== undefined) {
                    polyline.setStyle({ opacity: scopePath.opacity });
                }

                map.addLayer(polyline);

                var clearWatch = $scope.$watch('paths.' + name, function (data, oldData) {
                    if (!data) {
                        map.removeLayer(polyline);
                        clearWatch();
                        return;
                    }

                    if (oldData) {
                        if (data.latlngs !== undefined && data.latlngs !== oldData.latlngs) {
                            var latlngs = convertToLeafletLatLngs(data.latlngs);
                            polyline.setLatLngs(latlngs);
                        }

                        if (data.weight !== undefined && data.weight !== oldData.weight) {
                            polyline.setStyle({ weight: data.weight });
                        }

                        if (data.color !== undefined && data.color !== oldData.color) {
                            polyline.setStyle({ color: data.color });
                        }

                        if (data.opacity !== undefined && data.opacity !== oldData.opacity) {
                            polyline.setStyle({ opacity: data.opacity });
                        }
                    }
                }, true);
                return polyline;
            }

            function convertToLeafletLatLngs(latlngs) {
                var leafletLatLngs = latlngs.filter(function (latlng) {
                    return !!latlng.lat && !!latlng.lng;
                }).map(function (latlng) {
                    return new L.LatLng(latlng.lat, latlng.lng);
                });

                return leafletLatLngs;
            }
        }
    };
}]);

    Status
    API
    Training
    Shop
    Blog
    About

    © 2013 GitHub, Inc.
    Terms
    Privacy
    Security
    Contact


