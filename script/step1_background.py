import json
import os
import sys
from dotenv import load_dotenv

from llm import LLM

# 读取prompt1模板
# 使用绝对路径定位prompt文件
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
prompt_path = os.path.join(script_dir, 'prompt', 'prompt1.txt')
with open(prompt_path, 'r', encoding='utf-8') as f:
    prompt_template = f.read()

class BackgroundGenerator:
    def __init__(self):
        # 初始化LLM实例
        self.llm = LLM()
        self.initial_idea = None
        self.background = None

    def get_initial_idea(self):
        # 让CEO用户输入初始创业想法
        print("请CEO输入初始创业想法:")
        self.initial_idea = input().strip()
        return self.initial_idea

    def generate_background(self):
        if not self.initial_idea:
            raise ValueError("请先输入初始创业想法")

        # 填充prompt模板
        prompt = prompt_template.replace('{initial_idea}', self.initial_idea)

        # 使用LLM类调用API
        try:
            self.background = self.llm.text(prompt, temperature=0.7)
            
            # 保存到output文件夹
            # 保存到output文件夹
            output_path = os.path.join(script_dir, 'output', 'background.json')
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({'background': self.background}, f, ensure_ascii=False, indent=4)
            
            print("背景导入词已生成并保存到output/background.json")
            return self.background
        except Exception as e:
            raise Exception(f"生成背景导入词失败: {str(e)}")

def main():
    generator = BackgroundGenerator()
    generator.get_initial_idea()
    generator.generate_background()

if __name__ == '__main__':
    main()