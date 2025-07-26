import os
import json
from openai import OpenAI

class PrivateMessageGenerator:
    def __init__(self, client: OpenAI):
        self.client = client
        self.prompt_path = os.path.join(os.path.dirname(__file__), '../prompts/private_message_prompt.txt')
        self.template_path = os.path.join(os.path.dirname(__file__), '../templates/private_message_template.md')
        
    def generate(self, round_number: int, game_state: dict, players_data: dict, round_event: dict) -> str:
        with open(self.prompt_path, 'r', encoding='utf-8') as f:
            base_prompt = f.read()
            
        full_prompt = f"{base_prompt}\n\n" \
                     f"当前轮次: {round_number}\n" \
                     f"游戏状态: {json.dumps(game_state, ensure_ascii=False)}\n" \
                     f"玩家数据: {json.dumps(players_data, ensure_ascii=False)}\n" \
                     f"本轮事件: {json.dumps(round_event, ensure_ascii=False)}"
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.8
        )
        
        with open(self.template_path, 'r', encoding='utf-8') as f:
            template = f.read()
            
        return template.format(
            round_number=round_number,
            messages_content=response.choices[0].message.content
        )    
