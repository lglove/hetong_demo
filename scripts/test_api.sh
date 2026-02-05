#!/bin/bash
# 接口与流程自测脚本
set -e
BASE="http://localhost:8000/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo "=== 1. 管理员登录 ==="
R=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}')
TOKEN_ADMIN=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
[ -n "$TOKEN_ADMIN" ] && ok "admin login" || fail "admin login"

echo "=== 2. 未登录访问合同列表 -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/contracts")
[ "$CODE" = "401" ] && ok "contracts without token -> 401" || fail "expected 401 got $CODE"

echo "=== 3. 创建财务用户与普通用户 ==="
F=$(curl -s -X POST "$BASE/users" -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" -d '{"username":"finance1","password":"f123","role":"finance"}')
echo "$F" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('username')=='finance1' or 'detail' in d" && ok "create finance user" || fail "create finance"
N=$(curl -s -X POST "$BASE/users" -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" -d '{"username":"normal1","password":"n123","role":"normal"}')
echo "$N" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('username')=='normal1' or 'detail' in d" && ok "create normal user" || fail "create normal"

echo "=== 4. 普通用户登录并创建合同 ==="
R=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"username":"normal1","password":"n123"}')
TOKEN_NORMAL=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
[ -n "$TOKEN_NORMAL" ] && ok "normal login" || fail "normal login"
R=$(curl -s -X POST "$BASE/contracts" -H "Authorization: Bearer $TOKEN_NORMAL" -H "Content-Type: application/json" -d '{"title":"测试合同","contract_no":"HT001","party_a":"甲方","party_b":"乙方","amount":10000,"status":"draft"}')
CONTRACT_ID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
[ -n "$CONTRACT_ID" ] && ok "create contract id=$CONTRACT_ID" || fail "create contract"
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "draft" ] && ok "contract status draft" || fail "status $STATUS"

echo "=== 5. 普通用户提交审批 ==="
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/submit" -H "Authorization: Bearer $TOKEN_NORMAL")
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "pending_finance" ] && ok "submit -> pending_finance" || fail "submit status $STATUS"

echo "=== 6. 普通用户撤回 ==="
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/withdraw-by-creator" -H "Authorization: Bearer $TOKEN_NORMAL")
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "draft" ] && ok "withdraw by creator -> draft" || fail "withdraw creator $STATUS"

echo "=== 7. 再次提交，财务审批通过 ==="
curl -s -X POST "$BASE/contracts/$CONTRACT_ID/submit" -H "Authorization: Bearer $TOKEN_NORMAL" > /dev/null
R=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"username":"finance1","password":"f123"}')
TOKEN_FINANCE=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/approve-finance" -H "Authorization: Bearer $TOKEN_FINANCE" -H "Content-Type: application/json" -d '{}')
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "finance_approved" ] && ok "finance approve -> finance_approved" || fail "finance approve $STATUS"

echo "=== 8. 财务撤回 ==="
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/withdraw-by-finance" -H "Authorization: Bearer $TOKEN_FINANCE")
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "pending_finance" ] && ok "withdraw by finance -> pending_finance" || fail "withdraw finance $STATUS"

echo "=== 9. 财务再次审批，管理员终审通过 ==="
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/approve-finance" -H "Authorization: Bearer $TOKEN_FINANCE" -H "Content-Type: application/json" -d '{}')
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "finance_approved" ] && ok "finance approve again" || fail "finance approve again"
R=$(curl -s -X POST "$BASE/contracts/$CONTRACT_ID/approve-admin" -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" -d '{}')
STATUS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS" = "active" ] && ok "admin approve -> active" || fail "admin approve $STATUS"

echo "=== 10. 合同操作日志与全局操作日志 ==="
N=$(curl -s "$BASE/contracts/$CONTRACT_ID/operations" -H "Authorization: Bearer $TOKEN_ADMIN" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$N" -ge "6" ] && ok "contract operations count >= 6 (got $N)" || fail "operations count $N"
TOTAL=$(curl -s "$BASE/operations?limit=5" -H "Authorization: Bearer $TOKEN_ADMIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))")
[ "$TOTAL" -ge "1" ] && ok "global operations total >= 1 (got $TOTAL)" || fail "global ops $TOTAL"

echo "=== 11. 财务访问用户管理 -> 403 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users" -H "Authorization: Bearer $TOKEN_FINANCE")
[ "$CODE" = "403" ] && ok "finance /users -> 403" || fail "finance users $CODE"

echo "=== 12. 修改密码 ==="
curl -s -X POST "$BASE/auth/change-password" -H "Authorization: Bearer $TOKEN_NORMAL" -H "Content-Type: application/json" -d '{"current_password":"n123","new_password":"n456"}' -w "%{http_code}" | grep -q 204 && ok "change password 204" || fail "change password"
R=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"username":"normal1","password":"n456"}')
[ -n "$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")" ] && ok "login with new password" || fail "login new password"

echo ""
echo -e "${GREEN}=== 全部 12 项检查通过 ===${NC}"
