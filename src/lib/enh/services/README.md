# @lib/enh/services

这个模块是 fishing-funds 应用的核心数据服务层，为整个应用提供统一的 API 调用接口。

## 模块结构

### 1. Fund (基金服务)
- `FromEastmoney(code)` - 从东方财富获取基金数据
- `GetFixFromEastMoney(fundcode)` - 获取基金净值修正数据
- `GetFundInfoByNameFromEaseMoney(name)` - 通过名称搜索基金
- `GetRemoteFundsFromEastmoney()` - 获取远程基金列表
- `GetFundRatingFromEasemoney()` - 获取基金评级
- `GetIndustryRateFromEaseMoney(code)` - 获取行业配置比例
- `GetFundManagerDetailFromEastMoney(managerId)` - 获取基金经理详情
- `GetFundDetailFromEastmoney(code)` - 获取基金详细信息
- `GetStockWareHouseFromEastmoney(code, stockCodes)` - 获取股票持仓
- `GetSecuritiesWareHouseFromEastmoney(code, securitiesCodes)` - 获取债券持仓

### 2. Stock (股票服务)
- `FromEastmoney(secid)` - 获取股票基本信息
- `SearchFromEastmoney(keyword)` - 搜索股票
- `GetIndustryFromEastmoney(secid, type)` - 获取行业信息
- `GetStockRank(fsCode)` - 获取股票排行
- `GetMainRankFromEastmoney(dayType)` - 获取主力排行
- `GetNorthRankFromEastmoney(dayType)` - 获取北向排行
- `GetDetailFromEastmoney(secid)` - 获取股票详情
- `GetTrendFromEastmoney(secid)` - 获取分时走势
- `GetKFromEastmoney(secid, kCode, timeCode)` - 获取K线数据
- `GetStockHoldFunds(secid, date)` - 获取持股基金
- `GetABCompany(secid)` - 获取A股公司信息
- `GetHKCompany/GetUSCompany/GetXSBCompany` - 获取不同市场公司信息

### 3. Quotation (行情服务)
- `GetQuotationsFromEastmoney(type, page)` - 获取板块列表
- `GetFlowFromEastmoney(fields1, code)` - 获取资金流向
- `GetFundFlowFromEastmoney(code, type)` - 获取板块资金流
- `GetQuotationDetailFromEastmoney(code)` - 获取板块详情
- `GetRecentHotFromEastmoney()` - 获取近期热门
- `GetTodayHotFromEastmoney()` - 获取今日热门
- `GetShanghaiGoldGoodsFromEastmoney()` - 获取上海黄金现货
- `GetRealTimeFundFlowFromEasymoney(secid)` - 获取实时资金流

### 4. Zindex (指数服务)
- `FromEastmoney(code)` - 获取指数基本信息
- `GetKFromEastmoney(code, year, k)` - 获取指数K线
- `GetTrendFromEastmoney(code, trendCode)` - 获取指数走势
- `GetEconomyIndexFromEastmoney(reportName, fields)` - 获取经济指标
- `GetTreasuryYieldData()` - 获取国债收益率
- `GetNationalTeamDistributed/Detail/Trend` - 国家队相关数据

### 5. Coin (加密货币服务)
- `GetRemoteCoinsFromCoingecko()` - 获取加密货币列表
- `GetDetailFromCoingecko(code)` - 获取加密货币详情
- `FromCoingecko(ids, unit)` - 获取加密货币价格
- `GetHistoryFromCoingecko(code, unit, date)` - 获取历史数据
- `GetKFromCoingecko(code, unit, date)` - 获取K线数据
- `FromCoinCap(ids, unit)` - 从CoinCap获取数据

### 6. Time (时间服务)
- `GetCurrentDateTimeFromTaobao()` - 从淘宝获取网络时间
- `GetCurrentDateTimeFromSuning()` - 从苏宁获取网络时间

### 7. Exchange (汇率服务)
- `GetListFromEastmoney(type, params)` - 获取汇率列表
- `GetGlobalBondFromEastmoney()` - 获取全球债券数据

### 8. News (新闻服务)
- `GetRecent(keyword, pageIndex, filter)` - 搜索新闻
- `GetLiveList()` - 获取实时新闻
- `GetUsaList/GetJpList/GetUkList/GetEuList/GetGlobalList/GetChinaList` - 各地区新闻
- `GetExchangeList/GetBondList/GetFundList/GetFocusList/GetListedList/GetGoodsList` - 分类新闻
- `GetGuBaList(keyword, type)` - 获取股吧数据

### 9. Log (日志服务)
- `GetLog()` - 获取更新日志

## 数据源说明

主要数据源包括：
- 东方财富网 (Eastmoney)
- 天天基金
- CoinGecko
- CoinCap
- 淘宝/苏宁时间API
- GitHub更新日志

## 技术特点

1. **异步设计**：所有方法返回 Promise，支持异步调用
2. **类型安全**：完整的 TypeScript 类型定义
3. **错误处理**：统一的错误处理机制
4. **数据格式化**：统一的数据格式转换

## 使用示例

```typescript
import * as Services from '@lib/enh/services';

// 获取基金数据
const fund = await Services.Fund.FromEastmoney('320007');

// 获取股票数据
const stock = await Services.Stock.FromEastmoney('1.600519');

// 获取加密货币数据
const coins = await Services.Coin.FromCoingecko('bitcoin,ethereum', 'usd');

// 获取网络时间
const time = await Services.Time.GetCurrentDateTimeFromTaobao();
```

## 注意事项

1. 本模块是基于代码使用情况逆向推导生成的
2. 部分方法可能需要进一步完善实际业务逻辑
3. API 接口地址可能随时变化，需要定期维护
4. 部分接口可能需要代理或特殊处理才能访问