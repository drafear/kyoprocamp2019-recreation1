let tried_problem_count = 0;
let done_problem_count = 0;

class Problem {
  constructor(prefix, title, timelimit_seconds, statement, anstext, initial_values, judge) {
    this.prefix = prefix;
    this.title = title;
    this.timelimit_seconds = timelimit_seconds;
    this.statement = statement;
    this.anstext = anstext;
    this.initial_values = initial_values;
    this.judge = judge;
  }
  get id() {
    return `problem_${this.prefix}`;
  }
}

class JudgeResult {
  constructor(is_ac, message) {
    if (message === undefined) {
      message = is_ac ? "正解です。" : "不正解です。";
    }
    this.is_ac = is_ac;
    this.message = message;
  }
  get is_wa() { return !this.is_ac; }
}

function bin_xor(a, b) {
  const diff = a.length - b.length;
  if (diff < 0) {
    return bin_xor(b, a);
  }
  let res = "";
  for (let i = 0; i < a.length; ++i) {
    if (i < diff) res += a[i];
    else if (a[i] == b[i - diff]) res += "0";
    else res += "1";
  }
  return res;
}

function bin_add(a, b) {
  let carry = 0;
  let res = "";
  for (let i = 0; i < Math.max(a.length, b.length); ++i) {
    const left = a.length - i - 1 < 0 ? 0 : a[a.length - i - 1] == "0" ? 0 : 1;
    const right = b.length - i - 1 < 0 ? 0 : b[b.length - i - 1] == "0" ? 0 : 1;
    const sum = left + right + carry;
    carry = sum >= 2 ? 1 : 0;
    res = (sum % 2).toString() + res;
  }
  if (carry > 0) {
    res = carry.toString() + res;
  }
  return res;
}

class Timer {
  constructor() { }
  start(callback, interval = Math.floor(1000 / 60)) {
    this.start_time = Date.now();
    this.interval = interval;
    this.tid = setTimeout(() => { this.tick(callback); }, this.interval);
  }
  tick(callback) {
    this.tid = setTimeout(() => { this.tick(callback); }, this.interval);
    callback(this.elapsed_seconds);
  }
  stop() {
    clearTimeout(this.tid);
  }
  get elapsed_seconds() {
    return Math.floor((Date.now() - this.start_time) / 1000);
  }
  get is_started() {
    return 'start_time' in this;
  }
}

function format_seconds(t) {
  const m = Math.floor(t / 60);
  const s = ('0' + t % 60).slice(-2);
  return `${m}:${s}`;
}

const num_range = 1000000;

const Problems = [
  new Problem(
    "A", "等差数列",
    60 * 3,
    "<p>2019 を 4 つ以上の連続する整数の和で表してください</p>",
    `<p><input type='number' min='-${num_range}' max='${num_range}' v-model='ans.l'> + ... + <input type='number' min='-${num_range}' max='${num_range}' v-model='ans.r'></p>`,
    { l: 0, r: 0 },
    ({ l, r }) => {
      const len = Math.max(0, r - l + 1);
      if (len < 4) return new JudgeResult(false, `長さが ${len} です。`);
      const sum = l * len + len * (len - 1) / 2;
      if (sum !== 2019) return new JudgeResult(false, `合計が ${sum} です。`);
      return new JudgeResult(true);
    }
  ),
  new Problem(
    "B", "中世ヨーロッパの戦い",
    60 * 3,
    `
<p><a href='assets/B.png' target='_black'>中世ヨーロッパの戦い</a>で 39 人が参加し、現在 22人・10人・7人 の 3 つの国に分かれている。</p>
<p>行われたじゃんけんの回数としてあり得る回数を 1 つ挙げよ。</p>
    `,
    `<p><input type='number' min='0' max='${num_range}' v-model='ans.n'> 回</p>`,
    { n: 0 },
    ({ n }) => {
      if (n < 36) return new JudgeResult(false);
      return new JudgeResult(true);
    }
  ),
  new Problem(
    "C", "排他的論理NOT和集合",
    60 * 5,
    `
<p>次の条件を全て満たす集合 S を探せ。</p>
<ul>
  <li>S には 3 要素以上含まれる</li>
  <li>
    S に含まれるどの異なる 2 要素 a, b についても
    <ul>
      <li>a XOR b が S に含まれる</li>
      <li>a + b が S に含まれない</li>
    </ul>
  </li>
</ul>
    `,
    `
<p>2進数表記で各要素をカンマ区切りで解答せよ。</p>
<p><input type='text' placeholder='1101,1111,1010,10010' v-model='ans.str'></p>
    `,
    { str: "" },
    ({ str }) => {
      if (str === '') {
        return new JudgeResult(false, "解答ボックスが空です。");
      }
      S = str.split(',');
      const original_S = [];
      for (const item of S) original_S.push(item);
      if (S.length < 3) return new JudgeResult(false, `|S| = ${S.length}`);
      // 各要素ほんまに2進数か？
      for (const item of S) {
        if (!item.match(/^[01]+$/)) {
          return new JudgeResult(false, `2進数表記で解答してください: ${item}`);
        }
      }
      // 長さを揃える
      let len = 0;
      for (const item of S) {
        len = Math.max(len, item.length);
      }
      for (let i = 0; i < S.length; ++i) {
        S[i] = "0".repeat(len - S[i].length) + S[i];
      }
      // ジャッジ等
      const memo = {};
      for (let i = 0; i < S.length; ++i) {
        memo[S[i]] = i;
      }
      for (let i = 0; i < S.length; ++i) {
        for (let j = 0; j < i; ++j) {
          if (S[i] === S[j]) {
            return new JudgeResult(false, `同じ要素が存在します: ${original_S[i]}, ${original_S[j]}`);
          }
          if (!(bin_xor(S[i], S[j]) in memo)) {
            return new JudgeResult(false, `${original_S[i]} XOR ${original_S[j]} = ${bin_xor(S[i], S[j])}`);
          }
          if (bin_add(S[i], S[j]) in memo) {
            return new JudgeResult(false, `${original_S[i]} + ${original_S[j]} = ${original_S[memo[bin_add(S[i], S[j])]]}`);
          }
        }
      }
      return new JudgeResult(true);
    }
  ),
  new Problem(
    "D", "Semit",
    60 * 5,
    `
<p>f(18) = 8</p>
<p>f(23) = 6</p>
<p>f(68) = 84</p>
<p>f(123) = 63</p>
<p>f(334) = 231</p>
<p>f(433) = ?</p>
    `,
    "<p><input type='text' v-model='ans.str'></p>",
    { str: "" },
    ({ str }) => new JudgeResult(str === "921")
  ),
  new Problem(
    "E", "Deficient Number",
    60 * 5,
    "<p>自身を除く約数の総和が 677 になる自然数を 1 つ答えよ。</p>",
    "<p><input type='number' min='0' max='10000000' v-model='ans.n'></p>",
    { n: 0 },
    ({ n }) => {
      const answers = [2019, 11203, 15019, 18763, 36403, 49219, 52243, 60883, 63619, 85003, 87019, 94363, 101923, 103219, 107683, 112219, 113803];
      for (const i of answers) {
        if (+n === i) {
          return new JudgeResult(true);
        }
      }
      return new JudgeResult(false);
    }
  ),
  new Problem(
    "F", "数列 X",
    60 * 8,
    `
<p>次を全て満たす数列 X を構成してください。</p>
<ul>
  <li>X は (2, 3, ..., 12) を並べ替えたものである</li>
  <li>X で隣り合う 2 整数の最大公約数は 1 である</li>
  <li>X で隣り合う 2 整数の差(絶対値)は 2 以上である</li>
</ul>
    `,
    `
<p>カンマ区切りで入力してください。</p>
<p><input type='text' placeholder='2,3,4,5,6,7,8,9,10,11,12' v-model='ans.X'></p>
    `,
    { X: "" },
    ({ X }) => {
      const answers = [
        [4, 9, 2, 5, 12, 7, 10, 3, 8, 11, 6],
        [6, 11, 2, 9, 4, 7, 10, 3, 8, 5, 12],
        [6, 11, 2, 9, 4, 7, 12, 5, 8, 3, 10],
        [6, 11, 4, 9, 2, 5, 8, 3, 10, 7, 12],
        [6, 11, 4, 9, 2, 5, 12, 7, 10, 3, 8],
        [6, 11, 4, 9, 2, 7, 10, 3, 8, 5, 12],
        [6, 11, 4, 9, 2, 7, 12, 5, 8, 3, 10],
        [6, 11, 8, 3, 10, 7, 4, 9, 2, 5, 12],
        [6, 11, 8, 3, 10, 7, 12, 5, 2, 9, 4],
        [8, 3, 10, 7, 12, 5, 2, 9, 4, 11, 6],
        [10, 3, 8, 5, 12, 7, 2, 9, 4, 11, 6],
        [10, 3, 8, 5, 12, 7, 4, 9, 2, 11, 6],
        [12, 5, 2, 9, 4, 7, 10, 3, 8, 11, 6],
        [12, 5, 8, 3, 10, 7, 2, 9, 4, 11, 6],
        [12, 5, 8, 3, 10, 7, 4, 9, 2, 11, 6],
        [12, 7, 10, 3, 8, 5, 2, 9, 4, 11, 6],
      ];
      X = X.replace(/ /g, '');
      for (const ans of answers) {
        if (X === ans.join(',')) {
          return new JudgeResult(true);
        }
      }
      return new JudgeResult(false);
    }
  )
];

function init_problems_vue(vm_score) {
  let template = "";
  for (const prob of Problems) {
    template += `<div id='${prob.id}'></div>`;
  }
  const res = new Vue({
    el: '#problems',
    template: `<div>${template}</div>`,
  });
  for (const prob of Problems) {
    const prefix = prob.prefix;
    const judge = prob.judge;
    const rendered_id = `${prob.id}_rendered`;
    const vm = new Vue({
      el: `#${prob.id}`,
      template: `
<section id='${rendered_id}' @click='is_started = start_timer(timer);' :class='{ opened: is_started, unopened: !is_started }'>
  <h2><span>
    ${prob.prefix}. ${prob.title}
    <img src='assets/clock.png' alt='clock' class='clock'>{{ format_seconds(rest_seconds) }}
  </span></h2>
  <form @submit.prevent="judge(ans)" v-if='is_started'>
    <div class='statement'>
      ${prob.statement}
    </div>
    <div class='statement'>
      ${prob.anstext}
    </div>
    <input type='submit' value='Judge' :disabled='judge_result !== null && judge_result.is_ac'>
    <span>
      <span v-if='judge_result !== null && judge_result.is_ac' class='ac'><span class='ac-box'>AC</span> {{ judge_result.message }}</span>
      <span v-if='judge_result !== null && judge_result.is_wa' class='wa'><span class='wa-box'>WA</span> {{ judge_result.message }}</span>
    </span>
  </form>
</section>
      `,
      data: {
        ans: prob.initial_values,
        timer: new Timer(),
        timelimit_seconds: prob.timelimit_seconds,
        rest_seconds: prob.timelimit_seconds,
        is_started: false,
        judge_result: null,
      },
      methods: {
        judge: ans => {
          const result = judge(ans);
          vm.judge_result = result;
          if (result.is_ac) {
            vm.timer.stop();
            Vue.set(vm_score.scores, prefix, new ACScore(vm.timer.elapsed_seconds));
            ++done_problem_count;
          }
        },
        format_seconds: format_seconds,
        start_timer: timer => {
          if (!timer.is_started) {
            Vue.set(vm_score.scores, prefix, new WAScore());
            timer.start(elapsed_seconds => {
              if (elapsed_seconds >= vm.timelimit_seconds) {
                timer.stop();
                vm.judge_result = new JudgeResult(false, '時間切れです。');
                ++done_problem_count;
              }
              vm.rest_seconds = Math.max(0, vm.timelimit_seconds - elapsed_seconds);
            });
            ++tried_problem_count;
          }
          return timer.is_started;
        },
      }
    });
  }
  return res;
}

class ACScore {
  constructor(penalty) {
    this.penalty = penalty;
  }
  get is_ac() { return true; }
  toString() {
    return `${format_seconds(this.penalty)}`;
  }
}
class WAScore {
  constructor() { }
  get penalty() { return 0; }
  get is_ac() { return false; }
  toString() {
    return `-`;
  }
}
class Unsolved {
  constructor() { }
  get penalty() { return 0; }
  get is_ac() { return false; }
  toString() {
    return `-`;
  }
}

function init_result_vue() {
  const initial_scores = {};
  for (const prob of Problems) {
    initial_scores[prob.prefix] = new Unsolved();
  }
  const vm = new Vue({
    el: '#result',
    data: {
      scores: initial_scores
    },
    template: `
<section id='result'>
  <p>{{ total_ac(scores) }}完 ペナルティ {{ format_seconds(total_penalty(scores)) }}</p>
  <a :href="'https://twitter.com/share?url=https://drafear.github.io/kyoprocamp2019-recreation1/&hashtags=kyoprocamp_X&text='+encodeURIComponent(tweet_text(scores, total_ac, total_penalty))" target='_blank'>結果をツイッターで共有</a>
</section>
    `,
    methods: {
      total_ac: (scores) => {
        let res = 0;
        for (const prob of Problems) {
          if (scores[prob.prefix].is_ac) {
            ++res;
          }
        }
        return res === Problems.length ? "全" : res;
      },
      total_penalty: (scores) => {
        let res = 0;
        for (const prob of Problems) {
          res += scores[prob.prefix].penalty;
        }
        return res;
      },
      format_seconds: format_seconds,
      tweet_text: (scores, total_ac, total_penalty) => {
        let detail = "";
        for (const prob of Problems) {
          const score = scores[prob.prefix];
          detail += `${prob.prefix}: ${score}\n`;
        }
        return `数探しゲームをプレイしました！
結果: ${total_ac(scores)}完 ペナルティ ${format_seconds(total_penalty(scores))}

${detail}
みんなも挑戦してみよう！
`;
      },
    },
  });
  return vm;
}

function init_vue() {
  const vm_score = init_result_vue();
  init_problems_vue(vm_score);
}

function init_inputs() {
  // select
  window.addEventListener('click', e => {
    const elem = e.target;
    if (elem.tagName === 'INPUT' && (elem.type === 'text' || elem.type === 'number')) {
      elem.select();
    }
  });
}

function init_events() {
  window.addEventListener('beforeunload', e => {
    if (tried_problem_count > 0 && done_problem_count < Problems.length) {
      e.preventDefault();
      e.returnValue = '問題に挑戦中ですがページを離れますか？';
    }
  });
}

function init() {
  init_inputs();
  init_vue();
  init_events();
}

init();
