const elements = ['','*','+','-','/','**','**-','/-','*-']; // operators, ** means ^
const felements = ['', '-']; // operators before first element
const target = 10958.0;
const show_all = false; // to debug

var best_str = '0';
var best_delta = 1*target;
var best_value = 0;
var delta = 1*target;
var count = 0;

// Runs recurrently and checks on last level of recurrence
// level - current number
// str - current equation or it's part
// onum - number of opened brackets
// opens - array of positions of opened brackets
// just_opened - was bracket just opened (do not want ...+(67).. etc.)
function check (level, str, onum, opens, just_opened) {
    // finish at level 10 - after goint through all 1-9 numbers
    if (level == 10) {
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
        var same_num = 0;
        var prev = -1;
        for (var k=0; k<onum; k++) {
          if (opens[k] == prev) same_num++;
          prev = opens[k];
        }
        if (level == 1 || e != '') { // do not open on concatenations
          // we do not want to open more than we can reasonably close without ...((...))...
          max_st = 9 - level - same_num;
          if (max_st < 1 && level < 9) max_st = 1; 
        }

        if (same_num >= 10-level) { // should close at least one pair so we won't end up with ...((...))
          prev = -1;
          for (var k=0; k<onum; k++) {
            if (opens[k] == prev) break;
            min_en++;
          }
        }

        if (!just_opened && onum > 0 && e != '') {
            // does not close if just opened, no sense of that
            // also does not close if current operator is concatenation
            prev = level-1
            for (var k=0; k<onum; k++) {
                if (opens[k] == prev) break;
                max_en++;
                prev = opens[k];
            }
            // maximal number of closes is the max possible value 
            // withot going into ...((...))... (closing two of the same starting position)
        }
        if (min_en > max_en) return; // no sense to go further, will surely have ...((...))...
        for (var n_st=0; n_st<=max_st; n_st++) { 
          // iterate through possible numbers of starting brackets
          st = '';
          var max_m = (n_st > 1 || level == 1) ? 1 : 0; // 1 means to add additional negation before brackets
          // add negation only on second bracket as for first it is already 
          // checked (operators '*-' etc.) except for starting entry so cound have -(( etc.
          for (var m=0; m <= max_m; m++) {
            if (n_st > 0) for (a = 0; a<n_st; a++) st += m == 0 ? '(' : '-(';
            for (var n_en=min_en; n_en <= max_en; n_en++) { // iterate all ending brackets
                en = '';
                if (n_en > 0) for (a = 0; a<n_en; a++) en += ')';
                // TODO: maybe optimise
                var opens2 = []; // new array of positions of bracket opens
                for (var i=0; i<opens.length - n_en; i++) opens2.push(opens[i]);
                for (var j=0; j<n_st; j++) opens2.push(level);
                var str2 = str + en + e + st + level;
                var onum2 = 1*onum + n_st - n_en;
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
