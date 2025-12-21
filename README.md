# 🎵 手势识别音乐播放器 (前端展示系统)

## 📖 项目简介
本项目是**信息系统设计课程作业**的前端展示部分。
它作为一个**手势识别结果的应用Demo**，实现了一个基于Web的音乐播放器。系统通过 WebSocket 实时接收来自嵌入式板载后端的控制指令，实现了无接触式的音乐控制体验。

## 🛠️ 技术栈
- **核心框架**: React 18 + TypeScript + Vite
- **UI 样式**: Tailwind CSS
- **数据存储**: IndexedDB (浏览器本地存储，支持大文件/二进制存储)
- **通信协议**: WebSocket (用于接收后端手势指令)

## ✨ 主要功能
1.  **本地音乐库**:
    *   支持用户上传本地音频文件。
    *   使用 IndexedDB 持久化存储，刷新页面数据不丢失。
2.  **手势远程控制**:
    通过 WebSocket 连接后端 (`ws://localhost:8080`)，响应以下手势指令：
    *   ⏯️ **播放/暂停** (`play_pause`)
    *   ⏮️ **上一首** (`previous`)
    *   ⏭️ **下一首** (`next`)
    *   📂 **打开/关闭列表** (`toggle_list`)
3.  **现代化界面**:
    *   简洁美观的播放器 UI。
    *   包含唱片旋转动画、进度条实时更新等交互细节。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动前端
```bash
npm run dev
```

### 3. 后端对接说明
前端启动后会自动尝试连接 `ws://localhost:8080`。
请确保嵌入式开发板或后端模拟服务已在同一网络环境下启动 WebSocket 服务。

---
*Created for Information System Design Course Assignment.*
