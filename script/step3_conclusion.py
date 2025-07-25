import os
import json
from dotenv import load_dotenv
from llm import LLM

# 使用绝对路径定位文件
script_dir = os.path.dirname(os.path.abspath(__file__))

# 读取prompt4模板
with open(os.path.join(script_dir, 'prompt', 'prompt4.txt'), 'r', encoding='utf-8') as f:
    prompt4_template = f.read()

class ConclusionGenerator:
    def __init__(self):
        # 初始化LLM实例
        self.llm = LLM()
        self.initial_idea = None
        self.outputs = []
        self.conclusion = None

    def load_data(self):
        # 加载初始创业想法
        try:
            with open(os.path.join(script_dir, 'output', 'background.json'), 'r', encoding='utf-8') as f:
                background_data = json.load(f)
                # 假设初始创业想法存储在background.json中的某个字段
                # 这里需要根据实际情况调整
                self.initial_idea = background_data.get('initial_idea', '未找到初始创业想法')
        except FileNotFoundError:
            print("错误: 未找到background.json文件，请先运行step1_background.py")
            return False

        # 加载五个output文件
        self.outputs = []
        for i in range(1, 6):
            output_file = os.path.join(script_dir, 'output', f'round_{i}.json')
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    output_data = json.load(f)
                    self.outputs.append(output_data)
            except FileNotFoundError:
                print(f"错误: 未找到{output_file}文件，请先运行step2_decision.py完成所有轮次")
                return False

        return True

    def generate_conclusion(self):
        if not self.initial_idea or len(self.outputs) < 5:
            raise ValueError("请先加载有效的初始创业想法和五个轮次的输出结果")

        # 填充prompt4模板
        prompt = prompt4_template.replace('{initial_idea}', self.initial_idea)

        for i, output in enumerate(self.outputs, 1):
            prompt = prompt.replace(f'{{output{i}}}', json.dumps(output))

        # 调用LLM生成结束语
        self.conclusion = self.llm.text(prompt, temperature=0.7)

        # 保存到output文件夹
        # 确保output目录存在
        output_dir = os.path.join(script_dir, 'output')
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, 'conclusion.json'), 'w', encoding='utf-8') as f:
            json.dump({'conclusion': self.conclusion}, f, ensure_ascii=False, indent=4)

        print("结束语已生成并保存到output/conclusion.json")
        return self.conclusion

def main():
    generator = ConclusionGenerator()
    if generator.load_data():
        generator.generate_conclusion()

if __name__ == '__main__':
    main()