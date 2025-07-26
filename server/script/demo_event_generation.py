#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
演示脚本：展示如何在游戏开始时使用step2_decision.py生成事件
"""

import os
import json
from step2_decision import DecisionMaker

def demo_event_generation():
    """演示事件生成过程"""
    print("=== 游戏事件生成演示 ===")
    
    # 获取脚本目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, 'output')
    
    # 1. 读取背景信息
    print("\n1. 读取游戏背景...")
    background_file = os.path.join(output_dir, 'background.json')
    
    try:
        with open(background_file, 'r', encoding='utf-8') as f:
            background_data = json.load(f)
            
        # 提取初始创业想法
        background_text = background_data.get('background', '')
        player_ideas = background_data.get('player_ideas', [])
        
        if player_ideas:
            initial_idea = f"创业想法：{' + '.join(player_ideas)}\n\n{background_text}"
        else:
            initial_idea = background_text
            
        print(f"✓ 成功读取背景信息")
        print(f"项目：SleepID - 睡眠身份识别AI应用")
        
    except FileNotFoundError:
        print("❌ 未找到background.json文件")
        print("请先运行step1_background.py生成游戏背景")
        return
    
    # 2. 创建决策制定器
    print("\n2. 初始化决策制定器...")
    decision_maker = DecisionMaker(initial_idea)
    print("✓ 决策制定器初始化完成")
    
    # 3. 检查当前轮次
    print("\n3. 检查游戏进度...")
    current_round = 1
    while os.path.exists(os.path.join(output_dir, f'round_{current_round}.json')):
        current_round += 1
    
    if current_round > 5:
        print("所有5轮游戏已完成！")
        return
    
    print(f"当前应进行第{current_round}轮")
    
    # 4. 加载上一轮结果（如果存在）
    if current_round > 1:
        print(f"\n4. 加载第{current_round-1}轮结果...")
        previous_round_file = os.path.join(output_dir, f'round_{current_round-1}.json')
        try:
            with open(previous_round_file, 'r', encoding='utf-8') as f:
                decision_maker.previous_output = json.load(f)
            print("✓ 成功加载上一轮结果")
        except Exception as e:
            print(f"⚠️ 加载上一轮结果失败：{e}")
    else:
        print("\n4. 这是第一轮，无需加载历史数据")
    
    # 5. 生成事件
    print(f"\n5. 生成第{current_round}轮事件...")
    try:
        event = decision_maker.generate_event(current_round)
        print("✓ 事件生成成功！")
        
        # 显示生成的事件信息
        print("\n=== 生成的事件信息 ===")
        print(f"事件描述：{event['description']}")
        print("\n可选决策：")
        for i, option in enumerate(event['options'], 1):
            print(f"  {option}")
            
    except Exception as e:
        print(f"❌ 事件生成失败：{e}")
        return
    
    # 6. 提示下一步操作
    print("\n=== 下一步操作 ===")
    print("事件已生成完成！")
    print("\n可以进行以下操作：")
    print("1. 让玩家查看私人信息并做出选择")
    print("2. 收集所有玩家的决策")
    print("3. 计算最终选择并生成影响分析")
    print("\n如需完成完整轮次，请运行：")
    print(f"python game_starter.py {current_round}")
    
    return event

if __name__ == '__main__':
    demo_event_generation()