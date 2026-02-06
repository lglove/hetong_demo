"""合同导出 PDF。"""
import re
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def _to_chinese_amount(amount) -> str:
    """将数字金额转为中文大写（用于 PDF）。"""
    if amount is None:
        return ""
    try:
        num = float(amount)
    except (TypeError, ValueError):
        return str(amount)
    if num == 0:
        return "零元整"
    digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
    units = ["", "拾", "佰", "仟"]
    parts = f"{num:.2f}".split(".")
    integer_part = parts[0]
    decimal_part = (parts[1] or "00")[:2]

    def convert_four(s: str) -> str:
        if not s or s == "0":
            return "零"
        result = ""
        for i, ch in enumerate(s):
            d = int(ch)
            pos = len(s) - 1 - i
            if d != 0:
                if d == 1 and pos == 1 and i == 0:
                    result += "拾"
                else:
                    result += digits[d] + units[pos]
            elif result and result[-1] != "零":
                result += "零"
        return result or "零"

    def convert_int(s: str) -> str:
        if not s or s == "0":
            return "零"
        result = ""
        if len(s) > 8:
            result += convert_four(s[: len(s) - 8]) + "亿"
            s = s[len(s) - 8 :]
        if len(s) > 4:
            wan = convert_four(s[: len(s) - 4])
            if wan != "零":
                result += wan + "万"
            s = s[len(s) - 4 :]
        ge = convert_four(s)
        if ge != "零":
            result += ge
        result = re.sub(r"零+", "零", result).rstrip("零")
        return result or "零"

    int_str = convert_int(integer_part) + "元"
    jiao, fen = int(decimal_part[0]), int(decimal_part[1])
    if jiao == 0 and fen == 0:
        int_str += "整"
    else:
        if jiao:
            int_str += digits[jiao] + "角"
        if fen:
            int_str += digits[fen] + "分"
    return int_str


def _safe_str(v) -> str:
    if v is None:
        return "-"
    return str(v).strip() or "-"


def _format_date(v) -> str:
    if v is None:
        return "-"
    return str(v)


def build_contract_pdf(contract) -> bytes:
    """
    根据合同对象生成 PDF 字节流。
    contract 需包含: title, contract_no, party_a, party_b, amount, sign_date,
    expire_date, status, note, creator (relationship with username)。
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ContractTitle",
        parent=styles["Heading1"],
        fontSize=16,
        spaceAfter=12,
    )
    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.grey,
    )

    status_map = {
        "draft": "草稿",
        "pending_finance": "待财务审批",
        "finance_approved": "待管理员审批",
        "active": "已生效",
        "rejected": "已驳回",
        "expired": "已到期",
        "terminated": "已终止",
    }
    status_text = status_map.get(getattr(contract, "status", None) or "", str(getattr(contract, "status", "")))
    amount_val = getattr(contract, "amount", None)
    amount_num = float(amount_val) if amount_val is not None else 0
    amount_display = f"¥ {amount_num:,.2f}" if amount_val is not None else "-"
    amount_cn = _to_chinese_amount(amount_val)
    creator_name = ""
    if hasattr(contract, "creator") and contract.creator:
        creator_name = getattr(contract.creator, "username", "") or ""

    elements = []
    elements.append(Paragraph(_safe_str(getattr(contract, "title", "")), title_style))
    elements.append(Spacer(1, 0.5 * cm))

    data = [
        ["合同编号", _safe_str(getattr(contract, "contract_no", ""))],
        ["甲方", _safe_str(getattr(contract, "party_a", ""))],
        ["乙方", _safe_str(getattr(contract, "party_b", ""))],
        ["金额", amount_display + (" （" + amount_cn + "）" if amount_cn else "")],
        ["签订日期", _format_date(getattr(contract, "sign_date", None))],
        ["到期日", _format_date(getattr(contract, "expire_date", None))],
        ["状态", status_text],
        ["创建人", creator_name or "-"],
        ["备注", _safe_str(getattr(contract, "note", ""))],
    ]
    table = Table(data, colWidths=[4 * cm, 12 * cm])
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f5f5f5")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#333333")),
                ("ALIGN", (0, 0), (0, -1), "RIGHT"),
                ("ALIGN", (1, 0), (1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
