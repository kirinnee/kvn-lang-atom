'use strict';
var json = require('./methods.json');

function jjson() {
	var char = joinJson(json.char);
	var bg = joinJson(json.bg);
	char = breakUpAcceptedValue(char);
	bg = breakUpAcceptedValue(bg);
	return {
		char: char,
		bg: bg
	};
}

function breakUpAcceptedValue(char) {
	var nc = {};
	for (var x in char) {
		var method = char[x];
		var argArr = [];
		for (var argIndex in method.arg) {
			var arg = method.arg[argIndex];
			var accepted = arg.accepted;
			var nacc = {};
			for (var a in accepted) {
				var k = a.split('/')
					.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
					.map(d => d.trim());
				var val = accepted[a];
				for(var key in k){
					var akey = k[key];
					nacc[akey] = val;
				}
			}
			arg.accepted = nacc;
			argArr.push(arg);
		}
		method.arg = argArr;
		nc[x] = method;
	}
	return nc;

}

function joinArg(char) {
	var nchar = {};
	for (var x in char) {
		var method = char[x];
		var args = method.arg;
		var nargs = [];
		for (var a in args) {
			var arg = args[a];
			for (var i in arg.alias) {
				var name = arg.alias[i]
				var na = {
					name: name,
					alias: arg.alias,
					type: arg.type,
					desc: arg.desc,
					accepted: arg.accepted
				}
				nargs.push(na);
			}
		}
		method.arg = nargs;
		nchar[method.name] = method;
	}
	return nchar;
}

function joinJson(char) {
	var nchar = {};
	for (var x in char) {
		var co = char[x];
		var no = {
			name: co.name,
			code: co.code,
			single: co.single,
			type: co.type,
			desc: co.desc,
			arg: co.arg
		}
		for (var i in co.alias) {
			var k = co.alias[i];
			nchar[k] = no;
		}
	}
	return nchar;
}
var jointJSON = jjson();
console.log(jointJSON);
module.exports = {
	// This will work on JavaScript and CoffeeScript files, but not in js comments.
	selector: '.source.kvn',
	disableForSelector: '.source.kvn .comment',
	// This will take priority over the default provider, which has an inclusionPriority of 0.
	// `excludeLowerPriority` will suppress any providers with a lower priority
	// i.e. The default provider will be suppressed
	inclusionPriority: 1,
	excludeLowerPriority: true,
	// This will be suggested before the default provider, which has a suggestionPriority of 1.
	suggestionPriority: 2,
	// Let autocomplete+ filter and sort the suggestions you provide.
	filterSuggestions: true,
	// Required: Return a promise, an array of suggestions, or null.
	getSuggestions({
		editor,
		bufferPosition,
		scopeDescriptor,
		prefix,
		activatedManually
	}) {
		var argData = this.getArgIndex(bufferPosition, editor, prefix);
		var argIndex = argData[0];
		var space = argData[1] > 0;
		var args = argData[2];
		var pfx = argData[3];
		if (argIndex === 0 || (args[0] !== "let" && args[0] !== "mod")) {
			if (!space) {
				switch (argIndex) {
					case 0:
						return this.genResp(
							[this.genSuggestion('frame', 'Creating new Frame', 'keyword'), this.genSuggestion('scene', 'Creating new Scene', 'keyword'), this.genSuggestion('macro', 'Write a macro', 'keyword'), this.genSuggestion('declare', 'Declare a game object', 'keyword'), this.genSuggestion('let', 'Initialize a variable', 'keyword'), this.genSuggestion('mod', 'Modify a variable', 'keyword')]);
					case 1:
						return this.genResp([]);
					case 2:
						switch (args[0]) {
							case "dec":
							case "declare":
								return this.genResp(
									[this.genSuggestion('as', '', 'keyword')]
								)
							case "let":
								return this.genResp(
									[this.genSuggestion('be', '', 'keyword')]
								)
							default:
								return this.genResp([]);
						}
					case 3:
						if (args[0] === "dec" || args[0] === "declare") {
							return this.genResp(
								[this.genSuggestion('character', 'Declare as character', 'type'), this.genSuggestion('stage', 'Declare as stage', 'type')])
						} else {
							return this.genResp([]);
						}
					case 4:
						if (args[0] === 'let') {
							return this.genResp(
								[this.genSuggestion('as', '', 'keyword')]
							)
						} else {
							return this.genResp([]);
						}
					case 5:
						if (args[0] === 'let') {
							return this.genResp(
								[this.genSuggestion('string', 'Initialize as string', 'type'), this.genSuggestion('number', 'Initialize as number', 'type'), this.genSuggestion('boolean', 'Initialize as boolean', 'type'), this.genSuggestion('object', 'Initialize as object', 'type'), this.genSuggestion('array', 'Initialize as array', 'type')]
							)
						} else {
							return this.genResp([]);
						}
					default:
						return this.genResp([]);
				}
			} else {
				var o = this.getGameObjects(editor);
				switch (argIndex) {
					case 0:
						var ret = [this.genSuggestion('let', 'Initialize a variable', 'keyword'), this.genSuggestion('mod', 'Modify a variable', 'keyword')];
						for (var x in o) {
							ret.push(this.genSuggestion(x, '', o[x]));
						}
						return this.genResp(ret);
					case 1:
						var isit = this.isGameObj(args[0], o);
						//console.log(isit);
						if (isit !== false) {
							//console.log(isit === "character");
							if (isit === "character") {
								var ret = [];
								for (var i in jointJSON['char']) {
									var method = jointJSON['char'][i];
									ret.push(this.genSuggestion(i, method.desc, method.type));
								}
								return this.genResp(ret);
							} else if (isit === "stage") {
								var ret = [];
								for (var i in jointJSON['bg']) {
									var method = jointJSON['bg'][i];
									ret.push(this.genSuggestion(i, method.desc, method.type));
								}
								return this.genResp(ret);
							} else {
								return this.genResp([]);
							}
						}
						return this.genResp([]);
					default:
						var isit = this.isGameObj(args[0], o);
						//console.log(isit);
						if (isit !== false) {
							//console.log(isit === "character");
							if (isit === "character" || isit === "stage") {
								var isAfterEqual = false;
								var alrChoose = false;
								if (pfx.trim() === "") {
									var w = args[argIndex - 1];
									var c = w.charAt(w.length - 1);
									if (c === '=') {
										isAfterEqual = true;
									}
								} else {
									var c = pfx.charAt(pfx.length - 1);
									if (c === '=') {
										isAfterEqual = true;
									}
									if (pfx.split('=').filter(d => d !== null && typeof d === "string" && d.trim() !== "")
										.map(d => d.trim()).length === 2) {
										isAfterEqual = true;
										alrChoose = true;
									}
								}
								if (isAfterEqual) {
									if (alrChoose) {
										return this.genResp([]);
									}
									var m;
									if (pfx.trim() === "") {
										var w = args[argIndex - 1];
										if (w.trim() === '=') {
											m = args[argIndex - 2];
										} else {
											var s = args[argIndex - 1];
											m = s.substr(0, s.length - 1);
										}
									} else {
										if (pfx.trim() === '=') {
											m = args[argIndex - 1];
										} else {
											m = pfx.substr(0, pfx.length - 1);
										}
									}
									var methodKey = args[1];
									var method = isit === "character" ? jointJSON['char'][methodKey] : jointJSON['bg'][methodKey];
									if (typeof method !== "undefined" && method !== null) {
										var argus = method.arg;
										for (var i in argus) {
											arg = argus[i];
											for (var ii in arg.alias) {
												var ali = arg.alias[ii];
												if (m === ali) {
													var ret = [];
													var accepted = arg.accepted;
													for (var ii2 in accepted) {
														var des = accepted[ii2];
														ret.push(this.genSuggestion(ii2, des, 'suggestion'));
													}
													return this.genResp(ret);
												}
											}
										}
										return this.genResp([]);
									}
								} else {
									//obtain used arguments
									var keys = args.join(' ')
										.split('=')
										.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
										.map(d => d.trim())
										.map(d => d.split(' ').filter(d => d !== null && typeof d === "string" && d.trim() !== "")
											.map(d => d.trim()).pop());
									var methodKey = args[1];
									var method = isit === "character" ? jointJSON['char'][methodKey] : jointJSON['bg'][methodKey];
									if (typeof method !== "undefined" && method !== null) {
										if (!method.single) {
											var argus = method.arg;
											var ret = [];
											for (var i in argus) {
												var arg = argus[i];
												var breakout = false;
												for (var ix in arg.alias) {
													var ali = arg.alias[ix];
													for (var k in keys) {
														var key = keys[k];
														console.log(key, ali);
														if (key === ali || ali === "promise") {
															breakout = true;
															break;
														}
													}
													if (breakout) {
														break;
													}
												}
												if (breakout) {
													continue;
												}
												for (var ii in arg.alias) {
													//each possible alias
													var ali = arg.alias[ii];
													ret.push(this.genSug(ali, arg.desc, arg.type, arg.name))
												}
											}
											if (ret.length === 0) {
												ret.push(this.genSuggestion('There are no argument left', '', ''));
											}
											return this.genResp(ret);
										} else {
											var argus = method.arg;
											if(argIndex>2){
												return this.genResp([]);
											}
											if (argus.length > 0) {
												var ret = [];
												var arg = argus[0];
												var accepted = arg.accepted;
												for (var ii2 in accepted) {
													var des = accepted[ii2];
													if (ii2 === "character") {
														for (var i in o) {
															var type = o[i];
															if (type.trim() === "character") {
																ret.push(this.genSuggestion(i, o[i], 'suggestion'))
															}
														}
													} else if (ii2 === "stage") {
														for (var i in o) {
															var type = o[i];
															if (type.trim() === "stage") {
																ret.push(this.genSuggestion(i, o[i], 'suggestion'))
															}
														}
													} else {
														ret.push(this.genSuggestion(ii2, des, 'suggestion'));
													}
												}
												return this.genResp(ret);
											}
											return this.genResp([this.genSuggestion('There are no argument left', '', '')])
										}
									} else {
										return this.genResp([]);
									}
								}
							}
							return this.genResp([]);
						}
				}
				return this.genResp([]);
			}
			return this.genResp([]);
		} else {
			switch (argIndex) {
				case 1:
					return this.genResp([]);
				case 2:
					switch (args[0]) {
						case "let":
							return this.genResp(
								[this.genSuggestion('be', '', 'keyword')]
							)
						default:
							return this.genResp([]);
					}
				case 3:
					return this.genResp([]);
				case 4:
					if (args[0] === 'let') {
						return this.genResp(
							[this.genSuggestion('as', '', 'keyword')]
						)
					} else {
						return this.genResp([]);
					}
				case 5:
					if (args[0] === 'let') {
						return this.genResp(
							[this.genSuggestion('string', 'Initialize as string', 'type'), this.genSuggestion('number', 'Initialize as number', 'type'), this.genSuggestion('boolean', 'Initialize as boolean', 'type'), this.genSuggestion('object', 'Initialize as object', 'type'), this.genSuggestion('array', 'Initialize as array', 'type')]
						)
					} else {
						return this.genResp([]);
					}
				default:
					return this.genResp([]);
			}
		}
	},
	genResp(suggestions) {
		return new Promise(function(resolve) {
			return resolve(suggestions);
		});
	},
	genSuggestion(text, description, type) {
		return {
			text: text,
			description: description,
			rightLabel: type,
			type: type
		}
	},
	genSug(text, desc, type, origin) {
		return {
			text: text,
			description: desc,
			rightLabel: origin,
			type: type
		}
	},
	numberOfSpaces(text) {
		text = text.replace('\t', ' ');
		var count = 0;
		var index = 0;
		while (text.charAt(index++) === " ") {
			count++;
		}
		return count;
	},
	getArgIndex(pos, editor, prefix) {
		var row = pos.row;
		var col = pos.column;
		var line = editor.lineTextForBufferRow(row);
		var s = this.numberOfSpaces(line);
		var pre = line.substr(0, col);
		var prefix = pre.charAt(pre.length - 1) === ' ' ? ' ' : pre.split(' ').filter(d => d !== null && typeof d === "string" && d.trim() !== "")
			.map(d => d.trim()).pop();
		pre = pre.trim();
		var args = pre.split(' ')
			.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
			.map(d => d.trim());
		prefix = typeof prefix === "string" ?  prefix.trim() : '';
		return [prefix === "" ? args.length : args.length - 1, s, args, prefix];
	},
	isGameObj(char, o) {
		if (typeof o[char] === "undefined" || o[char] === null) {
			return false;
		} else {
			return o[char];
		}
	},
	getGameObjects(editor) {
		var text = editor.getText();
		var lines = text.split('\n')
			.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
			.map(d => d.trim())
			.filter(d => d.split(' ')[0].trim() === "declare" || d.split(' ')[0].trim() === "dec")
		var objects = {};
		for (var i in lines) {
			var line = lines[i];
			var args = line.split(' ')
				.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
				.map(d => d.trim())
			if (args.length === 4) {
				var key = args[0];
				var as = args[2];
				var type = args[3];
				var chars = args[1];
				if (key === "declare" || key === "dec") {
					if (as === "as") {
						if (type === "stage" || type === "character") {
							var ins = chars.split(',')
								.filter(d => d !== null && typeof d === "string" && d.trim() !== "")
								.map(d => d.trim())
							for (var x in ins) {
								var instance = ins[x];
								objects[instance] = type;
							}
						}
					}
				}
			}
		}
		return objects;
	}
};
