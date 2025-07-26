import openai
import json
import os
from typing import Iterable, Optional, Dict, Any, List
from dotenv import load_dotenv

from logger_config import logger

# 加载.env文件
load_dotenv()
from openai.types.chat import ChatCompletionMessageParam
model = "qwen/qwen3-coder-480b-a35b-instruct"


class LLM:
    """封装OpenAI大模型的类"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = model,
        base_url: Optional[str] = None,
    ):
        # 从环境变量获取api_key和base_url
        if api_key is None:
            api_key = os.getenv('PPIO_API_KEY')
        if base_url is None:
            base_url = os.getenv('PPIO_BASE_URL')
        self.client = openai.OpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    def text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        生成文本响应

        Args:
            prompt: 用户输入的提示
            system_prompt: 系统提示（可选）
            temperature: 温度参数，控制随机性
            max_tokens: 最大token数量

        Returns:
            生成的文本内容
        """
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        logger.info(f"发送给OpenAI的消息: {messages}")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            logger.info(f"生成的结果:{response.choices[0].message.content}")
            return response.choices[0].message.content or ""
        except Exception as e:
            raise Exception(f"调用OpenAI API失败: {str(e)}")

    def json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        生成JSON格式的响应

        Args:
            prompt: 用户输入的提示
            system_prompt: 系统提示（可选）
            temperature: 温度参数，默认较低以获得更稳定的JSON输出
            max_tokens: 最大token数量

        Returns:
            解析后的JSON对象
        """
        # 如果没有提供系统提示，添加默认的JSON格式要求
        if not system_prompt:
            system_prompt = "请以有效的JSON格式回复，不要包含任何其他文本。不要包含markdown格式的前后缀！"
        else:
            system_prompt += "\n\n请确保回复是有效的JSON格式。"
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )

            logger.info(f"提示词：{prompt}")

            content = response.choices[0].message.content or ""

            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]

            logger.info(f"生成结果:{content}")
            return json.loads(content)
        except json.JSONDecodeError as e:
            raise Exception(f"返回的内容不是有效的JSON格式: {str(e)}")
        except Exception as e:
            raise Exception(f"调用OpenAI API失败: {str(e)}")

    def chat(
        self,
        messages: Iterable[ChatCompletionMessageParam],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        多轮对话

        Args:
            messages: 消息列表，每个消息包含role和content
            temperature: 温度参数
            max_tokens: 最大token数量

        Returns:
            生成的回复内容
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise Exception(f"调用OpenAI API失败: {str(e)}")


# 使用示例
if __name__ == "__main__":
    # 初始化LLM实例
    llm = LLM()

    # 文本生成示例
    try:
        text_response = llm.text("请100字以内介绍一下Python编程语言")
        print("文本响应:", text_response)
    except Exception as e:
        print(f"文本生成错误: {e}")

    # JSON生成示例
    try:
        json_response = llm.json("请生成一个包含姓名、年龄、职业的人员信息")
        print("JSON响应:", json_response)
    except Exception as e:
        print(f"JSON生成错误: {e}")
