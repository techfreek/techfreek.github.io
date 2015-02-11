function openProjectView(project) {
	var options = {
		youtube: null,
		github: null,
		link: null
	}

	var img = $(project).find("img");
	var title = $(project).find("h3");
	var caption = $(project).find("figcaption");
	
	console.log("github: " + $(project).attr("github"));

	options.github = $(project).attr("github") || null;
	options.youtube = $(project).attr("youtube") || null;
	options.link = $(project).attr("link") || null;
	
	console.log("options: " + JSON.stringify(options));
	createProjectModal(title.text(), caption.text(), img.attr("src"), options);
}

function createProjectModal(ProjectTitle, caption, image, options) {
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

	//Create body of modal
	img.attr("src", image);
	bodyp.text(caption);

	//create header of modal
	title.text(ProjectTitle);

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