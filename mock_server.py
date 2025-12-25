import asyncio
import websockets
import json
import random
import base64
import os
import time

# --- 配置部分 ---
# 创建用于存储接收到的摄像头画面的目录
# 实际项目中，这些图片可能会被送入模型进行推理，而不是保存到硬盘
OUTPUT_DIR = "received_frames"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# 安装依赖提示: 需要运行 `pip install websockets`

async def handler(websocket):
    """
    处理 WebSocket 连接的接收逻辑
    """
    print(f"前端已连接: {websocket.remote_address}")
    
    try:
        # 循环读取 WebSocket 消息
        async for message in websocket:
            try:
                # 尝试解析 JSON 消息
                data = json.loads(message)
                
                # --- 处理摄像头画面 ---
                if data.get("type") == "camera_frame":
                    # 获取 Base64 编码的图像数据
                    image_data = data.get("data")
                    timestamp = data.get("timestamp")
                    
                    if image_data:
                        # 1. 清洗数据：去除 data URL scheme 前缀 (如 "data:image/jpeg;base64,")
                        if "base64," in image_data:
                            header, encoded = image_data.split("base64,", 1)
                        else:
                            encoded = image_data
                            
                        # 2. 解码并保存
                        # 注意：为了演示方便，这里我们覆盖保存为同一个文件 'latest_frame.jpg'
                        # 如果需要保存所有帧，可以使用 timestamp 命名，如 f"frame_{timestamp}.jpg"
                        filename = f"{OUTPUT_DIR}/latest_frame.jpg"
                        
                        # 将 Base64 字符串解码为二进制数据并写入文件
                        with open(filename, "wb") as f:
                            f.write(base64.b64decode(encoded))
                            
                        # 打印日志 (可选：为了避免刷屏，可以注释掉或减少频率)
                        print(f"收到摄像头画面: {len(encoded)} bytes -> {filename}")
                        
                        # --- 在此处添加手势识别逻辑 ---
                        # 例如: result = gesture_model.predict(filename)
                        # if result == 'next': await websocket.send(...)
                
                # --- 处理其他消息 ---
                else:
                    print(f"收到普通消息: {message}")
                    
            except json.JSONDecodeError:
                print(f"收到非JSON消息: {message}")
            except Exception as e:
                print(f"处理消息出错: {e}")
            
    except websockets.exceptions.ConnectionClosed:
        print("连接断开")

async def periodic_sender(websocket):
    """
    模拟后端主动发送指令的协程
    用于模拟：后端识别到手势后，通知前端执行操作 (如切歌、暂停)
    """
    # 模拟可用的手势指令列表
    commands = ["play_pause", "next", "previous", "toggle_list"]
    try:
        while True:
            # 每隔 10 秒随机发送一个指令，用于测试前端响应
            await asyncio.sleep(10) 
            action = random.choice(commands)
            
            # 构造发送给前端的消息格式
            data = {"action": action}
            
            print(f"模拟后端发送手势指令: {action}")
            await websocket.send(json.dumps(data))
            
    except websockets.exceptions.ConnectionClosed:
        # 连接断开时退出循环
        pass

async def main_handler(websocket):
    """
    WebSocket 连接的主入口
    同时启动“接收循环”和“发送循环”
    """
    # 创建并发任务
    sender_task = asyncio.create_task(periodic_sender(websocket))
    receiver_task = asyncio.create_task(handler(websocket))
    
    # 等待任一任务结束（通常是因为连接断开，receiver_task 会结束）
    done, pending = await asyncio.wait(
        [sender_task, receiver_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
    
    # 取消剩余未完成的任务 (例如接收循环结束了，发送循环也应该停止)
    for task in pending:
        task.cancel()

async def main():
    """
    启动 WebSocket 服务器
    """
    print("启动 WebSocket 服务器在 ws://localhost:8080")
    # 监听 localhost:8080
    async with websockets.serve(main_handler, "localhost", 8080):
        await asyncio.Future()  # 保持运行，直到被 Ctrl+C 中断

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n服务器停止")
