const elements = ['','*','+','-','/','**','**-','/-','*-']; // operators, ** means ^
const felements = ['', '-']; // operators before first element
const target = 10958.0;
const show_all = false; // to debug

var best_str = '0';
var best_delta = 1*target;
var best_value = 0;
var delta = 1*target;
var count = 0;

// Runs after last level of reccurence reached and equation is nearly full (except last closing brackets)
// str - current equation or it's part
// onum - number of opened brackets
// opens - array of positions of opened brackets
function finish_equation (str, onum, opens) {
    // do not try to eveluate if there is ...((...)) as it is same as ...(...)
    for (var k=1; k<onum; k++) {
      if (opens[k] == opens[k-1]) {
        return;
      }
    }
    // close all unclosed brackets
    if (onum > 0) for (var n=0; n<onum; n++) str += ')';
    var fn = true;
    
    try {
      v = eval(str);
    } catch (e) {
      v = 0;
    }
    if (isNaN(v)) v = 0; // for case of division by zero
    delta = Math.abs(v - target)
    if (delta < best_delta) {
      best_str = str;
      best_delta = delta;
      best_value = v;
      console.log('New best value '+v+' for equation '+str+' delta '+delta);
    }
    count++;
    if (count % 10000000 == 0) {
      console.log('Checked '+count+' possibilities. Last checked: '+str);
      console.log('Best so far: '+best_str+' with value: '+best_value+' and delta: '+best_delta);
    }
    if (show_all) {
      console.log('Current: '+str+' value '+v+' delta: '+delta);
    }
}

// Counts number of same consecutive numbers and number before first same in one loop
// Returns 2 elements [same number, before same number]
function count_same_and_before (onum, opens) {
  if (onum == 0) return [0,0];
  if (onum == 1) return [0,1];
  var prev = -1;
  var same_num = 0;
  var before_same = 0;
  for (var k=1; k<onum; k++) {
    if (opens[k-1] == opens[k]) same_num++;
    if (same_num == 0) before_same++;
    prev = opens[k];
  }
  before_same++;
  return [same_num, before_same];
}


// Runs recurrently and checks on last level of recurrence
// level - current number
// str - current equation or it's part
// onum - number of opened brackets
// opens - array of positions of opened brackets
// just_opened - was bracket just opened (do not want ...+(67).. etc.)
function check (level, str, onum, opens, just_opened) {
    // finish at level 10 - after goint through all 1-9 numbers
    if (level == 10) {
        finish_equation (str, onum, opens); 
        return;
    }
    // run when level < 10
    // for level 1 we start equation so we use only empty operator or negation, 
    // otherwise all possible elements
    var els = level == 1 ? felements : elements;
    for (var x in els) { // iterate through possible operators
        var e = els[x]; // current operator
        var st = ''; // starting brackets string
        var en = ''; // ending brackets string
        var a; // counter
        var max_st = 0; // maximal number of starting brackets (might be changed below)
        var min_en = 0; // minimal number of ending brackets
        var max_en = 0; // maximal number of ending brackets (might be changed below)
        var same_and_before = count_same_and_before (onum, opens);
        var same_num = same_and_before[0];
        var before_num = same_and_before[1];
        
        if (level == 1 || e != '') { // do not open on concatenations
          // we do not want to open more than we can reasonably close without ...((...))...
          max_st = 9 - level - same_num;
          if (max_st < 1 && level < 9) max_st = 1; 
        }
        
        // chek if should close at least one of (( pair so we won't end up with ...((...))
        if (same_num >= 10-level) min_en = before_num; 

        // does not close if just opened, no sense of that
        // also does not close if current operator is concatenation
        // maximal number of closes is at most number of all ( and at most up to one of (( 
        // so we are not going into ...((...))...
        if (!just_opened && onum > 0 && e != '') max_en = before_num;
            
        if (min_en > max_en) return; // no sense to go further, will surely have ...((...))... or ...((...)) soon

        for (var n_st=0; n_st<=max_st; n_st++) { 
          // iterate through possible numbers of starting brackets
          st = '';
          var max_m = (n_st > 1 || level == 1) ? 1 : 0; // 1 means that can add additional negation before brackets
          // add negation only on second bracket as for first it is already 
          // checked (operators '*-' etc.) except for starting entry where always allowed so cound have -(...
          for (var m=0; m <= max_m; m++) { // 0 - no negation, 1 - negation
            if (n_st > 0) for (a = 0; a<n_st; a++) st += m == 0 ? '(' : '-(';
            for (var n_en=min_en; n_en <= max_en; n_en++) { // iterate all possible numbers of ending brackets
                en = '';
                if (n_en > 0) for (a = 0; a<n_en; a++) en += ')';
                var opens2 = []; // new array of positions of bracket opens
                for (var i=0; i<opens.length - n_en; i++) opens2.push(opens[i]); // copy not closed ones
                for (var j=0; j<n_st; j++) opens2.push(level); // add new ones
                var str2 = str + en + e + st + level; // add fragment of equation
                var onum2 = 1*onum + n_st - n_en; // recalc number of brackets
                // previous value if concatenated, otherwise check if started a bracket
                var just_opened2 = e.length == 0 ? just_opened : n_st > 0; 
                check (level+1, str2, onum2, opens2, just_opened2)
            }
          }
        }
    }
}


str = ''
check (1, str, 0, [], false);

console.log('Best value '+best_value+' for equation '+ best_str+' delta '+ best_delta);
