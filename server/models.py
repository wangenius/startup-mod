from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel
import random


# 枚举定义
class MessageType(str, Enum):
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    GAME_START = "game_start"
    ROLE_SELECTED = "role_selected"
    ROLES_COMPLETE = "roles_complete"
    ROUND_START = "round_start"
    ACTION_SUBMITTED = "action_submitted"
    ROUND_COMPLETE = "round_complete"
    GAME_COMPLETE = "game_complete"
    CONNECTION_SUCCESS = "connection_success"


class GameState(str, Enum):
    LOBBY = "lobby"
    ROLE_SELECTION = "role_selection"
    PLAYING = "playing"
    FINISHED = "finished"


class Role(str, Enum):
    CEO = "ceo"
    CTO = "cto"
    CMO = "cmo"
    COO = "coo"


# 角色定义
ROLE_DEFINITIONS = {
    Role.CEO: {
        "name": "首席执行官 (CEO)",
        "description": "负责公司整体战略和决策",
        "actions": ["制定战略", "融资决策", "团队管理", "市场扩张"]
    },
    Role.CTO: {
        "name": "首席技术官 (CTO)",
        "description": "负责技术架构和产品开发",
        "actions": ["技术研发", "产品优化", "架构设计", "技术招聘"]
    },
    Role.CMO: {
        "name": "首席营销官 (CMO)",
        "description": "负责市场营销和品牌推广",
        "actions": ["市场推广", "品牌建设", "用户获取", "合作伙伴"]
    },
    Role.COO: {
        "name": "首席运营官 (COO)",
        "description": "负责日常运营和流程优化",
        "actions": ["运营优化", "成本控制", "流程改进", "供应链管理"]
    }
}

# 轮次信息
ROUND_INFO = {
    1: "初创阶段：验证产品市场契合度",
    2: "成长阶段：扩大用户基础和市场份额",
    3: "扩张阶段：进入新市场和产品线",
    4: "成熟阶段：优化运营和盈利能力",
    5: "战略阶段：考虑IPO或并购机会"
}


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
    startup_idea: Optional[str] = None
    game_result: Optional[Dict] = None
    round_actions: Dict[int, List[Dict]] = {}

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

    def get_selected_roles(self) -> List[Dict]:
        """获取已选择的角色列表"""
        return [
            {"player": p.name, "role": p.role}
            for p in self.players if p.role
        ]

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
            a for a in self.round_actions[round_num] 
            if a.get("player") != action.get("player")
        ]
        
        self.round_actions[round_num].append(action)

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
        
        return {
            "final_score": final_score,
            "success_level": success_level,
            "metrics": {
                "user_growth": user_growth,
                "revenue": revenue,
                "market_share": market_share,
                "team_size": team_size
            },
            "achievements": self._generate_achievements(final_score),
            "timeline": self._generate_timeline(),
            "player_performance": self._calculate_player_performance()
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
            {"round": 5, "event": "战略合作达成", "impact": "positive"}
        ]

    def _calculate_player_performance(self) -> List[Dict]:
        """计算玩家表现"""
        performance = []
        for player in self.players:
            action_count = sum(
                1 for round_actions in self.round_actions.values()
                for action in round_actions
                if action.get("player") == player.name
            )
            
            performance.append({
                "player": player.name,
                "role": player.role,
                "actions_taken": action_count,
                "contribution_score": min(action_count * 10, 50)
            })
        
        return performance