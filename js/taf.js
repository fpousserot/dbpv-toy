var dbpv_taf_actions = [];

function tafAdd(action) {
	dbpv_taf_actions.push(action);
}

//XXX XXX XXX ACTIONS DECLARE BELOW THIS LINE XXX XXX XXX

var dbpv_taf_dummy = {};

dbpv_taf_dummy.name = '<span class="glyphicon glyphicon-play"> </span>'; //HTML HERE

dbpv_taf_dummy.autobind = function (predicate, value) {			 //return Boolean whether applicable or not
	return value.type!="uri";
};

dbpv_taf_dummy.execute = function (predicate, value) {			 // called when user clicks the action button
	value.label += "_badum_tss";
};

tafAdd(dbpv_taf_dummy); // XXX don't forget this (otherwise action won't be available)
