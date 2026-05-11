# addStockAction 调用链路分析

本文档记录了 `addStockAction` 从触发到最终存储的完整调用链路。

## 调用链路图

```
StockSearch/index.tsx (L53)
    ↓ dispatch(addStockAction({...}))
    
store/features/stock.ts (L44-59)
    ↓ addStockAction (createAsyncThunk)
    ↓ Helpers.Base.Add() 添加股票到 stockConfig
    ↓ dispatch(setStockConfigAction({config, walletCode}))
    
store/features/stock.ts (L111-127)
    ↓ setStockConfigAction (createAsyncThunk)
    ↓ 更新 walletConfig 中对应钱包的 stocks 数组
    ↓ dispatch(setWalletConfigAction(newWalletConfig))
    
store/features/wallet.ts (L176-184)
    ↓ setWalletConfigAction (createAsyncThunk)
    ↓ dispatch(syncWalletsConfigAction({walletConfig, codeMap}))
    
store/features/wallet.ts (L82-95)
    ↓ syncWalletsConfigAction (reducer)
    ↓ 更新 Redux state: state.config.walletConfig
    
store/listeners/config.listener.ts (L39-42)
    ↓ listenerMiddleware 监听 syncWalletsConfigAction
    ↓ electronStore.set('config', 'WALLET_SETTING', action.payload.walletConfig)
    
【最终存储位置】
Tauri Store 插件 → config.json 文件
Key: 'WALLET_SETTING'
```

## 各层详细说明

### 1. 触发层 - StockSearch/index.tsx

**文件路径**: `src/renderer/components/Toolbar/AppCenterContent/StockSearch/index.tsx`

用户在股票搜索界面点击"自选"按钮时触发：

```typescript
const onAdd = async (secid: string, type: number) => {
  const stock = await Helpers.Stock.GetStock(secid);
  if (stock) {
    dispatch(
      addStockAction({
        market: stock.market,
        code: stock.code,
        secid: stock.secid,
        name: stock.name,
        type,
        cbj: undefined,
        cyfe: 0,
      })
    );
  }
};
```

### 2. Action 层 - stock.ts

**文件路径**: `src/renderer/store/features/stock.ts`

`addStockAction` 是一个 `createAsyncThunk`，负责：
- 从 Redux state 获取当前钱包配置
- 使用 `Helpers.Base.Add()` 将新股票添加到配置列表
- 调用 `setStockConfigAction` 更新配置

```typescript
export const addStockAction = createAsyncThunk<void, Stock.SettingItem, AsyncThunkConfig>(
  'stock/addStockAction',
  (stock, { dispatch, getState }) => {
    const { wallet: { currentWalletCode, stockConfig } } = getState();
    const config = Helpers.Base.Add({
      list: Utils.DeepCopy(stockConfig),
      key: 'secid',
      data: stock,
    });
    dispatch(setStockConfigAction({ config, walletCode: currentWalletCode }));
  }
);
```

### 3. 配置更新层 - setStockConfigAction

**文件路径**: `src/renderer/store/features/stock.ts`

`setStockConfigAction` 负责：
- 更新指定钱包的 stocks 配置
- 调用 `setWalletConfigAction` 更新整个钱包配置

```typescript
export const setStockConfigAction = createAsyncThunk<
  void,
  { config: Stock.SettingItem[]; walletCode: string },
  AsyncThunkConfig
>('stock/setStockConfigAction', ({ config, walletCode }, { dispatch, getState }) => {
  const { wallet: { config: { walletConfig }, currentWallet } } = getState();
  
  const newWalletConfig = walletConfig.map((item) => ({
    ...item,
    stocks: walletCode === item.code ? config : item.stocks,
  }));

  dispatch(setWalletConfigAction(newWalletConfig));
  dispatch(updateWalletStateAction(currentWallet));
});
```

### 4. 钱包配置更新层 - wallet.ts

**文件路径**: `src/renderer/store/features/wallet.ts`

`setWalletConfigAction` 负责：
- 生成 codeMap
- 调用 `syncWalletsConfigAction` 同步配置到 Redux state

```typescript
export const setWalletConfigAction = createAsyncThunk<void, Wallet.SettingItem[], AsyncThunkConfig>(
  'wallet/setWalletConfigAction',
  (walletConfig, { dispatch, getState }) => {
    const codeMap = Utils.GetCodeMap(walletConfig, 'code');
    dispatch(syncWalletsConfigAction({ walletConfig, codeMap }));
    dispatch(filterWalletStateAction());
  }
);
```

### 5. Redux State 更新 - syncWalletsConfigAction

**文件路径**: `src/renderer/store/features/wallet.ts`

`syncWalletsConfigAction` 是一个 reducer，负责：
- 更新 Redux state 中的 `config.walletConfig`
- 同时更新相关的 fundConfig 和 stockConfig

```typescript
syncWalletsConfigAction(state, { payload }: PayloadAction<{ walletConfig: Wallet.SettingItem[]; codeMap: Wallet.CodeMap }>) {
  state.config = payload;
  // 同时更新 fundConfig 和 stockConfig...
}
```

### 6. 持久化监听层 - config.listener.ts

**文件路径**: `src/renderer/store/listeners/config.listener.ts`

使用 Redux Listener Middleware 监听 `syncWalletsConfigAction`，当 action 触发时：
- 自动将配置写入到 Tauri Store

```typescript
listenerMiddleware.startListening({
  actionCreator: syncWalletsConfigAction,
  effect: async (action) => {
    electronStore.set('config', CONST.STORAGE.WALLET_SETTING, action.payload.walletConfig);
  },
});
```

### 7. 存储层 - Tauri Store

**相关文件**:
- `src-tauri/src/store.rs` - Rust 端 Store 初始化
- `src/renderer/typings/preload.d.ts` - TypeScript 类型定义

数据最终存储在 Tauri Store 插件中：

| 属性 | 值 |
|------|------|
| Store 类型 | `config` |
| Key | `WALLET_SETTING` |
| 物理文件 | `{app_data_dir}/config.json` |

## 数据结构

### Wallet.SettingItem

```typescript
interface SettingItem {
  name: string;           // 钱包名称
  iconIndex: number;      // 图标索引
  code: string;           // 钱包唯一标识
  funds: Fund.SettingItem[];   // 基金列表
  stocks: Stock.SettingItem[]; // 股票列表
}
```

### Stock.SettingItem

```typescript
interface SettingItem {
  market: number;    // 市场代码
  code: string;      // 股票代码
  secid: string;     // 市场.代码 (如: 1.600000)
  name: string;      // 股票名称
  type: number;      // 股票类型
  cbj?: number;      // 成本价
  cyfe: number;      // 持有份额
}
```

## 关键文件索引

| 文件 | 说明 |
|------|------|
| [StockSearch/index.tsx](../src/renderer/components/Toolbar/AppCenterContent/StockSearch/index.tsx) | 触发点 |
| [stock.ts](../src/renderer/store/features/stock.ts) | Stock Action 定义 |
| [wallet.ts](../src/renderer/store/features/wallet.ts) | Wallet Action 定义 |
| [config.listener.ts](../src/renderer/store/listeners/config.listener.ts) | 持久化监听 |
| [store.rs](../src-tauri/src/store.rs) | Tauri Store 初始化 |
| [preload.d.ts](../src/renderer/typings/preload.d.ts) | electronStore 类型定义 |
| [storage.ts](../src/renderer/constants/storage.ts) | 存储常量定义 |
