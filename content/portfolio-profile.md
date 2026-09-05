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
      "zh": "joneswxg",
      "en": "joneswxg"
    },
    "title": {
      "zh": "全栈软件工程实践者",
      "en": "Full-stack software engineering practitioner"
    },
    "summary": {
      "zh": "关注可靠、可维护的 Web 产品，通过公开项目和技术文章持续记录工程实践。",
      "en": "Focused on reliable, maintainable web products, with engineering practice documented through public projects and technical writing."
    },
    "avatar": {
      "src": "https://avatars.githubusercontent.com/u/97532151?v=4",
      "alt": {
        "zh": "joneswxg 的个人头像",
        "en": "Portrait of joneswxg"
      }
    },
    "githubUrl": "https://github.com/joneswxg"
  },
  "skills": [
    {
      "category": {
        "zh": "Web 开发",
        "en": "Web development"
      },
      "items": [
        { "zh": "TypeScript", "en": "TypeScript" },
        { "zh": "React", "en": "React" },
        { "zh": "Next.js", "en": "Next.js" }
      ]
    },
    {
      "category": {
        "zh": "数据与质量",
        "en": "Data and quality"
      },
      "items": [
        { "zh": "PostgreSQL", "en": "PostgreSQL" },
        { "zh": "Drizzle ORM", "en": "Drizzle ORM" },
        { "zh": "自动化测试", "en": "Automated testing" }
      ]
    }
  ],
  "experience": [],
  "education": [],
  "certifications": [],
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
