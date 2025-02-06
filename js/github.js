var maxProjects = 0;
var maxActivity = 7;
var maxLanguages = 9;

function loadRepos(uname, callback) {
	var url = "https://api.github.com/users/" + uname + "/repos";
	$.getJSON(url, callback);
}

function countLanguageUse(repos) {
	var langs = {
		JavaScript: {
			count: 2
		},
		Arduino: {
			count: 1,
		}
	};

	for(var i = 0; i < repos.length; i++) {
		if(typeof(langs[repos[i].language]) === 'undefined') {
			langs[repos[i].language] = {};
			langs[repos[i].language].count = 0;
		}

		langs[repos[i].language].count += 1;

		if(langs[repos[i].language].count > maxProjects) {
			maxProjects = langs[repos[i].language].count;
		}
	}
	return langs;
}

function calculatePercent(langs) {
	function filterNullLangs(language) {
		return language.lang !== "null";
	}

	var objs = Object.keys(langs);
	var temp = [];
	for(var i = 0; i < objs.length; i++) {
		langs[objs[i]].percent = ((langs[objs[i]].count / maxProjects) * 100);
		langs[objs[i]].lang = objs[i];
		temp.push(langs[objs[i]]);
	}

	temp = temp.filter(filterNullLangs);

	temp.sort(function(lang1, lang2) {
		return lang1.count < lang2.count;
	});

	temp = temp.slice(0, maxLanguages);
	return temp;

}

function formatLanguageLink(uname, language) {
	var languageLink = "https://github.com/search?q=user%3A";
	languageLink += `${uname}+language%3A${encodeURIComponent(language)}`;
	languageLink += "&type=repositories";
	return languageLink
}

function addBars(username, languages) {
	languages = calculatePercent(languages);
	var langs = document.getElementById('langs');
	var languageLink = "https://github.com/search?q=user%3A" +
		username +"+language%3A";

	languages.forEach(function(lang) {
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
		language.innerHTML = lang.lang.link(formatLanguageLink(username, lang.lang));

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

function addActivity(username, activities) {
	var table = document.getElementById('github-activity-body');
	var activity = null;
	var row = null;
	var td = null;
	var body = null;

	for(var i = 0; i < maxActivity && i < activities.length; i++) {
		activity = activities[i];
		console.log(activity);

		body = gitActivityBody(activity);

		if(body) {
			row = document.createElement('tr');
			td = document.createElement('td');

			td.innerHTML = body.actor + body.action;

			if(body.link) {
				td.innerHTML += body.target.link(body.link) + '<br>';
			} else {
				td.innerHTML += body.target + '<br>';
			}

			if(body.message) {
				td.innerHTML += body.message;
			}

			row.appendChild(td);
			table.appendChild(row);
		}
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

	try {
		switch(activity.type) {
			case "CommitCommentEvent":
				data.action = "commented on commit";
				data.link = 'http://github.com/' + ( typeof(activity.payload.repository) === "undefined") ?
						activity.repo.name :
						activity.payload.repository.full_name;
				data.target = data.link;
				data.message = trimHash(activity.payload.comment.commit_id).link(activity.payload.comment.html_url) + ' ' +
					 activity.payload.comment.body;
				break;

			case "CreateEvent":
				if(activity.payload.ref_type === 'branch') {
					data.action = "created branch \"" + activity.payload.ref + "\"";
				} else if(activity.payload.ref_type === 'repository') {
					data.action = "created repository";
				} else {
					data.activity = "created something";
				}

				data.target = activity.repo.name;
				data.link = activity.repo.url;
				break;

			case "DeleteEvent":
				data.action = "deleted " + activity.payload.ref_type + " \"" + activity.payload.ref + "\" from";
				data.target = activity.repo.name;
				data.link = convertAPIURI(activity.repo.url);
				break;

			case "ForkEvent":
				data.action = "forked";
				data.target = activity.repo.name;
				data.link = convertAPIURI(activity.repo.url);
				break;

			case "GollumEvent":
				data.action = "updated " + activity.payload.repository.full_name + " wiki page";
				data.target = activity.payload.pages[0].page_name;
				data.link = activity.payload.pages[0].html_url;
				break;

			case "IssueCommentEvent":
				var comment = activity.repo.name + "#" + activity.payload.issue.number;
				data.link = activity.payload.issue.html_url;
				data.action = "commented on issue";
				data.target = comment;
				data.message = activity.payload.comment.body;
				break;

			case "IssuesEvent":
				var issue = activity.repo.name + "#" + activity.payload.issue.number;
				data.action = "opened issue";
				data.target = issue;
				data.link = activity.payload.issue.html_url;
				data.message = activity.payload.issue.title;
				break;

			case "MemberEvent":
				data.action = activity.payload.action + " to";
				data.target = activity.repository.full_name;
				data.link = activity.repository.html_url;
				break;

			case "PublicEvent":
				data.action = "open sourced";
				data.target = activity.repo.name;
				data.link = convertAPIURI(activity.repo.url);
				break;

			case "PullRequestEvent":
				data.action = activity.payload.action + " pull request";
				data.target = activity.repo.name + '#' + activity.payload.pull_request.number;
				data.link = activity.payload.pull_request.html_url;
				data.message = activity.payload.pull_request.body;
				break;

			case "PullRequestReviewCommentEvent":
				data.action = "commented on pull request"
				data.target = activity.repo.name + '#' +
					activity.payload.pull_request.number;
				data.link = activity.payload.comment.html_url;

				data.message = activity.payload.comment.body;
				break;

			case "PushEvent":
				var refs = activity.payload.ref.split('/');
				data.action = "pushed to " + refs[refs.length - 1] + " at ";
				data.link = activity.payload.commits[0].url;
				data.target = activity.repo.name;
				data.message = activity.payload.commits[0].message;
				break;

			case "ReleaseEvent":
				data.action = activity.payload.action + " " + activity.payload.release.tag_name + " of";
				data.link = activity.payload.release.html_url;
				data.target = activity.repo.name;

				data.message = activity.payload.release.body;
				break;

			case "WatchEvent":
				data.action = "starred";
				data.link = 'http://github.com/' + activity.repo.name;
				data.target = activity.repo.name;
				break;

			default:
				data.action = "did something relating to " + activity.type;
				break;
		}

		if (!data.action) {
			return null;
		}

		//apply at the end so you I don't have to do in each activity type
		data.action = " " + data.action + " ";
		if(data.link) {
			data.link = convertAPIURI(data.link);
		}
		data.message = trimMSG(data.message);
	} catch(err) {
		console.log(activity);
		console.log(data);
		console.log(err);
		data = null;
	}

	return data;
}
