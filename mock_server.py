import asyncio
import websockets
import json
import random

# 安装依赖: pip install websockets

async def handler(websocket):
    print(f"前端已连接: {websocket.remote_address}")
    
    try:
        # 保持连接并处理消息
        async for message in websocket:
            print(f"收到消息: {message}")
            
            # 这里简单演示：收到消息后，随机发送一个指令回应，或者你可以写定时任务
            # 实际后端逻辑应该是：手势识别线程 -> 触发发送 -> WebSocket发送
            
            # 模拟：识别到手势，发送指令
            # await websocket.send(json.dumps({"action": "next"}))
            
    except websockets.exceptions.ConnectionClosed:
        print("连接断开")

async def periodic_sender(websocket):
    """
    模拟周期性发送指令的协程
    """
    commands = ["play_pause", "next", "previous", "toggle_list"]
    try:
        while True:
            await asyncio.sleep(10) # 每10秒发送一次
            action = random.choice(commands)
            data = {"action": action}
            print(f"模拟发送手势指令: {action}")
            await websocket.send(json.dumps(data))
    except websockets.exceptions.ConnectionClosed:
        pass

async def main_handler(websocket):
    # 启动发送任务和接收任务
    sender_task = asyncio.create_task(periodic_sender(websocket))
    receiver_task = asyncio.create_task(handler(websocket))
    
    # 等待任一任务结束（通常是连接断开）
    done, pending = await asyncio.wait(
        [sender_task, receiver_task],
        return_when=asyncio.FIRST_COMPLETED,
    )
    
    for task in pending:
        task.cancel()

async def main():
    print("启动 WebSocket 服务器在 ws://localhost:8080")
    async with websockets.serve(main_handler, "localhost", 8080):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n服务器停止")
