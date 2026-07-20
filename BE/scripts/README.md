# Scripts

## Fix Duplicate Topup Credits

Nếu phát hiện có giao dịch nạp tiền bị cộng nhiều lần (duplicate), chạy script này để fix:

### Dry Run (chỉ xem, không sửa)
```bash
cd BE
node scripts/fix-duplicate-topup.js --dry-run
```

### Thực hiện fix
```bash
cd BE
node scripts/fix-duplicate-topup.js
```

### Script sẽ:
1. Tìm tất cả transaction bị duplicate (cùng referenceId)
2. Giữ lại transaction đầu tiên (theo thời gian tạo)
3. Xóa các transaction duplicate
4. Trừ số tiền duplicate khỏi balance của user

### Output mẫu:
```
🔍 Finding duplicate transactions...

⚠️  Found 2 topups with duplicate transactions:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Topup ID: 6789abc...
   Duplicate count: 5 transactions
   Total credited: 50,000đ

   ✅ KEEP: tx_001
      Amount: 10,000đ
      Created: 2026-01-01T10:00:00

   ❌ REMOVE (4):
      - tx_002: 10,000đ at 2026-01-01T10:00:01
      - tx_003: 10,000đ at 2026-01-01T10:00:02
      ...

   💰 User user@example.com:
      Balance: 50,000đ → 10,000đ
      Deducted: -40,000đ
```

**⚠️ Lưu ý:** Backup database trước khi chạy script!
