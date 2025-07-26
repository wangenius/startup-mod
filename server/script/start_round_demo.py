#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
演示脚本：展示如何在游戏开始时使用step2_decision.py完成对应的event
"""

import os
import sys
import json
from datetime import datetime

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from step2_decision import DecisionMaker

def start_round_with_event_generation(round_num=None):
    """
    在游戏开始时使用step2_decision.py生成事件
    
    Args:
        round_num: 指定轮次，如果为None则自动检测下一轮
    """
    print("=" * 60)
    print("🎮 游戏轮次启动器 - 使用step2_decision.py生成事件")
    print("=" * 60)
    
    # 1. 检查必要文件
    output_dir = os.path.join(current_dir, 'output')
    background_file = os.path.join(output_dir, 'background.json')
    
    if not os.path.exists(background_file):
        print("❌ 错误：未找到background.json文件")
        print("请先运行step1_background.py生成游戏背景")
        return False
    
    print("✅ 游戏背景文件存在")
    
    # 2. 读取背景信息
    try:
        with open(background_file, 'r', encoding='utf-8') as f:
            background_data = json.load(f)
        
        background_text = background_data.get('background', '')
        player_ideas = background_data.get('player_ideas', [])
        
        if player_ideas:
            initial_idea = f"创业想法：{' + '.join(player_ideas)}\n\n{background_text}"
        else:
            initial_idea = background_text
            
        print("✅ 成功读取游戏背景")
        print(f"项目：SleepID - 睡眠身份识别AI应用")
        
    except Exception as e:
        print(f"❌ 读取背景文件失败：{e}")
        return False
    
    # 3. 确定轮次
    if round_num is None:
        round_num = 1
        while os.path.exists(os.path.join(output_dir, f'round_{round_num}.json')):
            round_num += 1
    
    if round_num > 5:
        print("🎉 所有5轮游戏已完成！")
        return True
    
    print(f"\n🎯 准备开始第{round_num}轮游戏")
    
    # 4. 创建决策制定器
    print("\n📋 初始化决策制定器...")
    decision_maker = DecisionMaker(initial_idea)
    
    # 5. 加载上一轮结果（如果存在）
    if round_num > 1:
        previous_round_file = os.path.join(output_dir, f'round_{round_num-1}.json')
        if os.path.exists(previous_round_file):
            try:
                with open(previous_round_file, 'r', encoding='utf-8') as f:
                    decision_maker.previous_output = json.load(f)
                print(f"✅ 成功加载第{round_num-1}轮结果")
            except Exception as e:
                print(f"⚠️ 加载上一轮结果失败：{e}")
        else:
            print(f"⚠️ 未找到第{round_num-1}轮结果文件")
    
    # 6. 生成事件
    print(f"\n🎲 正在生成第{round_num}轮事件...")
    try:
        event = decision_maker.generate_event(round_num)
        print("✅ 事件生成成功！")
        
        # 显示生成的事件
        print("\n" + "=" * 50)
        print(f"📋 第{round_num}轮事件详情")
        print("=" * 50)
        
        print(f"\n📖 事件描述：")
        print(f"{event['description']}")
        
        print(f"\n🎯 决策选项：")
        for i, option in enumerate(event['options'], 1):
            print(f"  {option}")
        
        print("\n🔒 私人信息已为各角色生成（在实际游戏中查看）")
        
    except Exception as e:
        print(f"❌ 事件生成失败：{e}")
        return False
    
    # 7. 提供下一步选项
    print("\n" + "=" * 50)
    print("🎮 下一步操作选项")
    print("=" * 50)
    
    while True:
        print("\n请选择下一步操作：")
        print("1. 模拟完整轮次（自动选择）")
        print("2. 手动输入玩家选择")
        print("3. 只生成事件，稍后处理")
        print("4. 退出")
        
        choice = input("\n请输入选项 (1-4): ").strip()
        
        if choice == '1':
            return simulate_full_round(decision_maker, event, round_num)
        elif choice == '2':
            return manual_player_choices(decision_maker, event, round_num)
        elif choice == '3':
            print(f"\n✅ 第{round_num}轮事件已生成完成")
            print("可以在前端或其他地方继续处理玩家选择")
            return True
        elif choice == '4':
            print("\n👋 退出游戏启动器")
            return True
        else:
            print("❌ 无效选择，请重新输入")

def simulate_full_round(decision_maker, event, round_num):
    """模拟完整轮次（自动选择）"""
    print(f"\n🤖 模拟第{round_num}轮完整流程...")
    
    # 自动为每个角色选择
    import random
    roles = ['CEO', 'CTO', 'COO', 'CMO']
    
    for role in roles:
        choice = random.randint(1, min(4, len(event['options'])))
        decision_maker.players[role] = choice
        print(f"  {role}: 选择了选项{choice}")
    
    # 计算最终选择
    final_choice = decision_maker.calculate_final_choice()
    
    # 生成影响分析
    print("\n📊 正在生成影响分析...")
    output = decision_maker.generate_impact(final_choice, round_num)
    
    print(f"\n✅ 第{round_num}轮模拟完成！")
    print(f"结果已保存到：{os.path.join(decision_maker.llm.script_dir, 'output', f'round_{round_num}.json')}")
    
    return True

def manual_player_choices(decision_maker, event, round_num):
    """手动输入玩家选择"""
    print(f"\n👥 请为第{round_num}轮输入各玩家选择...")
    
    roles = ['CEO', 'CTO', 'COO', 'CMO']
    
    for role in roles:
        while True:
            try:
                choice = input(f"\n{role}的选择 (1-{len(event['options'])}): ").strip()
                choice_num = int(choice)
                if 1 <= choice_num <= len(event['options']):
                    decision_maker.players[role] = choice_num
                    print(f"  ✅ {role}选择了选项{choice_num}")
                    break
                else:
                    print(f"❌ 请输入1-{len(event['options'])}之间的数字")
            except ValueError:
                print("❌ 请输入有效的数字")
    
    # 计算最终选择
    final_choice = decision_maker.calculate_final_choice()
    
    # 生成影响分析
    print("\n📊 正在生成影响分析...")
    output = decision_maker.generate_impact(final_choice, round_num)
    
    print(f"\n✅ 第{round_num}轮完成！")
    print(f"结果已保存到：{os.path.join(decision_maker.llm.script_dir, 'output', f'round_{round_num}.json')}")
    
    return True

def main():
    """主函数"""
    if len(sys.argv) > 1:
        try:
            round_num = int(sys.argv[1])
            start_round_with_event_generation(round_num)
        except ValueError:
            print("❌ 错误：轮次必须是数字")
            print("用法：python start_round_demo.py [轮次]")
    else:
        start_round_with_event_generation()

if __name__ == '__main__':
    main()