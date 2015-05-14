function openProjectView(project) {
	var jqProject = $(project);
	var proj = jqProject.get(0);
	var options = {
		title: null,
		youtube: null,
		github: null,
		link: null,
		content: null,
		img: null
	}
	
	var title = jqProject.find("h3");
	var caption = proj.getElementsByTagName("figcaption")[0];
	
	console.log("github: " + jqProject.attr("data-github"));

	options.title = title.text();
	options.github = jqProject.attr("data-github") || null;
	options.youtube = jqProject.attr("data-youtube") || null;
	options.link = jqProject.attr("data-link") || null;
	options.content = caption.cloneNode(true);
	options.img = jqProject.attr("data-img") || jqProject.find("img").attr("src");

	//console.log("options: " + JSON.stringify(options));
	createProjectModal(options);
}

function createProjectModal(options) {
	var modal = $("#modal");
	var header = modal.find(".modal-header");
	var footer = modal.find(".modal-footer");
	var title = header.find("h4");
	var body = modal.find(".modal-body");
	var bodyp = body.find("p");
	var img = body.find("img");
	var github = footer.find(".github");
	var youtube = footer.find(".youtube");
	var link = footer.find(".offsite");
	var bodyLink = null;
	var cap = null;
	var nLink = null;

	//remove caption if it exists
	cap = body.get(0).getElementsByTagName("figcaption")[0];
	if(cap) {
		cap.parentNode.removeChild(cap);
	}


	//Create body of modal
	img.attr("src", options.img);
	body.get(0).appendChild(options.content);

	bodyLink = body.get(0).getElementsByTagName("span")[0];

	//convert all span links to a links
	while(bodyLink) {
		nLink = document.createElement("a");
		nLink.href = $(bodyLink).attr("data-href");
		nLink.innerHTML = bodyLink.innerHTML;

		//insert real link after span link
		$(nLink).insertAfter(bodyLink);

		//remove span link
		bodyLink.parentNode.removeChild(bodyLink);
		bodyLink = body.get(0).getElementsByTagName("span")[0];
	}

	//bodyp.text(caption);

	//create header of modal
	title.text(options.title);

	//apply options
	if(options.github) {
		github.attr("href", options.github);
		github.css("display", "inline-block");
	} else {
		github.css("display", "none");
	}

	if(options.youtube) {
		youtube.attr("href", options.youtube);
		youtube.css("display", "inline-block");
	} else {
		youtube.css("display", "none");
	}

	if(options.link) {
		link.attr("href", options.link);
		link.css("display", "inline-block");
	} else {
		link.css("display", "none");
	}

	$('#modal').modal({
		show: true
	});
}

function deleteModal() {
	document.getElementById("modal").remove();
}