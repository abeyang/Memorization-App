/*  Memorization
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2006
 *  version 0.78
 *  http://code.google.com/p/memorization/
 *
 *  Memorization is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/memorization/ for more details.
/*-------------------------------------------------------------------------------*/

var Memory = Class.create();
// this must be called AFTER page has been completely loaded
Memory.prototype = {	
	initialize: function() {
		this.version = '0.78';
		var startpage = 'home';

		// other vars
		this.numgroups = memory.groups.length;
		this.numcards = 0;		// will calculate this later

		this.controller 	= '';
		this.action			= {home: 'f', review: 'r1', quiz: 'n', stats: 'n'};
		this.cardname		= {n: '', r: ''};
		this.statcardname 	= '';
		this.scrollTop		= 0;	// scroll pos for 'review'
		
		this.visiblecards = [];
		this.visiblerandomcards = [];
		this.groups = {};
		this.statslookup = { enterstats: false, cardname: '' };
	
		// keybind functions
		keybind([
			{key: 'h', modifier: 'toggle', fn: 'm.render_controller("home")'},
			{key: 'r', modifier: 'toggle', fn: 'm.render_controller("review")'},
			{key: 'q', modifier: 'toggle', fn: 'm.render_controller("quiz")'},
			{key: 's', modifier: 'toggle', fn: 'm.render_controller("stats")'},
			{key: 'y', modifier: 'toggle', fn: 'm.toggleChecklist()'},
		
			{key: 'enter', modifier: 'toggle', fn: 'm.checkForm()'},
			{key: 'j', modifier: 'toggle', fn: 'm.prevCard()'},
			{key: 'k', modifier: 'toggle', fn: 'm.nextCard()'},
			{key: 'l', modifier: 'toggle', fn: 'm.randomCard()'},
			{key: 'f', modifier: 'toggle', fn: 'm.focus()'},
			{key: 'x', modifier: 'toggle', fn: 'm.erase()'}
		
		]);
		
		this.create();
		this.render_controller(startpage);
	},	// end initialize()
	
	create: function() {
		var g = memory.groups;
		var len = this.numgroups;
		var mod = len % 3;
		var size = Math.floor(len / 3);
		
		// checklist vars
		var table = '<div><table><tr>';	
		var checklist = '';
		var inner = '';
		var i = 1;
		
		// other vars
		var j = 0;

		var review = '';
		var quiz_n = '';
		var quiz_r = '';
		var stats = '';
		var stats_results = 'Average score out of <span id="stats_tries">0 tries</span>: <strong id="stats_avg" class="highlight">0%</strong>';

		var name = '';
		var concisename = '';
		var cardname = '';
		var cardcontent = '';
		var checked = '';
		var display = '';
		
		var groups = {};
		var cards = [];

		// cycle through groups
		g.each(function(group) {
			// logic for default checked boxes
			if (group.checked) {
				checked = ' checked="checked"';
				display = '';
			}
			else {
				checked = '';
				display = ' style="display:none;"';
			}
			
			// fill checklist string
			// TODO: currently, "concisename" is no different from just "name"
			name = group.group;
			concisename = name;
			inner = '<p id="c_' + concisename + '"><input id="' + concisename + '" name="' + concisename + '" type="checkbox" value="1" onclick="m.toggleGroup(\'' + concisename +'\');m.visibleCards();"' + checked + '"/> ' + name + '</p>';
			if (i > size) {
				if (mod > 0) {
					table += '<td>' + checklist + inner + '</td>';
					checklist = '';
					mod--;
					i = 1;
				}
				else {
					table += '<td>' + checklist + '</td>';
					checklist = inner;
					i = 2;
				}
			}
			else {
				checklist += inner;
				i++;
			}
			
			review += '<dl id="review_' + concisename + '"' + display + '>';
			quiz_n += '<div id="quiz_n_group_' + concisename + '"' + display + '>';
			quiz_r += '<div id="quiz_r_group_' + concisename + '"' + display + '>';
			stats += '<span id="stats_group_' + concisename + '"' + display + '>';
			
			cards = [];
			group.cards.each(function(card) {
				j++;
				cardname = card.card;
				cardcontent = card.content;
				
				// fill review string	
				review += '<dt><a href="javascript:;" onclick="m.toggleHighlight(this, \'' + cardname + '\');">' + cardname + '</a></dt>';
				review += '<dd id="content_'+ cardname +'">' + cardcontent + '</dd>';
				
				// fill quiz strings
				quiz_n += '<span id="quiz_n_card_' + cardname + '"><a href="javascript:;" onclick="m.highlight(\'' + cardname + '\');">' + cardname + '</a></span><br />';
				quiz_r += '<span id="quiz_r_card_' + cardname + '"><a href="javascript:;" onclick="m.highlight(\'' + cardname + '\');">' + cardcontent.truncate(30) + '</a></span><br />';
				
				// fill stats string
				// stats contain nodes for n, r, and c classes
				['n','r','c'].each(function(i) {
					stats += '<span id="stats_' + i + '_card_' + cardname + '" class="' + i + '">' + cardname + '</span> ';					
				});
				stats_results += '<dl id="stats_list_' + cardname + '" style="display:none;"></dl>';
				
				// fill cards array
				cards = cards.concat(card.card);
			}.bind(this));
			
			review += '</dl>'
			quiz_n += '</div>'
			quiz_r += '</div>'
			stats += '</span>'
			
			groups[concisename] = cards;
		}.bind(this));
		
		this.numcards = j;
		
		// fill checklist section
		if (checklist != '') table += '<td>' + checklist + '</td>';
		table += '</tr></table></div>';
		$('checklist').innerHTML = table;
		
		// fill review section
		//$('review_content').innerHTML = review;
		new Insertion.Bottom('review_content', review);
		
		// fill quiz sections
		$('quiz_n_sidebar').innerHTML = quiz_n;
		$('quiz_r_sidebar').innerHTML = quiz_r;
		$('quiz_r_hint_sidebar').innerHTML = $('quiz_n_hint_sidebar').innerHTML
		
		// fill stats section
		$('stats_cards').innerHTML = stats;
		$('stats_results').innerHTML = stats_results;
		
		// show default controller section
		if (len > 0) {
			$('preload').hide();
			//$(this.controller + '_content').show();
		}
		
		// fill groups hash and set visible cards array
		this.groups = groups;
		this.visibleCards();
		
		// clear textarea / set default values
		$('textarea').value = '';
		$('textinput').value = '';
		$('quiz_r_header').value = 'Please select a passage.';
		$('quiz_n_header').value = 'Please select a reference.';
		
		// version number
		$('version').innerHTML = 'v. <a href="changelog.html" target="_new">' + this.version + '</a>';
		
	},	// end create()

	toggleGroup: function(name) {
		var display = ($(name).checked) ? '' : 'none';
		$('review_' + name).style.display = display;
		$('quiz_n_group_' + name).style.display = display;
		$('quiz_r_group_' + name).style.display = display;
		$('stats_group_' + name).style.display = display;
	},	// end toggleGroup()
	
	// 'checked' is either true or false
	toggleAllGroups: function(checked) {
		var inputs = $A($('checklist').getElementsByTagName('input'));
		inputs.each(function(input) {
			input.checked = checked;
			this.toggleGroup(input.id);
		}.bind(this));
	},	// end toggleAllGroups()
	
	visibleCards: function() {
		this.visiblecards.clear();
		var i = 0;
		var arr = $('checklist').getElementsByTagName('input');
		$A(arr).each(function(input) {
			if (input.checked) {
				this.visiblecards = this.visiblecards.concat(this.groups[input.id]);
			}
		}.bind(this));
		
		// update random cards
		this.visiblerandomcards = this.visiblecards.randomize();
	},	// end visibleCards()
	
	/* REVIEW */
	
	toggleHighlight: function(node, name) {
		var cardnode = $('content_' + name);
		if (cardnode.hasClassName('highlight')) {
			// already highlighted: turn off
			$(node).removeClassName('highlight');
			cardnode.removeClassName('highlight');
		}
		else {
			// turn on highlight
			$(node).addClassName('highlight');
			cardnode.addClassName('highlight');
		}
		
		this.focus();
	},
	
	/* QUIZ */
	
	// name: specific card name to select
	highlight: function(name) {
		var prefix = this.prefix();
		var a = this.action.quiz;

		if (this.cardname[a]) $(prefix + 'card_' + this.cardname[a]).removeClassName('highlight');
		$(prefix + 'card_' + name).addClassName('highlight');
		$(prefix + 'header').value = (a == 'n') ? name : $('content_' + name).innerHTML;

		var input = this.input();
		input.value = '';
		input.focus();
		this.erase();
		this.cardname[a] = name;
	},	// end highlight()
	
	// n: find n positions after/before current card (this.cardname[a])
	// cards: either 'visiblecards' or 'visiblerandomcards'
	highlightAt: function(n, type) {
		var a = this.action.quiz;
		cards = eval('this.' + type);
		// error checks
		if (!cards || !cards.length) return;

		var len = cards.length;
		var i = 0;
		function findCard() {
			if (n > 0) i = n - 1;
			else i = n + len;
		}
		// nothing selected
		if (this.cardname[a] == '') {
			findCard();
			name = cards[i];
		}
		else {
			// search for currentname in visiblecards array
			i = cards.indexOf(this.cardname[a]);
			if (i < 0) {
				// card not found
				findCard();
				name = cards[i];	
			}
			else {
				i += n;		// update index
				// adjust for out of bounds
				if (i >= len) i = i % len;
				else if (i < 0) i += len;
				// find name
				name = cards[i];
			}
		}
		// found wanted name; now highlight it
		this.highlight(name);
		// show/hide logic
		this.toggleSidebar(type == 'visiblecards');
	},	// end highlightAt()
	
	prevCard: function() {
		this.highlightAt(-1, "visiblecards");
	},
	nextCard: function() {
		this.highlightAt(1, "visiblecards");
	},
	randomCard: function() {
		this.highlightAt(1, "visiblerandomcards");
	},

	toggleSidebar: function(showcards) {
		var prefix = this.prefix();
		if (showcards) {
			$(prefix + 'sidebar').show();
			$(prefix + 'hint_sidebar').hide();
		}
		else {
			$(prefix + 'sidebar').hide();
			$(prefix + 'hint_sidebar').show();
		}
	},	// end toggleSidebar()
	
	/* CONTROLLER / ACTION */
	
	render_controller: function(controller) {
		// check current controller and previous controller
		// change classes/elements accordingly
		if (controller != this.controller) {
			// update $body's class
			$('body').addClassName(controller);
			$('body').removeClassName(this.controller);
			
			// update visible/invisible elements
			if ($(this.controller + '_content')) {
				// review: must remember scroll position upon leaving
				if (this.controller == 'review') {
					// strict mode for ie6: use document.documentElement.scrollTop:
					// http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
					this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
/*					console.log('remember: ' + this.scrollTop);*/
				}
				
				// hide previous element(s)
				$(this.controller + '_content').hide();
				$(this.controller + '_subnav').hide();
			}

			// show current element(s)
			$(controller + '_content').show();
			$(controller + '_subnav').show();
			
			// review: set scroll position upon entering
			if (controller == 'review') {
				window.scrollTo(0, this.scrollTop);
/*				console.log('set: ' + this.scrollTop);*/
			}
			// hack for safari:
			else if (isSafari) window.scrollTo(0, 0);
						
			// update this controller
			this.controller = controller;
		}
		this.focus();
	},	// end render_controller()
	
	// prerequisite: function called when already viewing in the desired controller
	render_action: function(action) {
		var c = this.controller;
		var a = this.action[c];		// previous action

		this.action[c] = action;	// update action
			
		if (a != action) {
			// update subnav
			$(c + '_' + action + '_subnav').addClassName('active');
			$(c + '_' + a + '_subnav').removeClassName('active');
			
			// review
			if (c == 'review') {
				$('review_content').addClassName(action);
				$('review_content').removeClassName(a);
			}
			
			// everything else
			else {
				// special case for stats
				if (c == 'stats') this.updateViewableStats(this.statslookup.cardname);
				// update content
				$(c + '_content').addClassName('action_' + action);
				$(c + '_content').removeClassName('action_' + a);
			}
			
		}
		this.focus();
	},	// end render_action()
	
	toggleChecklist: function() {
		// currently hidden: show!
		if ($('checklist').style.display == 'none') $('checklist').show();
		// currently shown: hide!
		else $('checklist').hide();
	},	//end toggleChecklist()
	
	/* STATS */
	
	// stats calculation given a result (of inserts and deletes)
	calculateStats: function(correct_length) {
		// note: quiz (not stats) action is being taken into account:
		var a = this.action.quiz;
	
		var name = this.cardname[a];
		if (!this.statslookup[name]) {
			// first time testing for this particular card:
			this.statslookup[name] = {n: {average: 0, tries: 0}, r: {average: 0, tries: 0} };
		}
		if (!this.statslookup[name][a].tries) {
			// turn stat cardname into link
			$('stats_' + a + '_card_' + name).linkify(name, "m.toggleStats('" + name + "')");				
			if (!this.statslookup[name]['c']) {
				this.statslookup[name]['c'] = {average: 0, tries: 0};
				$('stats_c_card_' + name).linkify(name, "m.toggleStats('" + name + "')");				
			}
		}
		
		// set local vars
		var err = 0;
		var result = $('quiz_' + a + '_result');
		var ins = $A(result.getElementsByTagName('ins'));
		var del = $A(result.getElementsByTagName('del'));
		
		ins.each(function(str) { str.innerHTML.scan(/\w+/, function(match) {err++;}); });
		del.each(function(str) { str.innerHTML.scan(/\w+/, function(match) {err++;}); });

		var correct = (err > correct_length) ? 0 : (correct_length - err) / correct_length;		// 0.xyz

		var stat = this.statslookup[name][a];
		var newavg = correct.toAverage(stat);
		var stat_all = this.statslookup[name]['c'];
		var newavg_all = correct.toAverage(stat_all);
				
		this.statslookup[name][a].tries = ++stat.tries;
		this.statslookup[name][a].average = newavg;
		this.statslookup[name]['c'].tries = ++stat_all.tries;
		this.statslookup[name]['c'].average = newavg_all;

		// update links
		$('stats_' + a + '_card_' + name).setStatStyle(newavg);
		// TODO: incorrect!
		$('stats_c_card_' + name).setStatStyle(newavg_all);
		
		// update result html
		if (name == this.statslookup.cardname) this.updateViewableStats(name);
		
		var d = new Date;
		new Insertion.Top('stats_list_' + name, '<dt class="' + a + '">' + correct.toPercent() + '<div class="normalStyle microFont">' + d.formatDate() + ' ' + d.formatTime() + '</div></dt><dd class="' + a + '">' + result.innerHTML + '</dd>');
				
	},	//end calculateStats()
	
	toggleStats: function (card) {
		var name = this.statslookup.cardname;
		if (name) {
			$('stats_list_' + name).hide();
			['n','r','c'].each(function(i) {
				$('stats_' + i + '_card_' + name).removeClassName('active');
			});
		}
		else $('stats_results').show();		// on init, this is hidden
		
		this.updateViewableStats(card);
		this.statslookup.cardname = card;

		['n','r','c'].each(function(i) {
			$('stats_' + i + '_card_' + card).addClassName('active');			
		});
		
		this.focus();
	},	// end toggleStats()
	
	updateViewableStats: function (card) {
		if (!card) return;			// this case can happen from the get-go: choosing an action without choosing a stat card
		var a = this.action.stats;
		var tries 	= this.statslookup[card][a].tries;
		var avg 	= (this.statslookup[card][a].average).toPercent();
		
		if (tries == 0) avg = 'n/a'
		else if (tries == 1) tries += ' try';
		else tries += ' tries';
		$('stats_tries').innerHTML = tries;
		$('stats_avg').innerHTML = avg;
		$('stats_list_' + card).show();
	},	// end updateViewableStats()
	
	/* FORM */
	
	checkForm: function() {
		var a = this.action.quiz;
		var prefix = this.prefix();
		var input = m.input();
		var text = input.value;
		if ($('content_' + this.cardname[a]) == null) {
			$(prefix + 'result').innerHTML = "<em>Please select an item first...</em>";
			return;
		}
		
		m.statslookup['enterstats'] = false;
		
		// TODO: the following code is not very efficient in handling the 'action'
		var card = $('content_' + this.cardname[a]).innerHTML;

		// checks for '...' (only works in the 'passage' action)
		if ((text.split("...").length > 1) && (a == 'n')) {
			// first, split by '...', 
			var newtext = text.split("...")[0];
			if (newtext.length > card.length) {
				diffWords(newtext, card);
				return;
			}
			// second, split by spaces: check for number of words
			var len = newtext.split(' ').length;
			var newcard = '';
			var arr = card.split(' ');
			for (var i=0; i<len; i++) {
				newcard += arr[i] + ' ';
			}
			diffWords(newtext, newcard);
		}
		else {
			m.statslookup['enterstats'] = true;
			var rightanswer = (a == 'n') ? card : this.cardname[a];
			diffWords(text, rightanswer);
		}
	},	// end checkForm()
	
	focus: function() {
		var input = this.input();
		if (input) input.focus();
		else if (!isIE) $('dummy').focus();		// dummy focus
	},
	
	erase: function() {
		if (this.controller == 'quiz') {
			var prefix = 'quiz_' + this.action.quiz + '_';
			$(prefix + 'result').innerHTML = '';
			$(prefix + 'clear').innerHTML = 'clear comparison';		
		}
	},
	
	prefix: function() {
		var c = this.controller;
		var a = this.action[c];
		var prefix = c + '_';
		if (a) prefix += a + '_';
		return prefix;
	},
	
	// returns input element or null
	input: function() {
		var input = '';
		if (this.controller == 'quiz') {
			input = (this.action.quiz == 'n') ? $('textarea') : $('textinput');
		}
		return input;
	}
	
};	// end Memory

/* HELPERS */

Array.prototype.randomize = function(){ //v1.0
	var o = [].concat(this);		// want to create a new, separate instance of an array
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

String.prototype.format = function() {
	// convert more than one whitespace to just one space
	return this.gsub(/\s+/, ' ');
};

// Number
Object.extend(Number.prototype, {
	toPercent: function() {
		return Math.round(this * 100) + '%';
	},
	
	toAverage: function(statobj) {
		return ((statobj.average * statobj.tries) + this) / (statobj.tries + 1);
	}
});

// Element
Element.addMethods({
	linkify: function(element, name, fn_string) {
		$(element).innerHTML = '<a href="javascript:;" onclick="' + fn_string + '">' + name + '</a>';
	},

	setStatStyle: function(element, avg) {
		var fontsize = opacity = '';
		if (avg > .98) {
			fontsize = '9px';
			opacity = .5;
		}
		else if (avg > .95) {
			fontsize = '11px';
			opacity = .6;
		}
		else if (avg > .9) {
			fontsize = '14px';
			opacity = .7;
		}
		else if (avg > .8) {
			fontsize = '18px';
			opacity = .8;
		}
		else if (avg > .7) {
			fontsize = '24px';
			opacity = .9;
		}
		else {
			fontsize = '36px';
			opacity = 1;
		}
		$(element).setStyle({'font-size':fontsize, 'opacity':opacity, 'filter': 'alpha(opacity=' + (opacity * 100) + ')'});
	},
	
	toggleAndScroll: function(element) {
		$(element).toggle();
		if ($(element).visible()) $(element).scrollTo();
	}
});

// Date
Object.extend(Date.prototype, {
	formatDate: function() { 
		var m = this.getMonth() + 1;
		return m + '/' + this.getDate();
	},
	
	formatTime: function() { 
		var h = this.getHours();
		var m = this.getMinutes();

		if (h < 10) h = '0' + h;
		if (m < 10) m = '0' + m;
		return h + ':' + m;
	}
});

// Browser detection
var isIE = navigator.appVersion.match(/\bMSIE\b/);
var isSafari = /Konqueror|Safari|KHTML/.test(navigator.userAgent);

// XinDiff

function doDiff(left, right) {
	diff = new DiffEngine();
	diff.assign(left.words, 1);
	diff.assign(right.words, 0);

	output = new DiffOutput();
	output.diff = diff;
	output.symbols = [right.symbols, left.symbols];
	diff.doDiff().serialize(diff, output);
	
	// result
	var result = output.getHTML();
	var prefix = m.prefix();
	$(prefix + 'result').innerHTML = result;
	$(prefix + 'clear').linkify('clear comparison', 'm.erase();');
	
	if (m['statslookup'].enterstats) m.calculateStats(right.words.length);
};

function isLiteral(ch) {
    return ((ch <= 'z') && (ch >= 'a')) || ((ch <= 'Z') && (ch >= 'A')) ||
        ((ch <= '9') && (ch >= '0')) || (ch == '_') || (ch == '-') || (ch == '+');
};

function splitWords(text) {
    var words = [];
    var symbols = {};
    var length = text.length;
    var word = '';
    var symbol = '';
    for (var i = 0; i < length; ++i) {
        if (text.charCodeAt(i) >= 256) {
            if (word != '') {
                words.push(word);
                word = '';
            }
            else if (symbol != '') {
                symbols[words.length] = symbol;
                symbol = '';
            }
            words.push(text.charAt(i));
        }
        else {
            var ch = text.charAt(i);
            if (isLiteral(ch)) {
                if (symbol != '') {
                    symbols[words.length] = symbol;
                    symbol = '';
                }
                word += ch;
            }
            else {
                if (word != '') {
                    words.push(word);
                    word = '';
                }
                symbol += ch;
            }
        }
    }
    if (word != '') {
        words.push(word);
    }
    else if (symbol != '') {
        symbols[words.length] = symbol;
    }
    return {'words': words, 'symbols': symbols};
};

function diffWords(usertext, passage) {
    doDiff(splitWords(usertext.format()), splitWords(passage.format()));
};

