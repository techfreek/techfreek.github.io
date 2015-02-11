function loadRepos(uname, callback) {
	var url = "https://api.github.com/users/" + uname + "/repos";
	$.getJSON(url, callback);
}

function countLanguageUse(repos) {
	var langs = {
		JavaScript: 2,
		Arduino: 1
	};
	//These two start preset because of hidden repos

	//console.log("Repos: " + JSON.stringify(repos));

	for(var i = 0; i < repos.length; i++) {
		if(typeof(langs[repos[i].language]) === 'undefined') {
			langs[repos[i].language] = 0;
		}
		langs[repos[i].language] += 1;
	}
	return langs;
}

function addBars(languages) {
	var langs = document.getElementById('langs');
	var maxProjects = 10;
	var objs = Object.keys(languages);

	objs.forEach(function(lang) {
		if(lang === "null") {
			return;
		}
		var row = document.createElement('div');
		var language = document.createElement('div');
		var wrapper = document.createElement('div');
		var graph = document.createElement('div');
		var innerGraph = document.createElement('span');
		var percent = ((languages[lang] / maxProjects) * 100);

		innerGraph.innerHTML = languages[lang] + ' projects';
		
		graph.setAttribute('aria-valuemin', 0);
		graph.setAttribute('aria-valuemax', maxProjects);
		graph.setAttribute('aria-valuenow', languages[lang]);
		graph.setAttribute('role', 'progressbar')
		graph.style.width = percent + '%'; 

		graph.className = "col-9 progress-bar";

		wrapper.className = "progress";

		language.className = "col-3";
		language.innerHTML = lang;

		row.className = "row";

		graph.appendChild(innerGraph);
		wrapper.appendChild(graph);
		row.appendChild(language);
		row.appendChild(wrapper);

		langs.appendChild(row);
	});
}

function findActivity(uname, callback) {
	var url = "https://api.github.com/users/" + uname + "/events";
	$.getJSON(url, callback);
}

function addActivity(activities) {
	var table = document.getElementById('github-activity-body');

	for(var i = 0; i < 5 && i < activities.length; i++) {
		var activity = activities[i];
		var row = document.createElement('tr');
		var td = document.createElement('td');
		if(activity.type === "PushEvent") {
			var refs = activity.payload.ref.split('/');
			if(activity.payload.commits[0].message.length > 50) {
				activity.payload.commits[0].message =
					activity.payload.commits[0].message.slice(0, 50) +
					'...';
			}

			td.innerHTML = activity.actor.login +
				" pushed to " +
				refs[refs.length - 1] +
				" at " +
				activity.repo.name.link(activity.payload.commits[0].url) +
				'<br>' +
				activity.payload.commits[0].message;
		} else if(activity.type === "IssueCommentEvent") {
			if(activity.comment.body.length > 50) {
				activity.comment.body.message =
					activity.comment.body.message.slice(0, 50) +
					'...';
			}
			
			var issueComment = activity.repo.name + '#' + activity.payload.number;

			td.innerHTML = activity.actor.login +
				" commented on issue " +
				issueComment.link(activity.comment.url) +
				'<br>' +
				activity.comment.body.message;
		} else if(activity.type === "IssuesEvent") {
			var issueComment = activity.repo.name + '#' + activity.payload.number;

			td.innerHTML = activity.actor.login +
				" opened issue " +
				issueComment.link(activity.issue.url) +
				'<br>' +
				activity.payload.issue.title;
		} else if(activity.type === "WatchEvent") {
			td.innerHTML = activity.actor.login +
				" starred " +
				activity.repo.name.link(activity.repo.url);
		}

		row.appendChild(td);
		table.appendChild(row);
	}

}

