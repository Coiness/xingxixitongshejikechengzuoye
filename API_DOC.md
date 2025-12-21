# 📡 手势识别音乐播放器 - 后端接口文档

本文档定义了嵌入式后端（手势识别模块）与前端音乐播放器之间的 WebSocket 通信协议。

## 1. 连接信息

*   **协议**: WebSocket (`ws://`)
*   **默认地址**: `localhost` (前端默认连接本地)
*   **默认端口**: `8080`
*   **连接方向**: 前端作为客户端 (Client)，主动连接后端 WebSocket 服务器 (Server)。

> **注意**: 如果后端运行在不同的 IP 或端口，请通知前端修改连接配置。

## 2. 通信协议

### 2.1 数据格式
所有通信数据均采用 **JSON** 格式。

### 2.2 心跳机制 (可选)
前端会定期（约30秒）发送心跳包以保持连接活跃。后端可选择忽略或原样返回。
*   **前端发送**: `{"type": "ping"}`

## 3. 控制指令 (后端 -> 前端)

当识别到手势时，后端需要向前端发送包含 `action` 字段的 JSON 数据包。

### 通用数据结构
```json
{
  "action": "指令代码",
  "timestamp": 1678900000  // (可选) 时间戳，毫秒
}
```

### 支持的指令列表

| 动作 | 指令代码 (`action`) | 说明 |
| :--- | :--- | :--- |
| **播放/暂停** | `play_pause` | 切换当前的播放状态 |
| **上一首** | `previous` | 切换到播放列表中的上一首歌曲 |
| **下一首** | `next` | 切换到播放列表中的下一首歌曲 |
| **切换列表** | `toggle_list` | 打开或关闭播放列表界面 |

### 发送示例

#### 1. 播放/暂停
```json
{
  "action": "play_pause"
}
```

#### 2. 切歌（下一首）
```json
{
  "action": "next"
}
```

#### 3. 切换播放列表显示
```json
{
  "action": "toggle_list"
}
```

## 4. 调试建议
在后端开发完成前，可以使用在线 WebSocket 测试工具或编写简单的模拟脚本进行测试。

### Python 模拟服务器示例 (推荐)
需要安装依赖: `pip install websockets`

```python
import asyncio
import websockets
import json
import random

async def handler(websocket):
    print(f"前端已连接")
    # 模拟周期性发送指令
    try:
        while True:
            await asyncio.sleep(5) # 每5秒发送一次
            actions = ["play_pause", "next", "previous", "toggle_list"]
            cmd = {"action": random.choice(actions)}
            print(f"发送指令: {cmd}")
            await websocket.send(json.dumps(cmd))
    except websockets.exceptions.ConnectionClosed:
        print("连接断开")

async def main():
    print("服务器启动在 ws://localhost:8080")
    async with websockets.serve(handler, "localhost", 8080):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
```

### Node.js 模拟服务器示例
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('前端已连接');
  
  // 模拟发送指令：5秒后切换下一首
  setTimeout(() => {
    console.log('发送 next 指令');
    ws.send(JSON.stringify({ action: 'next' }));
  }, 5000);
});
```
