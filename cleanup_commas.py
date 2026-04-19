#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# Đọc file HTML
with open('e:\\profineCV\\Web_learn_Chinese_pro\\public\\user\\radicals-214.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Loại bỏ dấu phẩy thừa trước mnemonic (ví dụ: ] , mnemonic -> ], mnemonic)
content = re.sub(r"(\]\s*),\s+mnemonic:", r"\1, mnemonic:", content)

# Ghi lại file
with open('e:\\profineCV\\Web_learn_Chinese_pro\\public\\user\\radicals-214.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up extra commas successfully!")
