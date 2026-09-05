# Git-Managed Profile Data

This file is the version-controlled source of truth for the public Portfolio
Profile. Edit the JSON inside the marked block and commit the change through the
normal Git workflow. See `docs/git-managed-profile-data.md` for the schema and
editing rules.

<!-- portfolio-profile:start -->
```json
{
  "version": 1,
  "profile": {
    "name": {
      "zh": "王小冠",
      "en": "Xiaoguan Wang"
    },
    "title": {
      "zh": "企业级云与基础架构解决方案架构师",
      "en": "Enterprise Cloud & Infrastructure Solution Architect"
    },
    "summary": {
      "zh": "拥有近10年企业级IT基础架构、云计算及解决方案咨询经验。擅长连接客户业务、技术与管理团队，通过需求洞察、IT战略规划和Solution Selling推动云平台与数据中心解决方案落地。",
      "en": "Nearly a decade of experience in enterprise IT infrastructure, cloud computing, and solution consulting. Skilled at connecting business, technology, and management stakeholders to turn customer needs and IT strategy into successful cloud and data center solutions through solution selling."
    },
    "gender": {
      "zh": "男",
      "en": "Male"
    },
    "location": {
      "zh": "深圳",
      "en": "Shenzhen"
    },
    "avatar": {
      "src": "https://avatars.githubusercontent.com/u/97532151?v=4",
      "alt": {
        "zh": "王小冠的个人头像",
        "en": "Portrait of Xiaoguan Wang"
      }
    },
    "githubUrl": "https://github.com/joneswxg"
  },
  "skills": [
    {
      "category": {
        "zh": "解决方案咨询与销售",
        "en": "Solution Consulting & Sales"
      },
      "items": [
        { "zh": "Solution Selling", "en": "Solution Selling" },
        { "zh": "客户需求洞察", "en": "Customer Needs Discovery" },
        { "zh": "IT战略规划", "en": "IT Strategy Planning" },
        { "zh": "PoC与投标支持", "en": "PoC & Bid Support" }
      ]
    },
    {
      "category": {
        "zh": "云与数据中心",
        "en": "Cloud & Data Center"
      },
      "items": [
        { "zh": "私有云与混合云", "en": "Private & Hybrid Cloud" },
        { "zh": "VMware Cloud Foundation", "en": "VMware Cloud Foundation" },
        { "zh": "Kubernetes与云原生", "en": "Kubernetes & Cloud Native" },
        { "zh": "高可用与灾备", "en": "High Availability & Disaster Recovery" }
      ]
    },
    {
      "category": {
        "zh": "企业级基础架构",
        "en": "Enterprise Infrastructure"
      },
      "items": [
        { "zh": "服务器与存储", "en": "Servers & Storage" },
        { "zh": "网络与虚拟化", "en": "Networking & Virtualization" },
        { "zh": "VDI桌面云", "en": "VDI" },
        { "zh": "统一运维与自动化", "en": "Unified Operations & Automation" }
      ]
    },
    {
      "category": {
        "zh": "行业与客户经营",
        "en": "Industry & Account Development"
      },
      "items": [
        { "zh": "金融行业", "en": "Financial Services" },
        { "zh": "制造业", "en": "Manufacturing" },
        { "zh": "企业及SMB客户", "en": "Enterprise & SMB Customers" },
        { "zh": "生态伙伴协同", "en": "Partner Ecosystem Collaboration" }
      ]
    }
  ],
  "experience": [
    {
      "organization": {
        "zh": "华为云（香港；Manpower Service，客户：Sparkoo Technologies Hong Kong）",
        "en": "Huawei Cloud, Hong Kong (Manpower Service; client: Sparkoo Technologies Hong Kong)"
      },
      "role": {
        "zh": "解决方案架构师",
        "en": "Solution Architect"
      },
      "start": "2025-12",
      "end": {
        "zh": "2026-03",
        "en": "2026-03"
      },
      "summary": {
        "zh": "面向银行、保险和证券客户提供云转型咨询与金融级云架构设计，支持重点商机从需求分析、技术验证到项目落地。",
        "en": "Advised banking, insurance, and securities customers on cloud transformation and designed financial-grade cloud architectures, supporting strategic opportunities from discovery and validation through delivery."
      },
      "highlights": [
        {
          "zh": "围绕计算、存储、网络、云原生、高可用和灾备设计华为云解决方案。",
          "en": "Designed Huawei Cloud solutions spanning compute, storage, networking, cloud native, high availability, and disaster recovery."
        },
        {
          "zh": "结合金融业务场景与合规要求，协助客户规划云转型路径并控制迁移风险。",
          "en": "Aligned cloud transformation roadmaps with financial use cases and compliance requirements while reducing migration risk."
        },
        {
          "zh": "协同销售开展客户交流、方案汇报、PoC验证及投标支持，推动解决方案价值认可与业务转化。",
          "en": "Partnered with sales on customer workshops, proposals, PoCs, and bids to build solution confidence and advance conversion."
        }
      ]
    },
    {
      "organization": {
        "zh": "VMware－威睿信息技术（中国）有限公司 / Broadcom",
        "en": "VMware China / Broadcom"
      },
      "role": {
        "zh": "高级解决方案销售",
        "en": "Senior Solution Sales"
      },
      "start": "2014-10",
      "end": {
        "zh": "2024-06",
        "en": "2024-06"
      },
      "summary": {
        "zh": "面向制造、金融及大型企业客户开展云计算与数据中心解决方案咨询，负责需求挖掘、架构设计、价值沟通、PoC验证和项目推进。",
        "en": "Led cloud computing and data center solution consulting for manufacturing, financial services, and large enterprise customers, covering discovery, architecture, value communication, PoCs, and opportunity execution."
      },
      "highlights": [
        {
          "zh": "参与并推动300余个企业数据中心及基础架构项目，协同销售团队制定客户拓展与竞争策略。",
          "en": "Contributed to more than 300 enterprise data center and infrastructure projects while partnering with sales on account and competitive strategies."
        },
        {
          "zh": "主导虚拟化、vSAN、VDI、业务连续性、灾备和数据保护等方案设计，提升客户IT敏捷性与稳定性。",
          "en": "Led solution design across virtualization, vSAN, VDI, business continuity, disaster recovery, and data protection to improve IT agility and resilience."
        },
        {
          "zh": "为TCL与立讯精密规划多数据中心标准化、私有云与混合云演进路径，支持IaaS和Kubernetes工作负载落地。",
          "en": "Planned multi-data-center standardization and private/hybrid cloud roadmaps for TCL and Luxshare, supporting IaaS and Kubernetes workloads."
        },
        {
          "zh": "为比亚迪财险和开泰银行设计私有云、统一运维与容器云方案，推动核心业务系统迁移上云。",
          "en": "Designed private cloud, unified operations, and container platform solutions for BYD Insurance and KASIKORNBANK, enabling core business systems to migrate to cloud platforms."
        }
      ]
    },
    {
      "organization": {
        "zh": "IBM－国际商业机器（中国）有限公司 STG",
        "en": "IBM China, Systems and Technology Group"
      },
      "role": {
        "zh": "System x 售前工程师",
        "en": "System x Presales Engineer"
      },
      "start": "2011-09",
      "end": {
        "zh": "2014-09",
        "en": "2014-09"
      },
      "summary": {
        "zh": "面向腾讯、网易及华南企业与SMB客户提供服务器和基础架构售前支持，协助销售团队推进重点项目。",
        "en": "Provided server and infrastructure presales support for Tencent, NetEase, and enterprise and SMB customers across South China."
      },
      "highlights": [
        {
          "zh": "根据业务需求完成服务器选型、架构设计与性能优化，增强关键项目竞争力。",
          "en": "Translated business requirements into server sizing, architecture design, and performance optimization for strategic opportunities."
        },
        {
          "zh": "负责Benchmark、性能测试与技术验证，通过数据分析支持客户决策。",
          "en": "Led benchmarks, performance testing, and technical validation to support evidence-based customer decisions."
        },
        {
          "zh": "支持新产品推广、渠道技术培训和客户交流，扩大产品市场覆盖。",
          "en": "Supported product launches, channel enablement, and customer workshops to expand market coverage."
        }
      ]
    },
    {
      "organization": {
        "zh": "IBM－国际商业机器（中国）有限公司 ISC",
        "en": "IBM China, Integrated Supply Chain"
      },
      "role": {
        "zh": "亚太及日本地区 L2 System x 技术支持工程师",
        "en": "APJ L2 System x Support Engineer"
      },
      "start": "2010-11",
      "end": {
        "zh": "2011-09",
        "en": "2011-09"
      },
      "summary": {
        "zh": "负责IBM System x服务器、刀片服务器及相关基础架构产品的二线技术支持。",
        "en": "Delivered level-two support for IBM System x servers, blade systems, and related infrastructure products across Asia Pacific and Japan."
      },
      "highlights": [
        {
          "zh": "分析企业客户生产环境问题，完成故障定位并协助实施解决方案。",
          "en": "Diagnosed production issues and supported customers through resolution implementation."
        },
        {
          "zh": "通过跨团队技术协作提升系统可靠性和客户满意度。",
          "en": "Improved system reliability and customer satisfaction through cross-team technical collaboration."
        }
      ]
    },
    {
      "organization": {
        "zh": "中国电信股份有限公司汕头分公司",
        "en": "China Telecom, Shantou Branch"
      },
      "role": {
        "zh": "运维工程师",
        "en": "Operations Engineer"
      },
      "start": "2005-07",
      "end": {
        "zh": "2008-04",
        "en": "2008-04"
      },
      "summary": {
        "zh": "负责企业应用软件及内部办公网络的日常运维，保障业务系统和网络基础设施稳定运行。",
        "en": "Maintained enterprise applications and internal office networks to support reliable business systems and network infrastructure."
      },
      "highlights": [
        {
          "zh": "承担企业应用软件维护以及路由器、交换机等网络设备管理。",
          "en": "Maintained enterprise applications and administered routers, switches, and other network equipment."
        },
        {
          "zh": "参与网络割接和日常运维，保障内部OA网络连续性。",
          "en": "Supported network cutovers and daily operations to maintain office network continuity."
        }
      ]
    }
  ],
  "education": [
    {
      "institution": {
        "zh": "澳大利亚伍伦贡大学",
        "en": "University of Wollongong, Australia"
      },
      "qualification": {
        "zh": "电子商务与网络管理硕士",
        "en": "Master's Degree in E-Commerce and Network Management"
      },
      "start": "—",
      "end": "2010-07"
    },
    {
      "institution": {
        "zh": "广东工业大学",
        "en": "Guangdong University of Technology"
      },
      "qualification": {
        "zh": "计算机科学与技术学士",
        "en": "Bachelor's Degree in Computer Science and Technology"
      },
      "start": "—",
      "end": "2005-06"
    }
  ],
  "certifications": [
    {
      "name": {
        "zh": "VMware Cloud 专业认证（VCP-VMC）",
        "en": "VMware Certified Professional – VMware Cloud (VCP-VMC)"
      },
      "issuer": {
        "zh": "VMware",
        "en": "VMware"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "数据中心虚拟化专业认证（VCP-DC）",
        "en": "VMware Certified Professional – Data Center Virtualization (VCP-DC)"
      },
      "issuer": {
        "zh": "VMware",
        "en": "VMware"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "网络虚拟化专业认证（VCP-NV）",
        "en": "VMware Certified Professional – Network Virtualization (VCP-NV)"
      },
      "issuer": {
        "zh": "VMware",
        "en": "VMware"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "云管理与自动化专业认证（VCP-CMA）",
        "en": "VMware Certified Professional – Cloud Management and Automation (VCP-CMA)"
      },
      "issuer": {
        "zh": "VMware",
        "en": "VMware"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "网络虚拟化高级专业认证（VCAP-NV）",
        "en": "VMware Certified Advanced Professional – Network Virtualization (VCAP-NV)"
      },
      "issuer": {
        "zh": "VMware",
        "en": "VMware"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "Kubernetes 管理员认证（CKA）",
        "en": "Certified Kubernetes Administrator (CKA)"
      },
      "issuer": {
        "zh": "Linux Foundation",
        "en": "Linux Foundation"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "红帽认证工程师（RHCE）",
        "en": "Red Hat Certified Engineer (RHCE)"
      },
      "issuer": {
        "zh": "Red Hat",
        "en": "Red Hat"
      },
      "date": "—"
    },
    {
      "name": {
        "zh": "红帽 OpenShift 管理专家认证",
        "en": "Red Hat Certified Specialist in OpenShift Administration"
      },
      "issuer": {
        "zh": "Red Hat",
        "en": "Red Hat"
      },
      "date": "—"
    }
  ],
  "featuredProjects": [
    "GIF-Download-Tool",
    "sub2api-ha",
    "todo-list-app"
  ],
  "projectRules": {
    "excludedRepositories": [
      "devops-training",
      "test-jones"
    ],
    "admittedForks": [
      {
        "repository": "sub2api-ha",
        "upstream": "Wei-Shaw/sub2api",
        "attribution": {
          "zh": "在上游项目基础上设计并实现多角色运行时、高可用启动门控、就绪探针与工作负载隔离。",
          "en": "Designed and implemented role-based runtimes, high-availability startup gates, readiness handling, and workload isolation on top of the upstream project."
        }
      },
      {
        "repository": "todo-list-app",
        "upstream": "zjx-immersion/todo-list-app",
        "attribution": {
          "zh": "新增按编号查询任务与查询未完成分配任务的接口，并补充区域 Maven 镜像配置。",
          "en": "Added task lookup and pending assigned-task endpoints, plus regional Maven repository configuration."
        }
      }
    ]
  }
}
```
<!-- portfolio-profile:end -->
