/*
 *  Keybind Framework
 *  version 0.41
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2006 
 *  http://code.google.com/p/keybind/
 *  
 *  Keybind is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/keybind/ for more details.
/*--------------------------------------------------------------------------*/

// global hash
var keybindings = {};

var isIE = navigator.appVersion.match(/\bMSIE\b/);
var isSafari = /Konqueror|Safari|KHTML/.test(navigator.userAgent);
var isWindows = /Windows/.test(navigator.userAgent);

// keybind([
//		{key: 'a', modifier: 'shift', fn: 'alert("a pressed!")', os: 'mac'},
//		{key: 'b', fn: 'alert("b pressed!")'},
//		{key: 'c', modifier: 'toggle', fn: 'alert("b pressed!")'},
//		{...}
// ]);

// 'key' and 'fn' are required
// 'modifier' options: ctrl, alt, cmd, shift, or toggle
//		toggle is equivalent to ctrl for mac and alt for pc
//		toggle overrides the 'os' option (if specified)
// 'os' options: 'mac' or 'pc'

function keybind(bindings) {
	var mod;
	bindings.each(function(binding) {
		// fn
		if (binding.fn == null) {
			alert ('one of the functions (fn) is not defined!');
			return;
		}
		else fn = binding.fn;
		
		// modifier
		mod = binding.modifier || '';
		if (mod == 'toggle') {
			if (isWindows) mod = 'alt';
			else mod = 'ctrl';
		}
		// os
		else {
			if (binding.os == 'mac') fn = 'if (!isWindows) {' + fn + '}';
			else if (binding.os == 'pc') fn = 'if (isWindows) {' + fn + '}';
		}

		// key
		if (binding.key == null) {
			alert ('one of the keys is not defined!');
			return;
		}
		else key = binding.key.toUpperCase();
		
		if (key == 'ENTER') key = 'RETURN';
		
		keybindings[key + '_' + mod] = fn;
	});
	
	var hashkey;
	Event.observe(document, 'keydown', function(e){
		var mod = '';
		if (e.ctrlKey) mod = 'ctrl';
		else if (e.altKey) mod = 'alt';
		else if (e.shiftKey) mod = 'shift';
		else if (e.metaKey) mod = 'cmd';
		
		keycode = e.keyCode;
		if (keycode == Event.KEY_RETURN || (mod == 'ctrl' && keycode == 77)) keycode = 'RETURN';	// firefox: '77' is equivalent to ctrl + enter
		else if (keycode == Event.KEY_DELETE) keycode = 'DELETE';
		else if (keycode == Event.KEY_UP) keycode = 'UP';
		else if (keycode == Event.KEY_DOWN) keycode = 'DOWN';
		else if (keycode == Event.KEY_LEFT) keycode = 'LEFT';
		else if (keycode == Event.KEY_RIGHT) keycode = 'RIGHT';
		// following are somewhat buggy in ff due to 'ctrl' key
		else if (keycode == 32 || (mod == 'ctrl' && keycode == 192)) keycode = ' ';
		else if (keycode == 188) keycode = ',';
		else if (keycode == 190) keycode = '.';
		else if (keycode == 191) keycode = '/';
		
		else keycode = String.fromCharCode(keycode);
		
		hashkey =  keycode + '_' + mod;
		//console.log(hashkey);
		var fn = keybindings[hashkey];
		if (fn)	eval(fn);
	});
}
