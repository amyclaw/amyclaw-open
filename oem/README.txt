AmyClaw OEM（量产镜像内路径）
- 本目录来自母机 deploy-to-opt.sh，不依赖 /opt/amyclaw（该路径不会进入 ISO）。
- 若 DNS/resolv 异常，在克隆机执行: sudo bash /opt/amyclaw/oem/apply-network-oem.sh
- 飞书/大模型/网关自检（systemd、openclaw.json、.env、journal 摘要）:
  sudo bash /opt/amyclaw/oem/diagnose-openclaw-gateway-feishu.sh
