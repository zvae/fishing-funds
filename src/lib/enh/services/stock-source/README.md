# Stock Source - 多数据源股票数据封装

## 概述

`stock-source` 模块提供了统一的股票数据获取接口，支持多个数据源自动切换和兜底。

## 目录结构

```
stock-source/
  ├── common/              (通用模块)
  │   ├── types.ts         (类型定义)
  │   └── utils.ts         (工具函数)
  ├── sources/             (数据源实现)
  │   ├── tencent/         (腾讯数据源)
  │   │   └── index.ts
  │   ├── sina/            (新浪数据源)
  │   │   └── index.ts
  │   └── eastmoney/       (东方财富数据源)
  │   │   └── index.ts
  ├── index.ts             (主管理器：自动兜底)
  └── README.md            (文档)
```

## 支持的数据源

| 数据源 | 描述 | 支持市场 | 特点 |
|--------|------|----------|------|
| **Tencent（腾讯）** | 腾讯财经 | A股、港股、美股 | 速度快、稳定 |
| **Sina（新浪）** | 新浪财经 | A股、港股、美股 | 数据全面 |
| **Eastmoney（东方财富）** | 东方财富 | 仅A股 | JSON格式、易解析 |

## 自动兜底机制

默认优先级：`Tencent` → `Sina` → `Eastmoney`

当一个数据源失败时，自动切换到下一个数据源，确保数据获取成功率。

## 快速开始

### 1. 获取单个股票行情

```typescript
import { getStockQuote } from '@/lib/enh/services/stock-source';

const quote = await getStockQuote('600519');
console.log(quote);
// {
//   code: '600519',
//   name: '贵州茅台',
//   market: 'SH',
//   now: 1850.00,
//   yesterday: 1840.00,
//   high: 1860.00,
//   low: 1835.00,
//   change: 10.00,
//   changePercent: 0.54,
//   time: '2025-05-09 15:00:00'
// }
```

### 2. 批量获取股票行情

```typescript
import { getStockQuotes } from '@/lib/enh/services/stock-source';

const quotes = await getStockQuotes(['600519', '000651', '000001']);
console.log(quotes);
```

### 3. 搜索股票

```typescript
import { searchStock } from '@/lib/enh/services/stock-source';

const results = await searchStock('茅台');
console.log(results);
// [
//   { code: '600519', name: '贵州茅台', market: 'SH', type: '上交所' },
//   { code: '600519.SH', name: '贵州茅台', market: 'SH', type: '上交所' }
// ]
```

### 4. 指定数据源

```typescript
import { getStockQuote } from '@/lib/enh/services/stock-source';

// 优先使用新浪数据源
const quote = await getStockQuote('600519', 'sina');

// 如果新浪失败，会自动切换到腾讯和东方财富
```

### 5. 使用 StockSourceManager

```typescript
import { StockSourceManager } from '@/lib/enh/services/stock-source';

const manager = new StockSourceManager({
  preferOrder: ['sina', 'tencent', 'eastmoney'],
  retryTimes: 2
});

const quote = await manager.getQuote('600519');
```

## API 文档

### getStockQuote(code: string, preferredSource?: DataSource)

获取单个股票行情。

**参数：**
- `code`: 股票代码（支持多种格式：`600519`、`sh600519`、`1.600519`）
- `preferredSource`: 优先使用的数据源（可选）

**返回：** `Promise<StockQuote | null>`

### getStockQuotes(codes: string[], preferredSource?: DataSource)

批量获取股票行情。

**参数：**
- `codes`: 股票代码数组
- `preferredSource`: 优先使用的数据源（可选）

**返回：** `Promise<StockQuote[]>`

### searchStock(keyword: string, preferredSource?: DataSource)

搜索股票。

**参数：**
- `keyword`: 搜索关键词
- `preferredSource`: 优先使用的数据源（可选）

**返回：** `Promise<StockSearchResult[]>`

### getAvailableSources()

获取当前可用的数据源列表。

**返回：** `Promise<DataSource[]>`

## 类型定义

### StockQuote

```typescript
interface StockQuote {
  code: string;          // 股票代码
  name: string;          // 股票名称
  market: string;        // 市场（SH、SZ、HK、US）
  now: number;           // 当前价格
  yesterday: number;     // 昨收价格
  high: number;          // 最高价
  low: number;           // 最低价
  change: number;        // 涨跌额
  changePercent: number; // 涨跌幅（%）
  volume?: number;       // 成交量
  amount?: number;       // 成交额
  time: string;          // 时间戳
}
```

### StockSearchResult

```typescript
interface StockSearchResult {
  code: string;     // 股票代码
  name: string;     // 股票名称
  market: string;   // 市场
  type?: string;    // 类型
}
```

### DataSource

```typescript
type DataSource = 'tencent' | 'sina' | 'eastmoney';
```

## 股票代码格式

封装层会自动识别和转换不同的股票代码格式：

| 输入格式 | 自动转换 |
|----------|----------|
| `600519` | 腾讯: `sh600519`<br>新浪: `sh600519`<br>东方财富: `1.600519` |
| `sh600519` | 自动识别市场前缀 |
| `1.600519` | 自动识别东方财富格式 |
| `000651` | 自动识别深交所代码 |

## 错误处理

所有方法都内置了错误处理和自动重试机制：

1. 单个数据源失败时，自动切换到下一个数据源
2. 所有数据源都失败时，返回 `null` 或空数组
3. 错误信息会输出到控制台，便于调试

## 性能优化建议

1. **使用批量查询**：尽量使用 `getStockQuotes` 而非多次调用 `getStockQuote`
2. **添加缓存**：建议在业务层添加短时缓存（5-10秒）
3. **选择合适的数据源**：
   - 需要港股/美股：腾讯或新浪
   - 仅需A股：东方财富（JSON格式更易处理）
   - 自动兜底：不指定数据源

## 扩展数据源

可以轻松添加新的数据源：

```typescript
import { StockSourceInterface, StockSourceManager } from './stock-source';

class MyCustomSource implements StockSourceInterface {
  name = 'custom' as const;
  
  async getQuote(code: string) {
    // 实现获取行情逻辑
  }
  
  async getQuotes(codes: string[]) {
    // 实现批量获取逻辑
  }
  
  async search(keyword: string) {
    // 实现搜索逻辑
  }
  
  async isAvailable() {
    // 检查数据源是否可用
  }
}

const manager = new StockSourceManager();
manager.addSource('custom', new MyCustomSource());
```

## 注意事项

1. **编码问题**：腾讯和新浪接口返回 GBK/GB18030 编码，封装层已自动处理
2. **请求频率**：第三方接口有频率限制，建议添加缓存和限流
3. **数据准确性**：数据来自第三方，不保证100%准确，关键业务请交叉验证
4. **Referer 要求**：部分接口需要 Referer 请求头，封装层已自动添加

## 测试

```bash
# 测试所有数据源可用性
npm run test:stock-source
```

## 更新日志

### v1.0.0 (2025-05-09)
- 初始版本
- 支持腾讯、新浪、东方财富三个数据源
- 实现自动兜底机制
- 统一的 API 接口
