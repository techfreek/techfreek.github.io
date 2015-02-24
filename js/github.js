var maxProjects = 25;

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

		langs[repos[i].language].value += Math.sqrt(repos[i].size) / 10;

		if(repos[i].language === "C++") {
			//I had a really old repo with all the debug files still in it. Hence the decrement
			langs[repos[i].language].value /= 10;
		} else if(repos[i].language === "JavaScript") {
			//These repos usually have a lot of images
			langs[repos[i].language].value /= 1.1;
		}

		if(langs[repos[i].language].value > maxProjects) {
			maxProjects = langs[repos[i].language].value;
		}
	}
	return langs;
}

function calculatePercent(langs) {
	var objs = Object.keys(langs);
	var temp = [];
	for(var i = 0; i < objs.length; i++) {
		langs[objs[i]].percent = ((langs[objs[i]].value / maxProjects) * 100);
		langs[objs[i]].lang = objs[i];
		temp.push(langs[objs[i]]);
	}

	console.log("typeof langs: " + JSON.stringify);

	//It's hard to sort JSON, so this is an intermediate step
	temp.sort(function(lang1, lang2) {
		return lang1.percent < lang2.percent;
	});
	return temp;

}

function addBars(languages) {
	languages = calculatePercent(languages);
	var langs = document.getElementById('langs');
	//var objs = Object.keys(languages);

	languages.forEach(function(lang) {
		if(lang.lang === "null") {
			return;
		}

		console.log("lang: " + JSON.stringify(lang));

		var row = document.createElement('div');
		var language = document.createElement('div');
		var wrapper = document.createElement('div');
		var graph = document.createElement('div');
		var innerGraph = document.createElement('span');
		innerGraph.innerHTML = lang.count + ' project(s)';
		
		graph.setAttribute('aria-valuemin', 0);
		graph.setAttribute('aria-valuemax', maxProjects);
		graph.setAttribute('aria-valuenow', lang.count);
		graph.setAttribute('role', 'progressbar')
		graph.style.width = lang.percent + '%'; 

		graph.className = "col-9 progress-bar";

		wrapper.className = "progress";

		language.className = "col-3";
		language.innerHTML = lang.lang;

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

	for(var i = 0; i < 6 && i < activities.length; i++) {
		var activity = activities[i];
		var row = document.createElement('tr');
		var td = document.createElement('td');

		var body = gitActivityBody(activity);

		td.innerHTML = body.actor +
			body.action + body.target.link(body.link) + '<br>';
		if(body.message) {
			td.innerHTML += body.message;
		}
		
		row.appendChild(td);
		table.appendChild(row);
	}

}

function gitActivityBody(activity) {
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

	function trimHash(hash) {
		return hash.slice(0, 7);
	}

	var data = {
		actor: activity.actor.login,
		message: '',
		action: '',
		target: '',
		link: ''
	}

	if(activity.type === "CommitCommentEvent") {
		data.action = "commented on commit";
		data.link = 'http://github.com/' + activity.payload.repository.full_name;
		data.target = activity.payload.repository.full_name
		data.message = trimHash(activity.payload.comment.commit_id).link(activity.payload.comment.html_url) + ' ' +
			 activity.payload.comment.body;

	} else if(activity.type === "CreateEvent") {
		data.link = activity.repo.url;
		data.target = activity.repo.name;
		data.action = "created repository";

	} else if(activity.type === "DeleteEvent") {
		data.action = "deleted " + action.payload.ref_type + " from";
		data.target = activity.repository.full_name;
		data.link = activity.repository.html_url;

	} else if(activity.type === "ForkEvent") {
		data.action = "forked";
		data.target = action.payload.forkee.full_name;
		data.link = action.payload.forkee.html_url;

	} else if(activity.type === "GollumEvent") {
		data.action = "updated " + action.payload.repository.full_name 
			+ " wiki page";
		data.target = action.payload.pages[0].page_name;
		data.link = action.payload.pages[0].html_url;
	} else if(activity.type === "IssueCommentEvent") {
		var comment = activity.repo.name + "#" + activity.payload.issue.number;
		
		data.link = activity.payload.issue.html_url;
		data.action = "commented on issue";
		data.target = comment;
		data.message = activity.payload.comment.body;

	} else if(activity.type === "IssuesEvent") {
		var issue = activity.repo.name + "#" + activity.payload.issue.number;

		data.action = "opened issue";
		data.target = issue;
		data.link = activity.payload.issue.html_url;
		data.message = activity.payload.issue.title;

	} else if(activity.type === "MemberEvent") {
		data.action = action.payload.action + " to";
		data.target = action.repository.full_name;
		data.link = action.repository.html_url;

	} else if(activity.type === "PublicEvent") {
		data.action = "open sourced";
		data.target = activity.payload.repository.full_name;
		data.link = activity.payload.repository.html_url;
	
	} else if(activity.type === "PullRequestEvent") {
		data.action = " merged pull request ";
		data.target = activity.repo.name + '#' + activity.payload.pull_request.number;
		data.link = activity.payload.pull_request.html_url;
		data.message = activity.payload.pull_request.body;

	} else if(activity.type === "PullRequestReviewCommentEvent") {
		data.action = "commented on pull request"
		data.target = activity.payload.repo.full_name + '#' + 
			activity.payload.pull_request.number;
		data.link = activity.payload.comment.html_url;

		data.message = activity.payload.comment.body;

	} else if(activity.type === "PushEvent") {
		var refs = activity.payload.ref.split('/'); 
		data.action = "pushed to" + refs[refs.length - 1] + " at ";
		data.link = activity.payload.commits[0].url;
		data.target = activity.repo.name;
		data.message = activity.payload.commits[0].message;

	} else if(activity.type === "ReleaseEvent") {
		data.action = action.payload.action + " " + action.payload.release.tag_name +
			" of";
		data.link = action.payload.release.html_url;
		data.target = action.payload.repository.full_name;

	} else if(activity.type === "WatchEvent") {
		data.action = "starred";
		data.link = 'http://github.com/' + activity.repo.name;
		data.target = activity.repo.name;
	}

	//apply at the end so you I don't have to do in each activity type
	data.action = " " + data.action + " ";
	data.link = convertAPIURI(data.link);
	data.message = trimMSG(data.message);

	return data;
}