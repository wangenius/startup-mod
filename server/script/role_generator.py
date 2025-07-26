import json
import os
from dotenv import load_dotenv

from llm import LLM

# 读取角色生成prompt模板
script_dir = os.path.dirname(os.path.abspath(__file__))
role_prompt_path = os.path.join(script_dir, "prompt", "role_generation.txt")
with open(role_prompt_path, "r", encoding="utf-8") as f:
    role_prompt_template = f.read()


class RoleGenerator:
    def __init__(self):
        # 初始化LLM实例
        self.llm = LLM()

    def generate_roles_from_background(self, background):
        """根据游戏背景生成角色定义"""
        if not background:
            raise ValueError("背景故事不能为空")
        
        # 填充prompt模板
        prompt = role_prompt_template.replace("{background}", background)
        
        try:
            # 使用LLM生成角色定义
            response = self.llm.text(prompt, temperature=0.7)
            
            # 尝试解析JSON响应
            try:
                # 提取JSON部分（如果响应包含其他文本）
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = response[start_idx:end_idx]
                    role_definitions = json.loads(json_str)
                else:
                    # 如果没有找到JSON，尝试直接解析整个响应
                    role_definitions = json.loads(response)
            except json.JSONDecodeError as e:
                print(f"JSON解析失败: {e}")
                print(f"原始响应: {response}")
                # 如果解析失败，返回默认角色定义
                return self._get_default_roles()
            
            # 保存到output文件夹
            output_path = os.path.join(script_dir, "output", "generated_roles.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(
                    {"roles": role_definitions, "background": background}, 
                    f, ensure_ascii=False, indent=4
                )
            
            return role_definitions
            
        except Exception as e:
            print(f"生成角色定义失败: {str(e)}")
            # 如果生成失败，返回默认角色定义
            return self._get_default_roles()

    def _get_default_roles(self):
        """获取默认角色定义"""
        return {
            "ceo": {
                "name": "首席执行官 (CEO)",
                "description": "负责公司整体战略和决策"
            },
            "cto": {
                "name": "首席技术官 (CTO)",
                "description": "负责技术架构和产品开发"
            },
            "cmo": {
                "name": "首席营销官 (CMO)",
                "description": "负责市场营销和品牌推广"
            },
            "coo": {
                "name": "首席运营官 (COO)",
                "description": "负责日常运营和流程优化"
            }
        }


def main():
    """测试函数"""
    generator = RoleGenerator()
    test_background = "一家专注于AI驱动的智能家居解决方案的创业公司，致力于通过机器学习和物联网技术，为用户提供个性化的家居自动化体验。"
    roles = generator.generate_roles_from_background(test_background)
    print("生成的角色定义:")
    print(json.dumps(roles, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()