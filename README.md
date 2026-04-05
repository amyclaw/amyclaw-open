# AmyClaw Universal Deployment (V2.11)

## 💻Ready in 5 Minutes: Download ISO -> Flash -> Boot -> sudo eggs krill
##  https://drive.google.com/drive/folders/1TbjFvQww2ywSMKaiHlxj34Mwj9CGI4BA?usp=drive_link
##  

<p align="center">
  <img src="https://github.com/amyclaw/amyclaw-open/blob/main/docs/AMYCLAW_UI_CN.png" alt="AmyClaw Architecture Overview" width="800">
</p>

<p align="center">
  <img src="https://github.com/amyclaw/amyclaw-open/blob/main/docs/AMYCLAW_UI.png" alt="AmyClaw Interface Screenshot" width="800">
</p>

---

AmyClaw is a pre-optimized, one-click installation image designed for standard x86 architecture. It serves as a stable, always-on AI gateway, supporting automated deployment and seamless integration with major IM platforms (Feishu/Lark, WhatsApp, etc.) and LLMs.

---

## 💻 Hardware Requirements
* **Architecture:** x86 (Universal for Cloud VPC & Local Physical Machines)
* **Storage:** 120GB SSD (Minimum)
* **Memory:** 4GB RAM (Minimum)

---

## 🚀 Quick Start Guide / 快速上手指南

### Phase 1: Installation Steps / 安裝步驟

1. **Prepare Installation Media / 製作U盤安裝盤**
   Flash the ISO image to a USB drive to create a bootable installer.

2. **BIOS Boot / 電腦BIOS引導安裝**
   Insert the USB drive into your target machine and select it as the primary boot device in the BIOS.

3. **One-Click Setup / 一鍵安裝登錄**
   Use the following credentials to begin the automated installation:
   * **Username:** `amyclaw`
   * **Password:** `amyclaw20260315`

4. **Command Line Execution / 命令行安裝**
   Run the following command to initiate the system installer:
   ```bash
   sudo eggs krill
5. **Finalize Installation / 默認完成安裝** Press **Enter** for all default prompts.

   > [!IMPORTANT]
   > **Watch the screen closely for the IP Address and write it down.** Once finished, unplug the USB drive and reboot.

---

### ⚠️ Security Notice / 安全提醒 (Required)

For your system security, please change the default passwords immediately after the first login:
* **Change user password:** Run `passwd`
* **Change root password:** Run `sudo passwd root`

---

### Phase 2: System Configuration / 系統配置

1. **Web Access / 访问控制台** Once rebooted, open a browser on another device and go to: `http://[your-ip]:8080`

2. **Gateway Token / 自动创建网关令牌** The system will automatically generate a **Gateway Token**. Ensure you copy and save this immediately.

3. **IM Integration / 输入即时通讯账号** Enter your IM platform details (e.g., Feishu/Lark App ID and Secret). Supported platforms include DingTalk, LINE, Microsoft Teams, and WhatsApp.

4. **LLM Configuration / 输入大模型Token** * Enter your `idatabase.ai` token (New users get 200K free tokens).
   * **Model Selection:** Choose "Any Model".
   * **Recommended:** `gemini-3-flash-lite-preview`

5. **Memory Model / 输入记忆模型Token** * Enter the `idatabase.ai` token for the embedding engine.
   * **Selection:** `text-embedded-005`

6. **Save & Restart / 保存并重启** Scroll to the bottom, click **Save All**, then click **Restart Gateway** (右侧点击重启网关) on the right sidebar.

---

## 🤖 Usage / 如何使用

1. **IM Activation:** Create a group chat in your IM (e.g., Feishu).
2. **Add Bot:** Add the bot you just configured to the group.
3. **Start Chat:** `@ the bot` to start a conversation.

---

## 🛠 Technical Summary / 技术摘要

| Component / 组件 | Configuration / 配置 |
| :--- | :--- |
| **System Version** | V2.11 amyclaw |
| **Installer** | Eggs Krill |
| **Default Port** | 8080 |
| **LLM Provider** | idatabase.ai |
| **Embedding** | text-embedded-005 |

> [!NOTE]
> LINE and Teams integration are currently untested in this release.  
> 註：LINE 和 Teams 插件在此版本中尚未經過測試。
