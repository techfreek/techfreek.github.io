function openProjectView(project) {
	console.log("Value: " + project.val());
	var img = $(project).find("img");
	var title = $(project).find("h3");
	var caption = $(project).find("figcaption");
	
	title = title.text();
	console.log("Title: " + title);
	createProjectModal(title, caption.text(), img.attr("src"));
}

function createProjectModal(ProjectTitle, caption, image) {
	var modal = document.createElement("div");
	var dialog = document.createElement("div");
	var content = document.createElement("div");
	var header = document.createElement("div");
	var exit = document.createElement("button");
	var exitWrapper = document.createElement("span");
	var close = document.createElement("button");
	var footer = document.createElement("div");
	var title = document.createElement("h4");
	var body = document.createElement("div");
	var bodyp = document.createElement("p");
	var img = document.createElement("img");

	console.log("caption: " + caption);
	//Create body of modal
	img.src = image;
	bodyp.innerHTML = caption;

	body.className = "modal-body";
	body.appendChild(img);
	body.appendChild(bodyp);

	//create header of modal
	title.innerHTML = ProjectTitle;
	title.className = "modal-title";

	exitWrapper.setAttribute("aria-hidden", true);
	exitWrapper.innerHTML = "&times;";

	exit.appendChild(exitWrapper);
	exit.setAttribute("type", "button");
	exit.className = "close";
	exit.setAttribute("type", "button");
	exit.setAttribute("data-dismiss", "modal");
	exit.setAttribute("aria-label", "Close");

	header.appendChild(exit);
	header.appendChild(title);

	//create footer
	footer.className = "modal-footer";
	close.setAttribute("type", "button");
	close.className = "btn btn-default";
	close.setAttribute("data-dismiss", "modal");
	close.innerHTML = "Close";

	footer.appendChild(close);


	//put it all together
	content.className = "modal-content";
	content.appendChild(header);
	content.appendChild(body);
	content.appendChild(footer);

	dialog.className = "modal-dialog";
	dialog.appendChild(content);
	modal.className = "modal fade";
	modal.id = "modal";
	modal.appendChild(dialog);

	console.log("Adding modal to body");
	document.body.appendChild(modal);
	$('#modal').modal({
		keyboard: true,
		show: true
	})
}

function deleteModal() {
	document.getElementById("modal").remove();
}