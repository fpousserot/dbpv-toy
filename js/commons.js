function dbpv_pretty_triple(triple) {
	var map = {
		"http://www.w3.org/2000/01/rdf-schema#label":
			{"property": "label", "show_prop": false, "type": "text"},
		"http://www.w3.org/2000/01/rdf-schema#comment": 
			{"property": "Description", "show_prop": true, "type": "text"},
		"http://dbpedia.org/ontology/birthPlace": 
			{"property":"Place of Birth", "show_prop":true, "type": "text"},
		"http://dbpedia.org/ontology/birthDate": 
			{"property":"Date of Birth", "show_prop":true, "type": "text"},
		"http://xmlns.com/foaf/0.1/primaryTopic": 
			{"property": "wikipage", "show_prop":false, "type": "uri"},
		"http://xmlns.com/foaf/0.1/depiction": 
			{"property":"image", "show_prop":false, "type": "img"},
		"http://xmlns.com/foaf/0.1/name": 
			{"property": "name", "show_prop":true, "type": "text"}
	};

	var pretty = map[triple.property.url];
	if ( pretty !== undefined) {
		pretty.value = triple.object.value;
	}
	return pretty;
}