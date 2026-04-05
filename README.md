# AmyClaw Universal Deployment (V2.11)

<p align="center">
  <img src="https://drive.google.com/thumbnail?id=1XDeCiLVchQp_TcfwLOCufXcznG16hX8V&sz=w800" alt="AmyClaw Interface" width="600">
</p>

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
