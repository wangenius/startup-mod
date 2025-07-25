import os
import json
from openai import OpenAI

class VotingProcessor:
    def __init__(self, client: OpenAI):
        self.client = client
        self.prompt_path = os.path.join(os.path.dirname(__file__), '../prompts/voting_prompt.txt')
        self.decision_template = os.path.join(os.path.dirname(__file__), '../templates/voting_template.md')
        
    def process_vote(self, round_number: int, votes: dict, game_state: dict, players_data: dict, round_event: dict) -> tuple:
        with open(self.prompt_path, 'r', encoding='utf-8') as f:
            base_prompt = f.read()
            
        full_prompt = f"{base_prompt}\n\n" \
                     f"当前轮次: {round_number}\n" \
                     f"投票结果: {json.dumps(votes, ensure_ascii=False)}\n" \
                     f"游戏状态: {json.dumps(game_state, ensure_ascii=False)}\n" \
                     f"玩家数据: {json.dumps(players_data, ensure_ascii=False)}\n" \
                     f"本轮事件: {json.dumps(round_event, ensure_ascii=False)}"
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.6
        )
        
        # 解析响应中的新状态和决策结果
        result = response.choices[0].message.content
        
        # 这里需要根据实际响应格式解析出新的游戏状态
        # 简化示例，实际中可能需要更复杂的解析逻辑
        new_game_state = game_state.copy()
        new_game_state[f"round_{round_number}_decisions"] = votes
        
        with open(self.decision_template, 'r', encoding='utf-8') as f:
            template = f.read()
            
        decision_content = template.format(
            round_number=round_number,
            voting_results=json.dumps(votes, ensure_ascii=False),
            decision_content=result
        )
        
        return decision_content, new_game_state    
