import os
import subprocess
import sys
import os

def run_script(script_path):
    """运行指定的Python脚本"""
    print(f"\n===== 运行 {os.path.basename(script_path)} =====")
    # 获取脚本的绝对路径
    abs_script_path = os.path.abspath(script_path)
    # 获取脚本所在目录
    script_dir = os.path.dirname(abs_script_path)
    # 运行脚本
    result = subprocess.run([sys.executable, abs_script_path], cwd=script_dir)
    if result.returncode != 0:
        print(f"错误: {os.path.basename(script_path)} 运行失败")
        sys.exit(1)

def main():
    # 步骤1: 生成背景导入词
    run_script('script/step1_background.py')

    # 步骤2: 进行五轮决策
    run_script('script/step2_decision.py')

    # 步骤3: 生成结束语
    run_script('script/step3_conclusion.py')

    print("\n===== 创业模拟流程已完成 =====")

if __name__ == "__main__":
    main()