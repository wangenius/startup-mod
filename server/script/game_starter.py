#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
游戏启动器 - 用于在每轮游戏开始时运行step2_decision.py
"""

import os
import sys
import json
from step2_decision import DecisionMaker

class GameStarter:
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(self.script_dir, 'output')
        
    def load_background(self):
        """加载游戏背景信息"""
        background_file = os.path.join(self.output_dir, 'background.json')
        try:
            with open(background_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 从背景中提取初始创业想法
                background_text = data.get('background', '')
                player_ideas = data.get('player_ideas', [])
                
                # 构建初始想法描述
                if player_ideas:
                    initial_idea = f"创业想法：{' + '.join(player_ideas)}\n\n{background_text}"
                else:
                    initial_idea = background_text
                    
                return initial_idea
        except FileNotFoundError:
            print("错误：未找到background.json文件，请先运行step1_background.py")
            return None
        except Exception as e:
            print(f"读取背景文件时出错：{e}")
            return None
    
    def get_current_round(self):
        """获取当前应该进行的轮次"""
        round_num = 1
        while os.path.exists(os.path.join(self.output_dir, f'round_{round_num}.json')):
            round_num += 1
        return round_num
    
    def start_round(self, round_num=None):
        """开始指定轮次的游戏"""
        # 加载背景信息
        initial_idea = self.load_background()
        if not initial_idea:
            return False
            
        # 确定轮次
        if round_num is None:
            round_num = self.get_current_round()
            
        print(f"\n=== 准备开始第{round_num}轮游戏 ===")
        print(f"创业项目：SleepID - 睡眠身份识别AI应用")
        print(f"当前轮次：第{round_num}轮")
        
        # 创建决策制定器
        decision_maker = DecisionMaker(initial_idea)
        
        # 如果不是第一轮，加载之前的输出
        if round_num > 1:
            previous_round_file = os.path.join(self.output_dir, f'round_{round_num-1}.json')
            if os.path.exists(previous_round_file):
                with open(previous_round_file, 'r', encoding='utf-8') as f:
                    decision_maker.previous_output = json.load(f)
        
        # 生成事件
        print("\n正在生成本轮事件...")
        event = decision_maker.generate_event(round_num)
        
        return {
            'round_num': round_num,
            'event': event,
            'decision_maker': decision_maker
        }
    
    def run_single_round(self, round_num=None):
        """运行单轮完整游戏流程"""
        game_data = self.start_round(round_num)
        if not game_data:
            return False
            
        decision_maker = game_data['decision_maker']
        round_num = game_data['round_num']
        event = game_data['event']
        
        # 获取玩家选择
        print("\n请各位玩家做出选择...")
        decision_maker.get_player_choices(event, round_num)
        
        # 计算最终选择
        final_choice = decision_maker.calculate_final_choice()
        
        # 生成影响分析
        print("\n正在分析决策影响...")
        output = decision_maker.generate_impact(final_choice, round_num)
        
        print(f"\n第{round_num}轮游戏完成！")
        print(f"结果已保存到：{os.path.join(decision_maker.llm.script_dir, 'output', f'round_{round_num}.json')}")
        
        return output

def main():
    """主函数"""
    game_starter = GameStarter()
    
    if len(sys.argv) > 1:
        try:
            round_num = int(sys.argv[1])
            print(f"指定运行第{round_num}轮游戏")
            game_starter.run_single_round(round_num)
        except ValueError:
            print("错误：轮次必须是数字")
    else:
        # 自动检测下一轮
        current_round = game_starter.get_current_round()
        if current_round > 5:
            print("所有5轮游戏已完成！")
        else:
            print(f"自动开始第{current_round}轮游戏")
            game_starter.run_single_round(current_round)

if __name__ == '__main__':
    main()