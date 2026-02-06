/**
 * 将数字金额转换为中文大写金额
 * @param {number} amount - 金额数字
 * @returns {string} 中文大写金额，例如：壹仟贰佰叁拾肆元伍角陆分
 */
export function toChineseAmount(amount) {
  if (amount == null || amount === "" || isNaN(amount)) {
    return "";
  }

  const num = Number(amount);
  if (num === 0) {
    return "零元整";
  }

  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];

  // 整数部分用 Math.floor 避免浮点误差；小数部分固定两位
  const intNum = Math.floor(num);
  const integerPart = String(intNum);
  const decimalPart = (num.toFixed(2).split(".")[1] || "00").slice(0, 2);

  // 转换四位数字（个、十、百、千），str 为不超过 4 位的数字串
  function convertFourDigits(str) {
    if (!str || str === "0") return "零";
    const len = str.length;
    let result = "";
    for (let i = 0; i < len; i++) {
      const d = parseInt(str[i], 10);
      const pos = len - 1 - i; // 0=个位, 1=十, 2=百, 3=千
      if (d !== 0) {
        if (d === 1 && pos === 1 && i === 0) {
          result += "拾";
        } else {
          result += digits[d] + units[pos];
        }
      } else if (result.length > 0 && result[result.length - 1] !== "零") {
        result += "零";
      }
    }
    return result || "零";
  }

  // 转换整数部分：按段拆分（亿、万、个），每段最多 4 位
  function convertIntegerPart(str) {
    if (!str || str === "0") return "零";
    let s = str;
    let result = "";
    // 亿位（从左起，取到倒数第 8 位之前）
    if (s.length > 8) {
      result += convertFourDigits(s.slice(0, s.length - 8)) + "亿";
      s = s.slice(s.length - 8);
    }
    // 万位（取到倒数第 4 位之前）
    if (s.length > 4) {
      const wanPart = s.slice(0, s.length - 4);
      const wanStr = convertFourDigits(wanPart);
      if (wanStr !== "零") result += wanStr + "万";
      s = s.slice(s.length - 4);
    }
    // 个位到千位
    const geStr = convertFourDigits(s);
    if (geStr !== "零") result += geStr;
    result = result.replace(/零+/g, "零").replace(/零$/, "");
    return result || "零";
  }

  const integerStr = convertIntegerPart(integerPart) + "元";

  // 转换小数部分（角分）
  let decimalStr = "";
  const jiao = parseInt(decimalPart[0]);
  const fen = parseInt(decimalPart[1]);

  if (jiao === 0 && fen === 0) {
    decimalStr = "整";
  } else {
    if (jiao !== 0) {
      decimalStr += digits[jiao] + "角";
    }
    if (fen !== 0) {
      decimalStr += digits[fen] + "分";
    }
  }

  return integerStr + decimalStr;
}
