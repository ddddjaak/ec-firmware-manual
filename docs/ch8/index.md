<div class="chapter-header"><span class="chapter-num">08</span><span class="separator">/</span><a href="index.md">首页</a><span class="separator">›</span><span>最佳实践与建议</span></div>

# 最佳实践与建议

本章总结了基于 Chipsea OpenEC + Zephyr
平台的开发实践经验，从代码规范、能耗优化、安全加固到客户协同开发，提供一套体系化的工程标准。通过遵循这些最佳实践，开发团队可有效提升代码可维护性、降低功耗、增强系统安全性，并加快客户项目集成进度。

---

<div class="grid cards" markdown>

-   :material/microsoft-windows: **代码规范与提交流程（Coding Style / Commit / Doc）**

    ---

    ### 代码风格与结构规范

    [:material-arrow-right: 阅读](01_代码规范与提交流程.md)

-   :material/linux: **功耗优化策略（System / Peripheral / Application）**

    ---

    ### 系统级优化（System Level）

    [:material-arrow-right: 阅读](02_功耗优化策略.md)

-   :material/file-tree: **安全加固与运行时防护（Security Hardening）**

    ---

    嵌入式控制器在系统安全中扮演"信任根"的角色。因此需要在固件层面进行多维度安全防护：

    [:material-arrow-right: 阅读](03_安全加固与运行时防护.md)

-   :material/compare: **与客户应用的集成与协作（Integration & Co-Development）**

    ---

    EC 通常作为系统的底层控制核心，需要与主机 BIOS、EC
GUI、工厂测试系统等配合。因此协作开发与接口定义尤为重要。

    [:material-arrow-right: 阅读](04_与客户应用的集成与协作.md)

</div>
