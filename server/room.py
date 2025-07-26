from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel
import random
import os
from llm import LLM

# 读取prompt模板
with open(
    os.path.join(os.path.dirname(__file__), "prompt", "role_generation.txt"),
    "r",
    encoding="utf-8",
) as f:
    role_generator = f.read()

# 读取prompt模板
with open(
    os.path.join(os.path.dirname(__file__), "prompt", "prompt1.txt"),
    "r",
    encoding="utf-8",
) as f:
    prompt_template = f.read()

# 读取prompt模板
with open(
    os.path.join(os.path.dirname(__file__), "prompt", "prompt2.txt"),
    "r",
    encoding="utf-8",
) as f:
    prompt2_template = f.read()

with open(
    os.path.join(os.path.dirname(__file__), "prompt", "prompt3.txt"),
    "r",
    encoding="utf-8",
) as f:
    prompt3_template = f.read()


# 枚举定义
class MessageType(str, Enum):
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    GAME_LOADING = "game_loading"
    GAME_START = "game_start"
    IDEAS_COMPLETE = "ideas_complete"
    ROLE_SELECTED = "role_selected"
    ROLES_COMPLETE = "roles_complete"
    ROUND_LOADING = "round_loading"
    ROUND_START = "round_start"
    ACTION_SUBMITTED = "action_submitted"
    ROUND_COMPLETE = "round_complete"
    GAME_COMPLETE = "game_complete"
    GAME_RESTART = "game_restart"
    CONNECTION_SUCCESS = "connection_success"


class GameState(str, Enum):
    LOBBY = "lobby"
    ROLE_SELECTION = "role_selection"
    LOADING = "loading"  # 游戏加载状态
    PLAYING = "playing"
    FINISHED = "finished"


class Role(str, Enum):
    CEO = "ceo"
    CTO = "cto"
    CMO = "cmo"
    COO = "coo"


# 数据模型
class Player(BaseModel):
    name: str
    is_online: bool = True
    joined_at: datetime
    role: Optional[Role] = None
    startup_idea: Optional[str] = None
    is_host: bool = False
    actions: List[Dict] = []


class GameRoom(BaseModel):
    room_id: str
    players: List[Player] = []
    created_at: datetime
    game_state: GameState = GameState.LOBBY
    current_round: int = 1
    # 废弃
    startup_idea: Optional[str] = None
    background: Optional[str] = None  # 本轮游戏的背景
    dynamic_roles: Optional[Dict] = None  # 保存动态生成的角色定义
    game_result: Optional[Dict] = None
    round_actions: Dict[int, List[Dict]] = {}
    round_events: Dict[int, Dict] = {}  # 保存每轮的事件和选项
    round_private_messages: Dict[int, Dict] = {}  # 保存每轮的私人信息
    dynamic_round_info: Dict[int, str] = {}  # 保存动态生成的轮次信息
    round_situation: Dict[int, str] = {}  # 保存每轮的情况

    def add_player(self, player: Player) -> bool:
        """添加玩家到房间"""
        # 检查玩家是否已存在
        existing_player = self.get_player(player.name)
        if existing_player:
            existing_player.is_online = True
            return True

        # 如果是第一个玩家，设为房主
        if not self.players:
            player.is_host = True

        self.players.append(player)
        return True

    def remove_player(self, player_name: str) -> bool:
        """移除玩家（设为离线状态）"""
        player = self.get_player(player_name)
        if player:
            player.is_online = False
        return True

    def get_player(self, player_name: str) -> Optional[Player]:
        """根据名称获取玩家"""
        for player in self.players:
            if player.name == player_name:
                return player
        return None

    def get_online_players(self) -> List[Player]:
        """获取在线玩家列表"""
        return [p for p in self.players if p.is_online]

    def all_players_have_ideas(self) -> bool:
        """检查是否所有玩家都提交了创业想法"""
        online_players = self.get_online_players()
        return all(p.startup_idea for p in online_players)

    def all_players_have_roles(self) -> bool:
        """检查是否所有玩家都选择了角色"""
        online_players = self.get_online_players()
        return all(p.role for p in online_players)

    def get_selected_roles(self) -> List[str]:
        """获取已选择的角色列表"""
        return [p.role for p in self.players if p.role]

    def all_players_submitted_actions(self, round_num: int) -> bool:
        """检查是否所有玩家都提交了当前轮次的行动"""
        online_players = self.get_online_players()
        submitted_players = set()

        if round_num in self.round_actions:
            for action in self.round_actions[round_num]:
                submitted_players.add(action.get("player"))

        return len(submitted_players) == len(online_players)

    def add_round_action(self, round_num: int, action: Dict):
        """添加轮次行动"""
        if round_num not in self.round_actions:
            self.round_actions[round_num] = []

        # 移除该玩家之前的行动（如果有）
        self.round_actions[round_num] = [
            a
            for a in self.round_actions[round_num]
            if a.get("player") != action.get("player")
        ]

        self.round_actions[round_num].append(action)

    def get_round_info(self, round_num: int) -> str:
        """获取指定轮次的信息"""
        # 如果有动态生成的轮次信息，优先使用
        if round_num in self.dynamic_round_info:
            return self.dynamic_round_info[round_num]

        # 否则使用默认模板
        return ""

    def set_round_info(self, round_num: int, info: str):
        """设置指定轮次的动态信息"""
        self.dynamic_round_info[round_num] = info

    def generate_background_from_ideas(self, player_ideas):
        """根据所有玩家的想法生成背景"""
        if not player_ideas:
            raise ValueError("没有玩家想法")

        # 将所有想法合并为一个字符串
        combined_ideas = "\n".join([f"- {idea}" for idea in player_ideas if idea])

        # 填充prompt模板
        prompt = prompt_template.replace("{initial_idea}", combined_ideas)

        try:
            self.background = LLM().text(prompt, temperature=0.7)
            return self.background
        except Exception as e:
            raise Exception(f"生成背景导入词失败: {str(e)}")

    def generate_roles_from_background(self, background):
        """根据游戏背景生成角色定义"""
        if not background:
            raise ValueError("背景故事不能为空")

        # 填充prompt模板
        prompt = role_generator.replace("{background}", background)

        try:
            # 使用LLM生成角色定义，直接获取JSON格式响应
            role_definitions = LLM().json(prompt, temperature=0.7)

            return role_definitions
        except Exception as e:
            raise Exception(f"生成角色定义失败: {str(e)}")

    def generate_event(self, round_num):
        # 填充prompt2模板
        prompt = prompt2_template.replace("{background}", self.background or "")
        if round_num in self.round_situation:
            prompt = prompt.replace("{situation}", self.round_situation[round_num])
        else:
            prompt = prompt.replace("{situation}", "这是第一轮决策，暂无上一轮结果")

        response_json = LLM().json(prompt, temperature=0.7)

        # 添加调试信息
        print(f"本轮事件的信息: {response_json}")

        # 返回完整的事件数据，包含私人信息
        return {
            "situation": response_json.get("situation", ""),
            "event": response_json.get("event", ""),
            "private_messages": response_json.get("private_messages", {}),
        }

    def calculate_game_result(self) -> Dict:
        """计算游戏结果"""
        # 简化的游戏结果计算
        base_score = 50
        user_growth = random.randint(1000, 100000)
        revenue = random.randint(10000, 1000000)
        market_share = random.randint(1, 25)
        team_size = random.randint(5, 100)

        # 根据玩家行动调整分数
        total_actions = sum(len(actions) for actions in self.round_actions.values())
        score_bonus = min(total_actions * 2, 50)
        final_score = base_score + score_bonus

        # 确定成功级别
        if final_score >= 90:
            success_level = "独角兽公司"
        elif final_score >= 75:
            success_level = "成功上市"
        elif final_score >= 60:
            success_level = "盈利稳定"
        elif final_score >= 45:
            success_level = "勉强生存"
        else:
            success_level = "创业失败"

        # 计算玩家表现
        player_performance = self._calculate_player_performance()

        # 生成玩家分数字典，确保前端兼容性
        player_scores = {}
        for perf in player_performance:
            player_scores[perf["player"]] = min(50 + perf["contribution_score"], 100)

        return {
            "final_score": final_score,
            "success_level": success_level,
            "metrics": {
                "user_growth": user_growth,
                "revenue": revenue,
                "market_share": market_share,
                "team_size": team_size,
            },
            "achievements": self._generate_achievements(final_score),
            "timeline": self._generate_timeline(),
            "player_performance": player_performance,
            "playerScores": player_scores,
        }

    def _generate_achievements(self, score: int) -> List[str]:
        """生成成就列表"""
        achievements = []
        if score >= 90:
            achievements.extend(["🦄 独角兽成就", "💰 十亿美元估值", "🌟 行业领导者"])
        elif score >= 75:
            achievements.extend(["📈 成功IPO", "🏆 年度最佳创业公司", "🌍 国际化扩张"])
        elif score >= 60:
            achievements.extend(["💼 盈利达成", "👥 团队建设专家", "📊 市场份额突破"])
        elif score >= 45:
            achievements.extend(["🎯 产品上线", "💡 创新思维", "🤝 团队协作"])
        return achievements

    def _generate_timeline(self) -> List[Dict]:
        """生成发展历程"""
        return [
            {"round": 1, "event": "产品原型开发完成", "impact": "positive"},
            {"round": 2, "event": "获得首批用户", "impact": "positive"},
            {"round": 3, "event": "完成A轮融资", "impact": "positive"},
            {"round": 4, "event": "市场竞争加剧", "impact": "negative"},
            {"round": 5, "event": "战略合作达成", "impact": "positive"},
        ]

    def _calculate_player_performance(self) -> List[Dict]:
        """计算玩家表现"""
        performance = []
        for player in self.players:
            action_count = sum(
                1
                for round_actions in self.round_actions.values()
                for action in round_actions
                if action.get("player") == player.name
            )

            performance.append(
                {
                    "player": player.name,
                    "role": player.role,
                    "actions_taken": action_count,
                    "contribution_score": min(action_count * 10, 50),
                }
            )

        return performance

    def restart_game(self):
        """重新开始游戏，重置游戏状态但保留玩家"""
        # 重置游戏状态
        self.game_state = GameState.LOBBY
        self.current_round = 1
        self.background = None
        self.dynamic_roles = None  # 重置动态角色定义，重新开始时会重新生成
        self.game_result = None
        self.round_actions = {}
        self.round_events = {}  # 重置轮次事件
        self.round_private_messages = {}  # 重置私人信息
        self.dynamic_round_info = {}  # 重置动态轮次信息

        # 重置玩家的游戏相关状态，但保留玩家名称和房主状态
        for player in self.players:
            player.role = None
            player.actions = []
            # 保留 startup_idea，这样玩家不需要重新输入创业想法
