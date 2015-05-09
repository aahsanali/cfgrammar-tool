var INDENT = '  ';
function subtreePrinter(state, depth) {
  depth = depth | 0;
  var prefix = '';
  for(var i=0; i<depth; ++i) {
    prefix += INDENT;
  }
  console.log(prefix + state.rule)// + ' ' + state.backPointers.length);
  prefix += INDENT;
  for(var i=0; i<state.backPointers.length; ++i) {
    var backPointer = state.backPointers[i];
    if(backPointer === null) { // ie, terminal
      console.log(prefix + state.rule.production[i].data); 
    }
    else {
      subtreePrinter(backPointer, depth+1);
    }
  }
}


function rewritePrinter(parse) {
  var str = [parse];
  
  function formatIntermediateString(highlightIndex) { // highlightIndex must be a state, not a final symbol
    var o = '';
    for(var i=0; i<str.length; ++i) {
      if(i == highlightIndex) {
        o += '*' + str[i].rule.name + '*';
      }
      else {
        if(typeof str[i] === 'string') {
          o += str[i];
        }
        else {
          o += str[i].rule.name;
        }
      }
    }
    return o;
  }
  
  for(var i = 0; i<str.length; ++i) { // NB: both str.length and i change within the rewrite
    if(typeof str[i] === 'string') {
      continue;
    }
    
    var state = str[i];
    var out = state.rule.toString() + '  |  ';
    out += formatIntermediateString(i) + '  |  ';
    
    var rewritten = [];
    for(var j=0; j<state.index; ++j) {
      if(state.rule.production[j].type == 'T') {
        rewritten.push(state.rule.production[j].data);
      }
      else {
        rewritten.push(state.backPointers[j]);
      }
    }
    str = str.slice(0, i).concat(rewritten).concat(str.slice(i+1));
    out += formatIntermediateString(-1);
    console.log(out);
    --i; // gotta reprocess the index we just rewrote
  }
  
}




// helper for domPrinter
// create a DOM node representing the rule. obviously only call in browsers.
// symbols get class cfg-symbol, the rule itself class cfg-rule.
function domRule(rule) {
  var o = document.createElement('span');
  o.className = 'cfg-rule';
  
  var sp = document.createElement('span');
  sp.className = 'cfg-symbol';
  sp.appendChild(document.createTextNode(rule.name));
  o.appendChild(sp);
  o.appendChild(document.createTextNode(' \u2192 ')); // right arrow
  
  if(rule.production.length == 0) {
    o.appendChild(document.createTextNode('\u025B')); // epsilon
  }
  else {
    for(var i=0; i<rule.production.length; ++i) {
      if(rule.production[i].type == 'T') {
        o.appendChild(document.createTextNode(rule.production[i].data));
      }
      else {
        sp = document.createElement('span');
        sp.className = 'cfg-symbol';
        sp.appendChild(document.createTextNode(rule.production[i].data));
        o.appendChild(sp);
      }
    }
  }
  
  return o;
}

// create a DOM table representing the entire parse. obviously only call in browsers.
function domPrinter(parse) {
  var str = [parse];
  
  function formatIntermediateString(highlightStart, highlightLength) {
    if(typeof highlightLength !== 'number' || highlightLength < 0) highlightLength = 1;
    
    var o = document.createElement('span');
    c = o;
    for(var i=0; i<str.length; ++i) {
      if(i == highlightStart) {
        c = document.createElement('span');
        c.className = 'cfg-rewrite';
        o.appendChild(c);
      }
      
      if(i - highlightStart >= highlightLength) {
        c = o;
      }
      
      if(typeof str[i] === 'string') {
        c.appendChild(document.createTextNode(str[i]));
      }
      else {
        var sp = document.createElement('span');
        sp.className = 'cfg-symbol';
        sp.appendChild(document.createTextNode(str[i].rule.name));
        c.appendChild(sp);
      }
    }
    return o;
  }


  var out = document.createElement('table');
  out.className = 'cfg-derivations derivations'; // TODO second is for compat
  out.innerHTML = '<thead><tr><th>Rule</th><th>Application</th><th>Result</th></tr></thead>';
  
  
  
  
  // handle GAMMA state specially
  var row = document.createElement('tr');
  var cell = document.createElement('td');
  var sp = document.createElement('sp');
  sp.className = 'cfg-rule';
  sp.innerHTML = 'Start \u2192 ' + '<span class="cfg-symbol">' + parse.backPointers[0].rule.name + '</span>';
  cell.appendChild(sp);
  row.appendChild(cell);

  cell = document.createElement('td');
  var sp = document.createElement('span');
  sp.className = 'cfg-start';
  sp.appendChild(document.createTextNode('Start'));
  cell.appendChild(sp);
  row.appendChild(cell);
  
  str = [parse.backPointers[0]]; // ie, start symbol
  cell = document.createElement('td');
  cell.appendChild(formatIntermediateString(-1));
  row.appendChild(cell);
  
  out.appendChild(row);

  
  for(var i = 0; i<str.length; ++i) { // NB: both str.length and i change within the body of the loop
    if(typeof str[i] === 'string') {
      continue;
    }
    
    var state = str[i];

    var row = document.createElement('tr');
    var cell = document.createElement('td');
    cell.appendChild(domRule(state.rule));
    row.appendChild(cell);
  
    cell = document.createElement('td');
    cell.appendChild(formatIntermediateString(i));
    row.appendChild(cell);
    

    
    var rewritten = [];
    for(var j=0; j<state.index; ++j) {
      if(state.rule.production[j].type == 'T') {
        rewritten.push(state.rule.production[j].data);
      }
      else {
        rewritten.push(state.backPointers[j]);
      }
    }
    str = str.slice(0, i).concat(rewritten).concat(str.slice(i+1));

    cell = document.createElement('td');
    cell.appendChild(formatIntermediateString(i, rewritten.length));
    row.appendChild(cell);
    out.appendChild(row);

    --i; // gotta reprocess the index we just rewrote
  }
  
  return out;
}




module.exports = {
  subtreePrinter = subtreePrinter,
  rewritePrinter = rewritePrinter,
  domPrinter = domPrinter
}