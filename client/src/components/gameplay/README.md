# GamePlay 组件拆分说明

这个文件夹包含了从原来的 `GamePlay.tsx` 拆分出来的子组件，用于提高代码的可维护性和可复用性。

## 组件结构

### 基础组件
- **PlayerInfo.tsx** - 玩家信息组件，显示头像、姓名和角色
- **PrivateInfo.tsx** - 私人信息纸条组件，显示角色特定的秘密信息

### 游戏阶段组件
- **EventDisplay.tsx** - 1. 事件展示阶段组件
- **InfoAndOptions.tsx** - 2. 信息和选项展示阶段组件  
- **Discussion.tsx** - 3. 讨论阶段组件
- **Selection.tsx** - 4. 选择确认阶段组件

### 模态框组件
- **EventModal.tsx** - 事件详情模态框组件
- **PrivateModal.tsx** - 私人信息详情模态框组件

### 导出文件
- **index.ts** - 统一导出所有组件的入口文件

## 使用方式

在主 `GamePlay.tsx` 组件中通过以下方式导入：

```typescript
import {
  EventDisplay,
  InfoAndOptions,
  Discussion,
  Selection,
  EventModal,
  PrivateModal,
} from "./gameplay/index";
```

## 拆分原则

1. **单一职责** - 每个组件只负责一个特定的功能或阶段
2. **可复用** - 通过 props 传递数据，组件可以在不同场景下复用
3. **易维护** - 代码结构清晰，便于后续维护和扩展
4. **接口统一** - 所有组件都通过 props 接收数据和回调函数

## 组件关系

```
GamePlay (主组件)
├── EventDisplay (事件展示)
├── InfoAndOptions (信息选项)
│   ├── PlayerInfo (玩家信息)
│   └── PrivateInfo (私人信息)
├── Discussion (讨论阶段)
├── Selection (选择阶段)
│   ├── PlayerInfo (玩家信息)
│   └── 私人信息卡片 (内联版本)
├── EventModal (事件详情弹窗)
└── PrivateModal (私人信息详情弹窗)
```

这样的拆分使得代码更加模块化，每个组件都可以独立开发、测试和维护。
