Quick Start Guide / 快速上手指南
This guide provides instructions for installing and configuring the V2.11 amyclaw system. This version features automated deployment and integration with IM platforms and LLMs.

Installation Steps / 安裝步驟
Prepare Installation Media / 製作U盤安裝盤 Flash the ISO image to a USB drive to create a bootable installer.
BIOS Boot / 電腦BIOS引導安裝 Insert the USB drive into your target machine and select it as the primary boot device in the BIOS.
One-Click Setup / 一鍵安裝登錄 Use the following credentials to begin the automated installation:
Username: amyclaw
Password: amyclaw20260315
Command Line Execution / 命令行安裝 Run the following command to initiate the system installer:
sudo eggs krill
Finalize Installation / 默認完成安裝 Press Enter for all default prompts.
Crucial: Watch the screen closely for the IP Address and write it down. Once finished, unplug the USB drive and reboot.

System Configuration / 系統配置
Web Access / 訪問控制台 Once rebooted, open a browser on another device and go to: http://[your-ip]:8080
Gateway Token / 自動創建網關令牌 The system will automatically generate a Gateway Token. Ensure you copy and save this immediately.
IM Integration / 輸入即時通訊賬號 Enter your IM platform details (e.g., Feishu/Lark App ID and Secret).
LLM Configuration / 輸入大模型Token Enter your idatabase.ai token (obtainable after registration).
Model Selection: Choose "Any Model."
Recommended: gemini-3-flash-lite-preview
Memory Model / 輸入記憶模型Token Enter the idatabase.ai token for the embedding engine.
Selection: text-embedded-005
Save & Restart / 保存並重啟 Scroll to the bottom, click Save All, then click Restart Gateway (右側點擊重啟網關) on the right sidebar.

Usage / 如何使用
IM Activation / 在即時通訊軟件中使用 * Create a group chat in your IM (e.g., Feishu).
Add the bot you just configured to the group.
@ the bot to start a conversation.

Technical Summary / 技術摘要
Component / 組件
Configuration / 配置
System Version
V2.11 amyclaw
Installer
Eggs Krill
Default Port
8080
LLM Provider
idatabase.ai (New registered user has free 200K free tokens to test the feature with LLM model such as  gemini-3-flash-lite-preview)
Embedding
text-embedded-005

Note: LINE and Teams integration are currently untested in this release.
註： LINE 和 Teams 插件在此版本中尚未經過測試。


https://docs.google.com/document/d/1hjMw4eZBXy7YwnG0fOO202UUgI1HH0NbP0dRNN9JzQ4/edit?usp=drive_link
https://drive.google.com/file/d/1XDeCiLVchQp_TcfwLOCufXcznG16hX8V/view?usp=drive_link
