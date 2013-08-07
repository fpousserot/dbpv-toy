var dbpv_taf_actions = [];

function tafAdd(action) {
	dbpv_taf_actions.push(action);
}

function TafAction() {
	dbpv_taf_actions.push(this);
}

TafAction.prototype.autobind = function (about, predicate, value) {
	if (value.taf !== undefined) {
		if (value.taf[this.id] === undefined) {
			value.taf[this.id] = {"init":false};
		}
		if (!value.taf[this.id].init) {
			this.initialize(about, predicate, value);
			value.taf[this.id].init = true;
		}else{
			return this.check(about, predicate, value);
		}
	}else{
		return false;
	}
};

TafAction.prototype.initialize = function (about, predicate, value) {
//	alert("initializing");
};

TafAction.prototype.check = function (about, predicate, value) {
	return true;
};

//XXX XXX XXX ACTIONS DECLARE BELOW THIS LINE XXX XXX XXX

// VIEW IN LODLIVE (only for DBpedia entities) (example of a simple action)

var dbpv_taf_lodlive =  new TafAction();

dbpv_taf_lodlive.id = "lodlive";
dbpv_taf_lodlive.description = "View in LODLive";

dbpv_taf_lodlive.check = function (about, predicate, value) {
	return value.type == "uri" && value.prefix == "dbpedia";
};

dbpv_taf_lodlive.display = function (about, predicate, value) {
	return "<span class='glyphicon glyphicon-globe'></span>";
};

dbpv_taf_lodlive.execute = function (about, predicate, value) {
	var lodurl = "http://en.lodlive.it/?";
	window.open(lodurl+value.uri);
};


// EXAMPLE OF AN ACTION WITH LOCAL STATE
var dbpv_taf_dummy = new TafAction();

dbpv_taf_dummy.id = "dummy";

dbpv_taf_dummy.display_inactive = "<span class='glyphicon glyphicon-play'></span>";
dbpv_taf_dummy.display_active = "<span class='glyphicon glyphicon-cog'></span>";


dbpv_taf_dummy.initialize = function (about, predicate, value) {
	value.taf.dummy.active = false;
};

dbpv_taf_dummy.check = function (about, predicate, value) {			 //return Boolean whether applicable or not
	return value.type!="uri";
};

dbpv_taf_dummy.display = function (about, predicate, value) {
	if (value.taf.dummy.active) {
		return dbpv_taf_dummy.display_active;
	}else{
		return dbpv_taf_dummy.display_inactive;
	}
};

dbpv_taf_dummy.execute = function (about, predicate, value) {			 // called when user clicks the action button
	if (value.taf.dummy.active) {
		value.label += "_tss";
		value.taf.dummy.active = false;
	}else{
		value.label += "_badum";
		value.taf.dummy.active = true;
	}
};

// EXAMPLE OF AN ACTION WITH GLOBAL STATE
var dbpv_taf_global = new TafAction();

dbpv_taf_global.id = "global";
dbpv_taf_global.clicks = 0;

dbpv_taf_global.display_inactive = "<span class='glyphicon glyphicon-search'></span>";
dbpv_taf_global.display_active = "<span class='glyphicon glyphicon-qrcode'></span>";

dbpv_taf_global.initialize = function (about, predicate, value) {
	value.taf.global.active = false;
};

dbpv_taf_global.check = function (about, predicate, value) {
	return dbpv_taf_global.clicks < 4 && value.type == "uri";
};

dbpv_taf_global.display = function (about, predicate, value) {
	if (dbpv_taf_global.clicks % 2 == 0) {
		return dbpv_taf_global.display_active;
	}else{
		return dbpv_taf_global.display_inactive;
	}
};

dbpv_taf_global.execute = function (about, predicate, value) {
	dbpv_taf_global.clicks += 1;
};

