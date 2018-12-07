

function parsesize (size) {
	if (size == "T") size = "Tiny";
	if (size == "S") size = "Small";
	if (size == "M") size = "Medium";
	if (size == "L") size = "Large";
	if (size == "H") size = "Huge";
	if (size == "G") size = "Gargantuan";
	return size;
}

function parseschool (school) {
	if (school == "A") return "abjuration";
	if (school == "EV") return "evocation";
	if (school == "EN") return "enchantment";
	if (school == "I") return "illusion";
	if (school == "D") return "divination";
	if (school == "N") return "necromancy";
	if (school == "T") return "transmutation";
	if (school == "C") return "conjuration";
	return false;
}

function parsespelllevel (level) {
	if (isNaN (level)) return false;
	if (level === "0") return "cantrip"
	if (level === "2") return level+"nd";
	if (level === "3") return level+"rd";
	if (level === "1") return level+"st";
	return level+"th";
}
function tagcontent (curitem, tag, multi=false) {
	if (!curitem.getElementsByTagName(tag).length) return false;
	return curitem.getElementsByTagName(tag)[0].childNodes[0].nodeValue;
}

function asc_sort(a, b){
	return ($(b).text()) < ($(a).text()) ? 1 : -1;
}

function dec_sort(a, b){
	return ($(b).text()) > ($(a).text()) ? 1 : -1;
}

window.onload = loadspells;
var tabledefault="";
var classtabledefault ="";

function loadspells() {
	tabledefault = $("#stats").html();
	statsprofdefault = $("#statsprof").html();
	classtabledefault = $("#classtable").html();

	var templatelist = templatedata.compendium.template;

	for (var i = 0; i < templatelist.length; i++) {
		var curtemplate = templatelist[i];

		$("ul.classes").append("<li id='"+i+"' data-link='"+encodeURI(curtemplate.name)+"'><span class='name'>"+curtemplate.name+"</span></li>");

	}

	var options = {
		valueNames: ['name'],
		listClass: "classes"
	}

	var templatelist = new List("listcontainer", options);
	templatelist.sort ("name");

	$("ul.list li").mousedown(function(e) {
		if (e.which === 2) {
			window.open("#"+$(this).attr("data-link"), "_blank").focus();
			e.preventDefault();
			e.stopPropagation();
			return;
		}
	});

	$("ul.list li").click(function(e) {
		var subclass = window.location.hash.split(/\,/)[1];
		window.location.hash = "#"+$(this).attr("data-link")+",";
		if (subclass !== "undefined") {
			window.location.hash += subclass;
		}
		useclass($(this).attr("id"));
		if (!$("div#subclasses > span:contains("+(decodeURIComponent(window.location.hash).split(/\,/)[1])+")").length) {
			window.location.hash = window.location.hash.replace(/\,.*/g,",");
		}

		document.title = decodeURI($(this).attr("data-link")) + " - 5etools Templates";
	});

	if (window.location.hash.length) {
		$("ul.list li[data-link='"+window.location.hash.split(/\#|\,/)[1]+"']:eq(0)").click();
		if (window.location.hash.split(/\,/)[1].length) {
			$("div#subclasses > span:contains("+(decodeURIComponent(window.location.hash).split(/\,/)[1])+")").click()
			if (!$("div#subclasses > span:contains("+(decodeURIComponent(window.location.hash).split(/\,/)[1])+")").length) {
				window.location.hash = window.location.hash.replace(/\,.*/g,",");
			}
		}
	} else $("ul.list li:eq(0)").click();

	// reset button
	$("button#reset").click(function() {
		$("#filtertools select").val("All");
		$("#search").val("");
		templatelist.search("");
		templatelist.filter();
		templatelist.sort("name");
		templatelist.update();
	})
}

function useclass (id) {
	$("#stats").html(tabledefault);
	$("#statsprof").html(statsprofdefault);
	$("#classtable").html(classtabledefault);
	var templatelist = templatedata.compendium.template;
	var curtemplate = templatelist[id];

	$("th#name").html(curtemplate.name);
	$("td#flavor_text p").html(curtemplate.flavor);


	var subclasses = [];
	for (var i = curtemplate.autolevel.length-1; i >= 0; i--) {
		var curlevel = curtemplate.autolevel[i];

// spell slots and table data
		if (!curlevel.feature) {
			if (curlevel.slots) {
				$("tr:has(.slotlabel)").show();
				if (curlevel.slots.__text) curlevel.slots = curlevel.slots.__text;
				var curslots = curlevel.slots.split(",");
				if (curslots[0] !== "0" && $("th.slotbuffer").attr("colspan") < 4) {
					$("#classtable td.border").attr("colspan", parseInt($("#classtable td.border").attr("colspan"))+1);
					$("th.slotbuffer").attr("colspan", parseInt($("th.slotbuffer").attr("colspan"))+1);
				}
				$("th.slotlabel").attr("colspan", curslots.length-1);
				if (curslots.length > 1) $(".featurebuffer").hide();

				for (var a = 0; a < curslots.length; a++) {
					if (curslots[a] === "0") continue;
					$(".spellslots"+a).show();
					$("tr#level"+curlevel._level+" td.spellslots"+a).html(curslots[a]);
				}
			}


// other features
		} else for (var a = curlevel.feature.length-1; a >= 0; a--) {
			var curfeature = curlevel.feature[a];
			var link = curlevel._level + "_" + a;


			if (curfeature._optional === "YES") {
				subclasses.push(curfeature);
			}

			var subfeature = (curfeature.suboption === "YES") ? " subfeature" : "";
			var issubclass = (curfeature.subclass !== "undefined" && curfeature.parent === curfeature.subclass)  ? "" : " subclass";


			// write out list to class table
			var multifeature = "";
			if (curlevel.feature.length !== 1 && a !== 0) multifeature = ", ";
			if (curfeature._optional !== "YES") $("tr#level"+curlevel._level+" td.features").prepend(multifeature+"<a href='"+window.location.hash+"' data-link='"+link+"'>"+curfeature.name+"</a>")

			// display features in bottom section
			var dataua = (curfeature.subclass !== undefined && curfeature.subclass.indexOf(" (UA)") !== -1) ? "true" : "false";
			$("#features").after("<tr><td colspan='6' class='feature"+subfeature+issubclass+"' data-subclass='"+curfeature.subclass+"' data-ua='"+dataua+"'><strong id='feature"+link+"'>"+curfeature.name+"</strong> <p>"+curfeature.text.join("</p><p>")+"</td></tr>");
		}

	}

	$("td.features, td.slots, td.newfeature").each(function() {
		if ($(this).html() === "") $(this).html("—")
	});

	$(".feature:contains('Maneuver: ')").css("font-size","0.8em");

	$("div#subclasses span").remove();
	var prevsubclass = 0;
	for (var i = 0; i < subclasses.length; i++) {

		if (typeof subclasses[i].issubclass !== "undefined" && subclasses[i].issubclass !== "YES") {
			$(".feature[data-subclass='"+subclasses[i].subclass+"']").hide();
			continue;
		}

		if (!prevsubclass) prevsubclass = subclasses[i].subclass;

		if (subclasses[i].issubclass === "YES") $("div#subclasses").prepend("<span data-subclass='"+subclasses[i].name+"'><em style='display: none;'>"+subclasses[i].name.split(": ")[0]+": </em><span>"+subclasses[i].name.split(": ")[1]+"</span></span>")

	}

	$("div#subclasses > span").sort(asc_sort).appendTo("div#subclasses");

	$("div#subclasses > span").click(function() {
		var name = $(this).children("span").text();
		if ($(this).hasClass("active")) {
			$(".feature").show();
			$(this).removeClass("active");
			window.location.hash = window.location.hash.replace(/\,.*/g,",");
			return;
		}

		$("div#subclasses span.active").removeClass("active");
		$(this).addClass("active");

		window.location.hash = window.location.hash.replace(/\,\S*/g, ","+encodeURIComponent(name).replace("'","%27"))

		$(".feature[data-subclass!='"+$(this).text()+"'][data-subclass!='undefined']").hide();
		$(".feature[data-subclass='"+$(this).text()+"']").show();
	})

	//	$("div#subclasses > span").first().click();

		$(".features a").click(function() {
			$("#stats").parent().scrollTop(0)
			$("#stats").parent().scrollTop($("#stats").parent().scrollTop() + $("td.feature strong[id='feature"+$(this).attr("data-link")+"']").position().top)
			$("html, body").scrollTop($("td.feature strong[id='feature"+$(this).attr("data-link")+"']").position().top);
		})

	return;
};
