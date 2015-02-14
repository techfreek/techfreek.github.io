function loadRepos(uname, callback) {
	var url = "https://api.github.com/users/" + uname + "/repos";
	$.getJSON(url, callback);
}

function countLanguageUse(repos) {
	var langs = {
		JavaScript: {
			count: 2,
			value: 4
		},
		Arduino: {
			count: 1,
			value: 1
		}
	};
	//These two start preset because of hidden repos

	//console.log("Repos: " + JSON.stringify(repos));

	for(var i = 0; i < repos.length; i++) {
		if(typeof(langs[repos[i].language]) === 'undefined') {
			langs[repos[i].language] = {};
			langs[repos[i].language].count = 0;
			langs[repos[i].language].value = 0;
		}
		langs[repos[i].language].count += 1;

		langs[repos[i].language].value += Math.sqrt(repos[i].size) / 15;

		if(repos[i].language === "C++") {
			//I had a really old repo with all the debug files still in it. Hence the decrement
			langs[repos[i].language].value /= 10;
		}
	}
	return langs;
}

function addBars(languages) {
	var langs = document.getElementById('langs');
	var maxProjects = 20;
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
		var percent = ((languages[lang].value / maxProjects) * 100);

		innerGraph.innerHTML = languages[lang].count + ' project(s)';
		
		graph.setAttribute('aria-valuemin', 0);
		graph.setAttribute('aria-valuemax', maxProjects);
		graph.setAttribute('aria-valuenow', languages[lang].count);
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
	function convertAPIURI(uri) {
		return uri.replace('api.', '').replace('repos/', '');
	}

	function trimMSG(msg) {
		if(typeof(msg) === "undefined") {
			msg = "";
		} else if(msg.length > 50) {
				msg = msg.slice(0, 50) + '...';
		}
		return msg;
	}

	var table = document.getElementById('github-activity-body');

	for(var i = 0; i < 6 && i < activities.length; i++) {
		var activity = activities[i];
		var row = document.createElement('tr');
		var td = document.createElement('td');
		
		if(activity.type === "PushEvent") {
			var refs = activity.payload.ref.split('/');
			var url = convertAPIURI(activity.payload.commits[0].url);

			td.innerHTML = activity.actor.login +
				" pushed to " +
				refs[refs.length - 1] +
				" at " +
				activity.repo.name.link(url) +
				'<br>' +
				trimMSG(activity.payload.commits[0].message);
		} else if(activity.type === "IssueCommentEvent") {
			var issueComment = activity.repo.name + '#' + activity.payload.issue.number;
			var url = convertAPIURI(activity.payload.issue.html_url);

			td.innerHTML = activity.actor.login +
				" commented on issue " +
				issueComment.link(url) +
				'<br>' +
				trimMSG(activity.payload.comment.body);
		} else if(activity.type === "IssuesEvent") {
			var issueComment = activity.repo.name + '#' + activity.payload.issue.number;
			var url = convertAPIURI(activity.payload.issue.html_url);

			td.innerHTML = activity.actor.login +
				" opened issue " +
				issueComment.link(url) +
				'<br>' +
				activity.payload.issue.title;

		} else if(activity.type === "WatchEvent") {
			td.innerHTML = activity.actor.login +
				" starred " +
				activity.repo.name.link('http://github.com/' + activity.repo.name);
		} else if(activity.type === "CreateEvent") {
			var url = convertAPIURI(activity.repo.url);
			var name = activity.repo.name;
			var link = name.link(url);
			console.log("URL: " + url);
			console.log("repo: " + name);
			console.log("Link: " + link);

			td.innerHTML = activity.actor.login +
				" created repository " +
				link;
		} else if(activity.type === "PullRequestEvent") {
			var url = activity.payload.pull_request.html_url;
			var name = activity.repo.name + '#' + activity.payload.pull_request.number;

			td.innerHTML = activity.actor.login + 
				" merged pull request " +
				name.link(url) +
				'<br>' + 
				trimMSG(activity.payload.pull_request.body);
		}

		row.appendChild(td);
		table.appendChild(row);
	}

}

