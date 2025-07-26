import os
import json
import os
from dotenv import load_dotenv
from llm import LLM

# 使用绝对路径定位prompt文件
script_dir = os.path.dirname(os.path.abspath(__file__))

# 读取prompt模板
with open(os.path.join(script_dir, 'prompt', 'prompt2.txt'), 'r', encoding='utf-8') as f:
    prompt2_template = f.read()

with open(os.path.join(script_dir, 'prompt', 'prompt3.txt'), 'r', encoding='utf-8') as f:
    prompt3_template = f.read()

class DecisionMaker:
    def __init__(self, initial_idea):
        # 初始化LLM实例
        self.llm = LLM()
        self.initial_idea = initial_idea
        self.previous_output = None
        self.outputs = []
        self.players = {
            'CEO': None,
            'CTO': None,
            'COO': None,
            'CMO': None
        }

    def generate_event(self, round_num):
        # 填充prompt2模板
        prompt = prompt2_template.replace('{initial_idea}', self.initial_idea)
        if self.previous_output:
            prompt = prompt.replace('{previous_output}', json.dumps(self.previous_output))
        else:
            prompt = prompt.replace('{previous_output}', '这是第一轮决策，暂无上一轮分析结果')

        # 调用LLM生成事件和选项
        event_content = self.llm.text(prompt, temperature=0.7)

        # 解析生成的事件和选项（JSON格式）
        event = {'description': '', 'options': []}
        private_messages = {}

        try:
            # 尝试解析JSON
            response_json = json.loads(event_content)
            
            # 提取事件信息
            event_json = response_json.get('event', {})
            event['description'] = event_json.get('event_description', '')
            
            # 提取选项（A,B,C,D转换为1,2,3,4）
            options = event_json.get('decision_options', {})
            for i, (key, value) in enumerate(options.items(), 1):
                event['options'].append(f'选项{i}: {value}')
                
            # 提取私人信息
            private_messages = response_json.get('private_messages', {})
        except json.JSONDecodeError:
            # 如果JSON解析失败，尝试使用旧的文本解析方式
            event_lines = event_content.strip().split('\n')
            for line in event_lines:
                if line.startswith('事件:'):
                    event['description'] = line.replace('事件:', '').strip()
                elif line.startswith('选项'):
                    option_num = line.split(':')[0].replace('选项', '').strip()
                    option_text = line.split(':', 1)[1].strip()
                    event['options'].append(f'选项{option_num}: {option_text}')

        # 显示事件和选项
        print(f"\n第{round_num}轮事件:")
        print(event['description'])
        print("\n选项:")
        for option in event['options']:
            print(option)

        # 显示私人信息
        if private_messages:
            print("\n===== 私人信息 =====")
            for role, message in private_messages.items():
                print(f"\n{role}的私人信息:")
                print(message)
                input("按Enter键继续...")
        else:
            print("\n未获取到私人信息。")

        return event

    def get_player_choices(self, event, round_num):
        # 让每个玩家选择
        print(f"\n请各位玩家为第{round_num}轮做出选择（输入选项编号1-4）:")

        for role in self.players:
            valid_choice = False
            while not valid_choice:
                choice = input(f"{role}的选择: ").strip()
                if choice in ['1', '2', '3', '4'] and int(choice) <= len(event['options']):
                    self.players[role] = int(choice)
                    valid_choice = True
                else:
                    print("无效的选择，请输入1-4之间的数字")

        return self.players

    def calculate_final_choice(self):
        # 计算最终选择（CEO 1.5票，其他人1票）
        choice_counts = {1: 0, 2: 0, 3: 0, 4: 0}

        for role, choice in self.players.items():
            if role == 'CEO':
                choice_counts[choice] += 1.5
            else:
                choice_counts[choice] += 1

        # 找出最高票数的选项
        max_votes = max(choice_counts.values())
        final_choices = [k for k, v in choice_counts.items() if v == max_votes]

        # 如果有平局，选择编号最小的选项
        final_choice = min(final_choices)

        print(f"\n最终选择是: 选项{final_choice}")
        return final_choice

    def generate_impact(self, final_choice, round_num):
        # 填充prompt3模板
        prompt = prompt3_template
        for role, choice in self.players.items():
            prompt = prompt.replace(f'{{{role.lower()}_choice}}', f'选项{choice}')

        # 调用LLM生成影响
        impact = self.llm.text(prompt, temperature=0.7)

        # 保存到output文件夹
        output = {
            'round': round_num,
            'players_choices': self.players,
            'final_choice': final_choice,
            'impact': impact
        }

        # 确保output目录存在
        output_dir = os.path.join(script_dir, 'output')
        os.makedirs(output_dir, exist_ok=True)
        
        # 使用绝对路径创建输出文件
        output_file = os.path.join(output_dir, f'round_{round_num}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=4)

        self.previous_output = output
        self.outputs.append(output)

        print(f"第{round_num}轮分析结果已保存到{output_file}")
        return output

    def run_rounds(self):
        # 运行五个轮次
        for round_num in range(1, 6):
            print(f"\n===== 第{round_num}轮决策 =====")
            event = self.generate_event(round_num)
            self.get_player_choices(event, round_num)
            final_choice = self.calculate_final_choice()
            self.generate_impact(final_choice, round_num)

        return self.outputs

def main():
    # 从background.json读取初始创业想法
    with open(os.path.join(script_dir, 'output', 'background.json'), 'r', encoding='utf-8') as f:
        background_data = json.load(f)

    # 假设初始创业想法保存在background.json中
    # 在实际应用中，可能需要从step1的输出中获取
    initial_idea = ""
    with open(os.path.join(script_dir, 'output', 'background.json'), 'r', encoding='utf-8') as f:
        data = json.load(f)
        # 这里假设background中包含了初始想法
        # 在实际应用中，可能需要调整
        initial_idea = data.get('initial_idea', '未找到初始创业想法')

    decision_maker = DecisionMaker(initial_idea)
    decision_maker.run_rounds()

if __name__ == '__main__':
    main()