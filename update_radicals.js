const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'user', 'radicals-214.html');
let content = fs.readFileSync(filePath, 'utf8');

const vietnameseMapping = {
  1: 'NHẤT', 2: 'CỔN', 3: 'CHỦ', 4: 'PHIỆT', 5: 'ẤT', 6: 'QUYẾT', 7: 'NHỊ', 8: 'ĐẦU', 9: 'NHÂN', 10: 'NHI',
  11: 'NHẬP', 12: 'BÁT', 13: 'QUYNH', 14: 'MỊCH', 15: 'BĂNG', 16: 'KỶ', 17: 'KHẢM', 18: 'ĐAO', 19: 'LỰC', 20: 'BAO',
  21: 'CHỦY', 22: 'PHƯƠNG', 23: 'HỆ', 24: 'THẬP', 25: 'BỐC', 26: 'TIẾT', 27: 'HÁN', 28: 'TƯ', 29: 'HỰU', 30: 'KHẨU',
  31: 'VI', 32: 'THỔ', 33: 'SĨ', 34: 'TRĨ', 35: 'TUY', 36: 'TỊCH', 37: 'ĐẠI', 38: 'NỮ', 39: 'TỬ', 40: 'MIÊN',
  41: 'THỐN', 42: 'TIỂU', 43: 'UÔNG', 44: 'THI', 45: 'TRIỆT', 46: 'SƠN', 47: 'XUYÊN', 48: 'CÔNG', 49: 'KỶ', 50: 'CÂN',
  51: 'CAN', 52: 'YÊU', 53: 'NGHIỄM', 54: 'DẪN', 55: 'CỦNG', 56: 'DẶC', 57: 'CUNG', 58: 'KỆ', 59: 'SAM', 60: 'XÍCH',
  61: 'TÂM', 62: 'QUA', 63: 'HỘ', 64: 'THỦ', 65: 'CHI', 66: 'PHỘC', 67: 'VĂN', 68: 'ĐẨU', 69: 'CÂN', 70: 'PHƯƠNG',
  71: 'VÔ', 72: 'NHẬT', 73: 'VIẾT', 74: 'NGUYỆT', 75: 'MỘC', 76: 'KHIẾM', 77: 'CHỈ', 78: 'ĐÃI', 79: 'THÙ', 80: 'VÔ',
  81: 'TỶ', 82: 'MAO', 83: 'THỊ', 84: 'KHÍ', 85: 'THỦY', 86: 'HỎA', 87: 'TRẢO', 88: 'PHỤ', 89: 'HÀO', 90: 'TƯỜNG',
  91: 'PHIẾN', 92: 'NHA', 93: 'NGƯU', 94: 'KHUYỂN', 95: 'HUYỀN', 96: 'NGỌC', 97: 'QUA', 98: 'NGÕA', 99: 'CAM', 100: 'SINH',
  101: 'DỤNG', 102: 'ĐIỀN', 103: 'THẤT', 104: 'NẠCH', 105: 'BÁT', 106: 'BẠCH', 107: 'BÌ', 108: 'MÃNH', 109: 'MỤC', 110: 'MÂU',
  111: 'THỈ', 112: 'THẠCH', 113: 'THỊ', 114: 'NHỰU', 115: 'HÒA', 116: 'HUYỆT', 117: 'LẬP', 118: 'TRÚC', 119: 'MỄ', 120: 'MỊCH',
  121: 'PHẪU', 122: 'VÕNG', 123: 'DƯƠNG', 124: 'VŨ', 125: 'LÃO', 126: 'NHI', 127: 'LÔI', 128: 'NHĨ', 129: 'DUẬT', 130: 'NHỤC',
  131: 'THẦN', 132: 'TỰ', 133: 'CHÍ', 134: 'CỬU', 135: 'THIỆT', 136: 'SUYỄN', 137: 'CHU', 138: 'CẤN', 139: 'SẮC', 140: 'THẢO',
  141: 'HÔ', 142: 'TRÙNG', 143: 'HUYẾT', 144: 'HÀNH', 145: 'Y', 146: 'Á', 147: 'KIẾN', 148: 'GIÁC', 149: 'NGÔN', 150: 'CỐC',
  151: 'ĐẬU', 152: 'THỈ', 153: 'TRĨ', 154: 'BỐI', 155: 'XÍCH', 156: 'TẨU', 157: 'TÚC', 158: 'THÂN', 159: 'XA', 160: 'TÂN',
  161: 'THÌN', 162: 'SƯỚC', 163: 'ẤP', 164: 'DẬU', 165: 'BIỆN', 166: 'LÝ', 167: 'KIM', 168: 'TRƯỜNG', 169: 'MÔN', 170: 'PHỤ',
  171: 'ĐÃI', 172: 'TRUY', 173: 'VŨ', 174: 'THANH', 175: 'PHI', 176: 'DIỆN', 177: 'CÁCH', 178: 'VI', 179: 'PHỈ/CỬU', 180: 'ÂM',
  181: 'HIỆT', 182: 'PHONG', 183: 'PHI', 184: 'THỰC', 185: 'THỦ', 186: 'HƯƠNG', 187: 'MÃ', 188: 'CỐT', 189: 'CAO', 190: 'BƯU',
  191: 'ĐẤU', 192: 'SƯỞNG', 193: 'CÁCH', 194: 'QUỶ', 195: 'NGƯ', 196: 'ĐIỂU', 197: 'LỖ', 198: 'LỘC', 199: 'MẠCH', 200: 'MA',
  201: 'HOÀNG', 202: 'THỬ', 203: 'HẮC', 204: 'CHỈ', 205: 'MÃNH', 206: 'ĐỈNH', 207: 'CỔ', 208: 'THỬ', 209: 'TỲ', 210: 'TỀ',
  211: 'XỈ', 212: 'LONG', 213: 'QUY', 214: 'DƯỢC'
};

for (const [number, name] of Object.entries(vietnameseMapping)) {
  const regex = new RegExp(`({ number: ${number}, char: '[^']+', pinyin:\\s+'[^']+', meaning: '[^']+')`, 'g');
  const replacement = `$1, vietnameseName: '${name}'`;
  content = content.replace(regex, replacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
