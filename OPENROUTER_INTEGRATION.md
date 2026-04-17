# OpenRouter AI Integration Guide - Vietnamese to Chinese Analysis

## Overview
Tích hợp OpenRouter.ai vào trang phân tích ký tự Việt → Trung với caching MongoDB.

## Quy trình hoạt động

### 1. **Lần đầu tiên User nhập "học"**
```
User Input: "học"
    ↓
Check MongoDB (không có trong cache)
    ↓
Call OpenRouter API with:
  - Prompt: Phân tích từ Việt "học"
  - Response: { chineseCharacter: "學", pinyin: "xué", ... }
    ↓
Save to MongoDB:
  collection: "character_analyses"
  document: { vietnameseWord: "học", chineseCharacter: "學", ... }
    ↓
Display Results
```

### 2. **Lần thứ 2 User nhập "học" lại**
```
User Input: "học"
    ↓
Check MongoDB (tìm thấy trong cache!)
    ↓
Return cached data ngay (very fast)
    ↓
Display Results
    ↓
Track Usage (tăng usageCount)
```

## Setup Instructions

### Step 1: Get OpenRouter API Key
1. Tạo tài khoản tại [openrouter.ai](https://openrouter.ai)
2. Vào Settings → API Keys
3. Copy API key

### Step 2: Cập nhật .env
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3: Kiểm tra Database Collections
MongoDB sẽ tự động tạo collection `character_analyses` với structure:
```json
{
  "_id": ObjectId,
  "vietnameseWord": "học",
  "originalWord": "học",
  "chineseCharacter": "學",
  "chineseWord": "學習",
  "pinyin": "xué",
  "englishMeaning": "to study/learn",
  "vietnameseMeaning": "học",
  "relatedWords": [
    {
      "word": "學生",
      "pinyin": "xuésheng",
      "meaning": "student"
    }
  ],
  "examples": [
    {
      "vietnamese": "Tôi đang học tiếng Trung",
      "chinese": "我正在学中文",
      "pinyin": "wǒ zhèngzài xué zhōngwén"
    }
  ],
  "characterBreakdown": "...",
  "hskLevel": "1",
  "usageContext": "education",
  "createdAt": ISODate,
  "usageCount": 1,
  "lastAccessedAt": ISODate
}
```

## API Endpoints

### 1. Analyze Vietnamese Word
**POST** `/api/character-analysis/analyze`

Request:
```json
{
  "vietnameseWord": "học"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "analysis": { /* full analysis data */ },
    "source": "ai" // hoặc "cache"
  }
}
```

### 2. Get Related Vocabulary
**GET** `/api/character-analysis/related/:character`

Response:
```json
{
  "success": true,
  "data": {
    "related": [ /* array of related analyses */ ],
    "count": 5
  }
}
```

### 3. Track Usage
**POST** `/api/character-analysis/track-usage`

Request:
```json
{
  "analysisId": "ObjectId"
}
```

## Frontend Usage

### JavaScript Functions

#### analyzeCharacter()
Gọi API để phân tích từ Việt nhập vào
```javascript
analyzeCharacter(); // Phân tích từ trong input
```

#### loadDemo(word)
Load demo từ và phân tích
```javascript
loadDemo('học'); // Tự động nhập "học" và phân tích
```

#### clearAnalysis()
Xóa kết quả và reset form
```javascript
clearAnalysis();
```

#### displayResults(data)
Hiển thị kết quả phân tích
```javascript
displayResults(analysisData);
```

## Demo Words Suggestions

```javascript
const demoWords = [
  'học',    // study
  'sách',   // book
  'nhà',    // house
  'bạn',    // friend
  'ngày',   // day
  'nước',   // water/country
  'mẹ',     // mother
  'cha',    // father
  'người',  // person
  'chữ'     // character/letter
];
```

## Caching Strategy

### Automatic Caching
- Mỗi phân tích từ AI tự động lưu vào MongoDB
- Lần sau tìm từ cũ sẽ lấy từ cache thay vì gọi API

### Cache Invalidation
```javascript
// Xóa cache của 1 từ (nếu cần)
db.character_analyses.deleteOne({ vietnameseWord: "học" })

// Xóa toàn bộ cache
db.character_analyses.deleteMany({})
```

### Monitor Cache Usage
```javascript
// Tìm những từ được sử dụng nhiều nhất
db.character_analyses.find().sort({ usageCount: -1 }).limit(10)

// Tìm cache items gần đây
db.character_analyses.find().sort({ lastAccessedAt: -1 }).limit(10)
```

## OpenRouter API Details

### Model Used
- **gpt-3.5-turbo** (cost-effective, fast)
- Có thể upgrade: `gpt-4`, `claude-3-opus`, etc.

### Timeout
- Request timeout: 30 seconds
- Nếu quá lâu → fallback to error handling

### Rate Limiting
OpenRouter có rate limits tùy theo plan. Nếu hit limit:
- Error: `429 Too Many Requests`
- Tự động retry sau 1 minute

## Error Handling

### Scenarios:
1. **API Key không config** → Hiến thị error message
2. **Network error** → Show error + suggest retry
3. **API quota exceeded** → Queue request and retry
4. **Invalid response** → Use fallback parsing

### Error Messages:
```
❌ Phân tích thất bại
⚠️ Vui lòng nhập một từ tiếng Việt
❌ API quota exceeded - Will retry later
❌ Lỗi: Network timeout
```

## Performance Optimization

### Current
- First request: ~2-3 seconds (OpenRouter API call)
- Cached request: ~100ms (MongoDB lookup)

### Future Improvements
- Implement Redis for faster cache
- Batch API requests to OpenRouter
- Pre-populate common words on app startup
- Implement predictive prefetching

## Troubleshooting

### Issue: "Cannot find module ../services/geminiService"
**Solution**: Đảm bảo file services/index.js exports tất cả services

### Issue: API returns HTML error
**Solution**: Check OPENROUTER_API_KEY hợp lệ

### Issue: Slow first-time analysis
**Solution**: 
- Normal (OpenRouter API), không thể tối ưu hóa thêm
- Thử upgrade OpenRouter plan

### Issue: MongoDB connection error
**Solution**: Check MONGODB_URI trong .env

## Testing

### Test with cURL
```bash
curl -X POST http://localhost:3000/api/character-analysis/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"vietnameseWord":"học"}'
```

### Monitor API Calls
Check server logs:
```
[INFO] Calling OpenRouter for: học
[INFO] Saved analysis for học with ID: ...
[INFO] Using cached analysis for: học
```

## Cost Estimation

OpenRouter Pricing (approximate):
- Input: $0.0005 / 1K tokens
- Output: $0.0015 / 1K tokens
- Avg analysis: ~100 tokens → ~$0.0002 per request
- 1000 unique words analyzed: ~$0.20

## Next Steps

1. ✅ Setup OpenRouter API key
2. ✅ Test analyze endpoint
3. ✅ Monitor cache performance
4. ✅ Analyze usage patterns
5. 🔄 Optimize prompts for better results
6. 🔄 Add more languages support
7. 🔄 Implement advanced analytics
