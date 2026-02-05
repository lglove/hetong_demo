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

  // 分离整数部分和小数部分
  const parts = num.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "00";

  // 转换整数部分（支持到亿）
  function convertIntegerPart(str) {
    if (str === "0") return "零";
    
    const len = str.length;
    let result = "";
    
    // 处理亿位
    if (len > 8) {
      const yiPart = str.slice(0, len - 8);
      result += convertFourDigits(yiPart) + "亿";
      str = str.slice(len - 8);
    }
    
    // 处理万位
    if (str.length > 4) {
      const wanPart = str.slice(0, str.length - 4);
      const wanStr = convertFourDigits(wanPart);
      if (wanStr && wanStr !== "零") {
        result += wanStr + "万";
      }
      str = str.slice(str.length - 4);
    }
    
    // 处理个位到千位
    const geStr = convertFourDigits(str);
    if (geStr && geStr !== "零") {
      result += geStr;
    }
    
    // 清理多余的零
    result = result.replace(/零+/g, "零").replace(/零$/, "");
    
    return result || "零";
  }

  // 转换四位数字（个、十、百、千）
  function convertFourDigits(str) {
    const len = str.length;
    let result = "";
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - i - 1;
      
      if (digit !== 0) {
        // 处理"壹拾"的情况，通常简化为"拾"
        if (digit === 1 && pos === 1 && i === 0) {
          result += "拾";
        } else {
          result += digits[digit] + units[pos];
        }
      } else if (result && result[result.length - 1] !== "零") {
        result += "零";
      }
    }
    
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
