class Problem {
  constructor(id, title, timelimit_seconds, descriptions, anstext) {
    this.id = id;
    this.title = title;
    this.timelimit_seconds = timelimit_seconds;
    this.descriptions = descriptions;
    this.anstext = anstext;
  }
}

class JudgeResult {
  constructor(result, message) {
    if (message === undefined) {
      message = result ? "正解です。" : "不正解です。";
    }
    this.result = result;
    this.message = message;
  }
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
    const left = a.length - i - 1 < 0 ? 0 : a[a.length - i - 1];
    const right = b.length - i - 1 < 0 ? 0 : b[b.length - i - 1];
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
  start() {
    this.start_time = Date.now();
  }
  get elapsed_seconds() {
    return Math.floor((Date.now() - this.start_time) / 1000);
  }
}

const Problems = [
  new Problem(
    "A", "等差数列",
    60 * 3,
    ["2019 を 4 つ以上の連続する整数の和で表してください"],
    ["{num} + ... + {num}"],
    (l, r) => {
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
    [
      "中世ヨーロッパの戦いで 39 人が参加し、現在 22人・10人・7人 の 3 つの国に分かれている。",
      "行われたじゃんけんの回数としてあり得る回数を 1 つ挙げよ。",
    ]
    ["{num:0,10000} 回"],
    n => {
      if (n < 36) return new JudgeResult(false);
      return new JudgeResult(true);
    }
  ),
  new Problem(
    "C", "排他的論理NOT和集合",
    60 * 5,
    [
      "次の条件を全て満たす集合 S を探せ。",
      [
        "S には 3 要素以上含まれる",
        "S に含まれるどの異なる 2 要素 a, b についても",
        [
          "a XOR b が S に含まれる",
          "a + b が S に含まれない",
        ]
      ]
    ],
    [
      "2進数表記で各要素をカンマ区切りで解答せよ。",
      "{str:1101,1111,1010,10010}"
    ],
    str => {
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
            return new JudgeResult(false, `${original_S[i]} + ${original_S[j]} = ${original_S[bin_add(S[i], S[j])]}`);
          }
        }
      }
      return new JudgeResult(true);
    }
  ),
  new Problem(
    "D", "Semit",
    60 * 5,
    [
      "f(18) = 8",
      "f(23) = 6",
      "f(68) = 84",
      "f(123) = 63",
      "f(334) = 231",
      "f(433) = ?",
    ],
    ["{str}"],
    str => new JudgeResult(str !== "921")
  ),
  new Problem(
    "E", "Deficient Number",
    60 * 5,
    ["自身を除く約数の総和が 677 になる自然数を 1 つ答えよ。"],
    ["{num:0,100000000}"],
    n => {
      const answers = [2019, 11203, 15019, 18763, 36403, 49219, 52243, 60883, 63619, 85003, 87019, 94363, 101923, 103219, 107683, 112219, 113803];
      for (const i of answers) {
        if (n === i) {
          return new JudgeResult(true);
        }
      }
      return new JudgeResult(false);
    }
  ),
  new Problem(
    "F", "数列 X",
    60 * 8,
    [
      "次を全て満たす数列 X を構成してください。",
      [
        "X は (2, 3, ..., 12) を並べ替えたものである",
        "X で隣り合う 2 整数の最大公約数は 1 である",
        "X で隣り合う 2 整数の差(絶対値)は 2 以上である",
      ],
      [
        "カンマ区切りで入力してください。",
        "{str:2,3,4,5,6,7,8,9,10,11,12}"
      ]
    ],
    X => {
      const answers = [
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
      for (const ans of answers) {
        if (X === ans.join(',')) {
          return new JudgeResult(true);
        }
      }
      return new JudgeResult(false);
    }
  )
];
