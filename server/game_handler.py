from typing import Dict
from datetime import datetime
import logging
import asyncio
import os
import sys

# 添加script目录到Python路径
script_dir = os.path.join(os.path.dirname(__file__), "script")
sys.path.append(script_dir)

from room import GameRoom, GameState, Role, MessageType
from connection_manager import connection_manager
from room_manager import room_manager

logger = logging.getLogger(__name__)


class GameHandler:
    """游戏逻辑处理器"""

    @staticmethod
    async def handle_startup_idea(player_name: str, idea: str):
        """处理创业想法提交"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 设置玩家的创业想法
        player.startup_idea = idea
        logger.info(f"玩家 {player_name} 提交创业想法: {idea}")

        # 广播玩家想法提交状态更新
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.PLAYER_JOIN,  # 复用PLAYER_JOIN消息类型来更新玩家列表
                "data": {
                    "player_name": player_name,
                    "players": [
                        {
                            "name": p.name,
                            "is_online": p.is_online,
                            "startup_idea": p.startup_idea,
                            "role": p.role,
                            "isHost": p.is_host,
                        }
                        for p in room.players
                    ],
                },
            },
        )

        # 检查是否所有玩家都提交了想法
        if room.all_players_have_ideas():
            # 选择一个想法作为团队的创业想法（这里简单选择第一个）
            room.startup_idea = room.get_online_players()[0].startup_idea
            logger.info(f"房间 {room_id} 确定创业想法: {room.startup_idea}， 确认创业想法之后应该直接开始游戏。")

            # 广播所有想法已提交完成，可以开始游戏
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.IDEAS_COMPLETE,
                    "data": {
                        "startup_idea": room.startup_idea,
                        "players": [
                            {
                                "name": p.name,
                                "is_online": p.is_online,
                                "startup_idea": p.startup_idea,
                                "role": p.role,
                                "isHost": p.is_host,
                            }
                            for p in room.players
                        ],
                    },
                },
            )
            
            # 等待角色选择完成后再开始游戏
            # 移除自动开始游戏调用，改为在角色选择完成后开始

    @staticmethod
    async def _auto_start_game(room_id: str):
        """自动开始游戏（内部方法）"""
        room = room_manager.get_room(room_id)
        if not room:
            return

        # 只有在大厅状态时才能开始游戏
        if room.game_state == GameState.LOBBY:
            # 先广播游戏开始加载消息
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_LOADING,
                    "data": {"message": "AI正在生成游戏背景，请稍候..."},
                },
            )

            # 收集所有玩家的想法
            player_ideas = [
                p.startup_idea for p in room.get_online_players() if p.startup_idea
            ]

            # 生成背景故事
            try:
                background = await asyncio.get_event_loop().run_in_executor(
                    None,
                    room.generate_background_from_ideas,
                    player_ideas,
                )
                room.background = background
                logger.info(f"房间 {room_id} 生成背景故事: {background}")
                logger.info(f"房间 {room_id} 生成背景故事成功")
            except Exception as e:
                logger.error(f"房间 {room_id} 生成背景故事失败: {str(e)}")
                # 如果生成失败，使用默认背景
                room.background = "创业团队正在开始他们的创业之旅..."

            # 根据背景故事生成动态角色定义
            dynamic_roles = {}  # 默认使用硬编码角色
            try:
                generated_roles = await asyncio.get_event_loop().run_in_executor(
                    None,
                    room.generate_roles_from_background,
                    room.background,
                )
                # 转换生成的角色格式以匹配前端期望的格式
                dynamic_roles = {}
                for role_key, role_data in generated_roles.items():
                    try:
                        action = role_data.get("actions", [])
                    except ValueError:
                        # 如果角色键无效，使用空的actions列表
                        action = []

                    dynamic_roles[role_key] = {
                        "name": role_data["name"],
                        "description": role_data["description"],
                        "actions": action,
                    }
                # 保存动态角色定义到房间状态中
                room.dynamic_roles = dynamic_roles
                logger.info(f"房间 {room_id} 生成动态角色定义成功")
            except Exception as e:
                logger.error(f"房间 {room_id} 生成动态角色定义失败: {str(e)}")
                # 如果生成失败，使用默认角色定义
                dynamic_roles = {}

            room.game_state = GameState.ROLE_SELECTION
            logger.info(f"房间 {room_id} 自动开始游戏，进入角色选择阶段")

            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_START,
                    "data": {
                        "startup_idea": room.startup_idea,
                        "background": room.background,
                        "roles": dynamic_roles,
                    },
                },
            )

    @staticmethod
    async def handle_start_game(player_name: str):
        """处理开始游戏"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player or not player.is_host:
            return

        # 在大厅状态时生成背景和角色，在角色选择状态时开始第一轮游戏
        if room.game_state == GameState.LOBBY:
            # 先广播游戏开始加载消息
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_LOADING,
                    "data": {"message": "AI正在生成游戏背景，请稍候..."},
                },
            )

            # 收集所有玩家的想法
            player_ideas = [
                p.startup_idea for p in room.get_online_players() if p.startup_idea
            ]

            # 生成背景故事
            try:
                background = await asyncio.get_event_loop().run_in_executor(
                    None,
                    room.generate_background_from_ideas,
                    player_ideas,
                )
                room.background = background
                logger.info(f"房间 {room_id} 生成背景故事: {background}")
                logger.info(f"房间 {room_id} 生成背景故事成功")
            except Exception as e:
                logger.error(f"房间 {room_id} 生成背景故事失败: {str(e)}")
                # 如果生成失败，使用默认背景
                room.background = "创业团队正在开始他们的创业之旅..."

            # 根据背景故事生成动态角色定义
            dynamic_roles = {}  # 默认使用硬编码角色
            try:
                generated_roles = await asyncio.get_event_loop().run_in_executor(
                    None,
                    room.generate_roles_from_background,
                    room.background,
                )
                # 转换生成的角色格式以匹配前端期望的格式
                dynamic_roles = {}
                for role_key, role_data in generated_roles.items():
                    try:
                        action = role_data.get("actions", [])
                    except ValueError:
                        # 如果角色键无效，使用空的actions列表
                        action = []

                    dynamic_roles[role_key] = {
                        "name": role_data["name"],
                        "description": role_data["description"],
                        "actions": action,
                    }
                # 保存动态角色定义到房间状态中
                room.dynamic_roles = dynamic_roles
                logger.info(f"房间 {room_id} 生成动态角色定义成功")
            except Exception as e:
                logger.error(f"房间 {room_id} 生成动态角色定义失败: {str(e)}")
                # 如果生成失败，使用默认角色定义
                dynamic_roles = {}

            room.game_state = GameState.ROLE_SELECTION
            logger.info(f"房间 {room_id} 开始游戏，进入角色选择阶段")

            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.GAME_START,
                    "data": {
                        "startup_idea": room.startup_idea,
                        "background": room.background,
                        "roles": dynamic_roles,
                    },
                },
            )
        
        # 如果在角色选择状态且所有角色已选择，开始第一轮游戏
        elif room.game_state == GameState.ROLE_SELECTION and room.all_players_have_roles():
            await GameHandler._auto_start_game_after_role_selection(room_id)

    @staticmethod
    async def handle_role_selection(player_name: str, role: str):
        """处理角色选择"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 将角色ID转换为小写以匹配枚举值
        role_lower = role.lower()

        # 检查角色是否有效
        if role_lower not in Role.__members__.values():
            return

        # 检查角色是否已被选择
        role_taken = any(
            p.role == role_lower for p in room.players if p.name != player_name
        )
        if role_taken:
            return

        # 设置玩家角色
        player.role = Role(role_lower)
        logger.info(f"玩家 {player_name} 选择角色: {role}")

        # 广播角色选择
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROLE_SELECTED,
                "data": {
                    "selectedRoles": room.get_selected_roles(),
                    "players": [
                        {
                            "name": p.name,
                            "is_online": p.is_online,
                            "role": p.role,
                            "startup_idea": p.startup_idea,
                            "isHost": p.is_host,
                        }
                        for p in room.players
                    ],
                },
            },
        )

        # 检查是否所有玩家都选择了角色
        if room.all_players_have_roles():
            logger.info(f"房间 {room_id} 所有角色已选择，等待开始游戏")
            
            # 所有玩家选择完角色后，广播角色选择完成消息，等待房主开始游戏
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": MessageType.ROLES_COMPLETE,
                    "data": {
                        "selectedRoles": room.get_selected_roles(),
                        "players": [
                            {
                                "name": p.name,
                                "is_online": p.is_online,
                                "role": p.role,
                                "startup_idea": p.startup_idea,
                                "isHost": p.is_host,
                            }
                            for p in room.players
                        ],
                    },
                },
            )

    @staticmethod
    async def _auto_start_game_after_role_selection(room_id: str):
        """角色选择完成后开始第一轮游戏（内部方法）"""
        room = room_manager.get_room(room_id)
        if not room:
            return

        room.current_round = 1
        logger.info(f"房间 {room_id} 所有角色已选择，开始第1轮游戏")

        # 先广播回合加载状态
        room.game_state = GameState.LOADING
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_LOADING,
                "data": {"round": 1, "message": "AI正在生成第1轮事件，请稍候..."},
            },
        )

        # 生成第一轮事件
        try:
            event_data = await asyncio.get_event_loop().run_in_executor(
                None, room.generate_event, 1
            )

            # 保存事件和私人信息到房间状态
            room.round_events[1] = event_data["event"]
            room.round_private_messages[1] = event_data["private_messages"]
            room.round_situation[1] = event_data["situation"]

            logger.info(f"房间 {room_id} 第1轮事件生成成功")
        except Exception as e:
            logger.error(f"房间 {room_id} 生成第1轮事件失败: {str(e)}")
            # 如果生成失败，使用默认事件
            default_event = {
                "description": "团队面临第一个重要决策...",
                "options": [
                    "选项1: 保守策略",
                    "选项2: 激进策略",
                    "选项3: 平衡策略",
                    "选项4: 创新策略",
                ],
            }
            room.round_events[1] = default_event
            room.round_private_messages[1] = {}

        # 设置游戏状态为进行中并广播游戏开始消息
        room.game_state = GameState.PLAYING
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.GAME_STARTED,
                "data": {
                    "round": 1,
                    "roundEvent": room.round_events[1],
                    "privateMessages": room.round_private_messages[1],
                },
            },
        )

    @staticmethod
    async def handle_game_action(player_name: str, action_data: Dict):
        """处理游戏行动"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room or room.game_state != GameState.PLAYING:
            return

        player = room.get_player(player_name)
        if not player:
            return

        # 构建行动数据
        action = {
            "player": player_name,
            "role": player.role,
            "action": action_data.get("action"),
            "reason": action_data.get("reason"),
            "timestamp": datetime.now().isoformat(),
        }

        room.add_round_action(room.current_round, action)
        logger.info(
            f"玩家 {player_name} 提交第{room.current_round}轮行动: {action['action']}"
        )

        # 广播行动提交
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ACTION_SUBMITTED,
                "data": {
                    "playerActions": room.round_actions.get(room.current_round, []),
                    "waitingForPlayers": not room.all_players_submitted_actions(
                        room.current_round
                    ),
                },
            },
        )

        # 检查是否所有玩家都提交了行动
        if room.all_players_submitted_actions(room.current_round):
            await GameHandler._handle_round_complete(room_id, room)

    @staticmethod
    async def _handle_round_complete(room_id: str, room: GameRoom):
        """处理轮次完成"""
        logger.info(f"房间 {room_id} 第{room.current_round}轮完成")

        # 先向前端发送加载状态通知
        room.game_state = GameState.LOADING
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_LOADING,
                "data": {
                    "round": room.current_round,
                    "message": f"AI正在处理第{room.current_round}轮结果，请稍候...",
                },
            },
        )

        # 根据当前轮次的结果生成下一轮的动态信息
        if room.current_round < 5:
            try:
                # 生成下一轮的动态信息
                event_data = await asyncio.get_event_loop().run_in_executor(
                    None, room.generate_event, 1
                )
               
            except Exception as e:
                logger.error(f"房间 {room_id} 生成下一轮动态信息失败: {str(e)}")

        # 恢复游戏状态并广播轮次完成
        room.game_state = GameState.PLAYING
        await connection_manager.broadcast_to_room(
            room_id,
            {"type": MessageType.ROUND_COMPLETE, "data": {"round": room.current_round}},
        )

        # 检查是否游戏结束
        if room.current_round >= 5:
            await GameHandler._handle_game_complete(room_id, room)
        # 不自动进入下一轮，等待前端确认

    @staticmethod
    async def _handle_game_complete(room_id: str, room):
        """处理游戏完成"""
        room.game_state = GameState.FINISHED
        room.game_result = room.calculate_game_result()
        logger.info(f"房间 {room_id} 游戏结束")

        await connection_manager.broadcast_to_room(
            room_id,
            {"type": MessageType.GAME_COMPLETE, "data": {"result": room.game_result}},
        )

    @staticmethod
    async def handle_continue_next_round(player_name: str):
        """处理继续下一轮请求"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room or room.game_state != GameState.PLAYING:
            return

        # 只有房主可以继续下一轮
        player = room.get_player(player_name)
        if not player or not player.is_host:
            return

        await GameHandler._start_next_round(room_id, room)

    @staticmethod
    async def _start_next_round(room_id: str, room):
        """开始下一轮"""
        room.current_round += 1
        logger.info(f"房间 {room_id} 开始第{room.current_round}轮")

        # 先广播回合加载状态
        room.game_state = GameState.LOADING
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_LOADING,
                "data": {
                    "round": room.current_round,
                    "message": f"AI正在生成第{room.current_round}轮事件，请稍候...",
                },
            },
        )

        # 生成当前轮次的事件
        try:

            # 设置之前的输出用于生成连贯的事件
            if room.current_round > 1:
                previous_round = room.current_round - 1
                if previous_round in room.round_actions:
                    room.round_situation[room.current_round] = {
                        "round": previous_round,
                        "players_choices": {},  # 这里可以根据实际行动数据构建
                        "final_choice": 1,  # 简化处理
                        "impact": "上一轮的决策产生了影响...",
                    }

            event_data = await asyncio.get_event_loop().run_in_executor(
                None, room.generate_event, room.current_round
            )

            # 保存事件和私人信息到房间状态
            room.round_events[room.current_round] = event_data["event"]
            room.round_private_messages[room.current_round] = event_data[
                "private_messages"
            ]

            logger.info(f"房间 {room_id} 第{room.current_round}轮事件生成成功")
            logger.info(f"私人信息内容: {event_data['private_messages']}")
        except Exception as e:
            logger.error(
                f"房间 {room_id} 生成第{room.current_round}轮事件失败: {str(e)}"
            )
            # 如果生成失败，使用默认事件
            default_event = {
                "description": f"团队面临第{room.current_round}轮的重要决策...",
                "options": [
                    "选项1: 保守策略",
                    "选项2: 激进策略",
                    "选项3: 平衡策略",
                    "选项4: 创新策略",
                ],
            }
            room.round_events[room.current_round] = default_event
            room.round_private_messages[room.current_round] = {}

        # 设置游戏状态为进行中并广播轮次开始
        room.game_state = GameState.PLAYING
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.ROUND_START,
                "data": {
                    "round": room.current_round,
                    "roundInfo": room.get_round_info(room.current_round),
                    "roundEvent": room.round_events[room.current_round],
                    "privateMessages": room.round_private_messages[room.current_round],
                },
            },
        )

    @staticmethod
    async def handle_restart_game(player_name: str):
        """处理游戏重新开始"""
        room_id = connection_manager.get_player_room(player_name)
        if not room_id:
            return

        room = room_manager.get_room(room_id)
        if not room:
            return

        player = room.get_player(player_name)
        if not player or not player.is_host:
            return

        # 只有房主可以重新开始游戏
        room.restart_game()
        logger.info(f"房间 {room_id} 游戏重新开始")

        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": MessageType.GAME_RESTART,
                "data": {
                    "players": [
                        {
                            "name": p.name,
                            "is_online": p.is_online,
                            "role": p.role,
                            "startup_idea": p.startup_idea,
                            "isHost": p.is_host,
                        }
                        for p in room.players
                    ],
                },
            },
        )


# 全局游戏处理器实例
game_handler = GameHandler()
