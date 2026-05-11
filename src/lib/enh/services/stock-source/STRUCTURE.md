# Stock Source 目录结构

```
stock-source/
│
├── common/                    # 公共模块
│   ├── types.ts               # 类型定义
│   │   ├── StockQuote         # 股票行情接口
│   │   ├── StockSearchResult  # 搜索结果接口
│   │   ├── DataSource         # 数据源类型
│   │   └── StockSourceInterface # 数据源接口
│   │
│   └── utils.ts               # 工具函数
│       ├── convertToTencentCode()   # 转换为腾讯代码格式
│       ├── convertToSinaCode()      # 转换为新浪代码格式
│       ├── convertToEastmoneyCode() # 转换为东方财富代码格式
│       ├── parseGBKText()           # 解析GBK编码
│       ├── parseStockCodeFromMarket() # 解析股票代码
│       └── sleep()                 # 延迟函数
│
├── sources/                   # 数据源实现
│   │
│   ├── tencent/               # 腾讯数据源
│   │   └── index.ts
│   │       ├── TencentStockSource
│   │       ├── getQuote()      # 获取单个股票行情
│   │       ├── getQuotes()     # 批量获取行情
│   │       ├── search()        # 搜索股票
│   │       └── isAvailable()   # 检查可用性
│   │
│   ├── sina/                  # 新浪数据源
│   │   └── index.ts
│   │       ├── SinaStockSource
│   │       ├── getQuote()
│   │       ├── getQuotes()
│   │       ├── search()
│   │       └── isAvailable()
│   │
│   └── eastmoney/             # 东方财富数据源
│       └── index.ts
│           ├── EastmoneyStockSource
│           ├── getQuote()
│           ├── getQuotes()
│           ├── search()
│           └── isAvailable()
│
├── index.ts                   # 主管理器
│   ├── StockSourceManager     # 数据源管理器
│   ├── stockSource            # 默认实例
│   ├── getStockQuote()        # 导出函数
│   ├── getStockQuotes()       # 导出函数
│   └── searchStock()          # 导出函数
│
└── README.md                  # 文档
```

## 模块职责

### common/
存放公共代码，包括类型定义和工具函数。

### sources/
存放具体的数据源实现，每个数据源一个子目录。

### index.ts
主入口，提供统一的管理器和导出函数。

## 使用方式

```typescript
// 方式 1: 使用导出的函数（推荐）
import { getStockQuote, searchStock } from './stock-source';

// 方式 2: 使用管理器实例
import { stockSource } from './stock-source';

// 方式 3: 创建自定义管理器
import { StockSourceManager } from './stock-source';
const manager = new StockSourceManager({
  preferOrder: ['sina', 'tencent', 'eastmoney']
});
```
