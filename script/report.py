import os
import json
from openai import OpenAI

class ReportGenerator:
    def __init__(self, client: OpenAI):
        self.client = client
        self.prompt_path = os.path.join(os.path.dirname(__file__), '../prompts/report_prompt.txt')
        self.template_path = os.path.join(os.path.dirname(__file__), '../templates/report_template.md')
        
    def generate(self, game_history: list, final_state: dict, players_data: dict) -> str:
        with open(self.prompt_path, 'r', encoding='utf-8') as f:
            base_prompt = f.read()
            
        full_prompt = f"{base_prompt}\n\n" \
                     f"游戏历史: {json.dumps(game_history, ensure_ascii=False)}\n" \
                     f"最终状态: {json.dumps(final_state, ensure_ascii=False)}\n" \
                     f"玩家数据: {json.dumps(players_data, ensure_ascii=False)}"
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.5
        )
        
        with open(self.template_path, 'r', encoding='utf-8') as f:
            template = f.read()
            
        return template.format(
            report_content=response.choices[0].message.content
        )    
