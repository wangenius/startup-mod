import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class BackgroundGenerator:
    def __init__(self, client: OpenAI):
        self.client = client
        self.prompt_path = os.path.join(os.path.dirname(__file__), 'prompts/background_prompt.txt')
        self.template_path = os.path.join(os.path.dirname(__file__), 'templates/background_template.md')
        
    def generate(self, player_input: str) -> str:
        """生成"""
        with open(self.prompt_path, 'r', encoding='utf-8') as f:
            base_prompt = f.read()
        
        full_prompt = f"{base_prompt}\n\n玩家输入: {player_input}"
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.7
        )
        
        with open(self.template_path, 'r', encoding='utf-8') as f:
            template = f.read()
            
        return template.format(background_content=response.choices[0].message.content)    
