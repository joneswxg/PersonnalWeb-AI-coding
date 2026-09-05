# Portfolio Profile fixture

<!-- portfolio-profile:start -->
```json
{
  "version": 1,
  "profile": {
    "name": { "zh": "王小明", "en": "Xiaoming Wang" },
    "title": { "zh": "软件工程师", "en": "Software Engineer" },
    "summary": { "zh": "专注于可靠的 Web 产品。" },
    "gender": { "zh": "男", "en": "Male" },
    "location": { "zh": "深圳", "en": "Shenzhen" },
    "avatar": {
      "src": "https://assets.example.com/avatar-v1.webp",
      "alt": { "zh": "王小明的头像", "en": "Portrait of Xiaoming Wang" }
    },
    "githubUrl": "https://github.com/example"
  },
  "skills": [
    {
      "category": { "zh": "前端", "en": "Frontend" },
      "items": [
        { "zh": "React", "en": "React" },
        { "zh": "无障碍设计" }
      ]
    }
  ],
  "experience": [
    {
      "organization": { "zh": "示例科技", "en": "Example Technology" },
      "role": { "zh": "高级工程师", "en": "Senior Engineer" },
      "start": "2022-01",
      "end": { "zh": "至今", "en": "Present" },
      "summary": { "zh": "负责核心产品交付。", "en": "Led core product delivery." },
      "highlights": [
        { "zh": "改进发布可靠性。", "en": "Improved release reliability." },
        { "zh": "建立工程规范。" }
      ]
    }
  ],
  "clientProjects": [
    {
      "name": { "zh": "示例私有云建设", "en": "Example Private Cloud Program" },
      "role": { "zh": "高级系统工程师", "en": "Senior System Engineer" },
      "scale": "300K",
      "summary": { "zh": "建设标准化企业私有云平台。", "en": "Built a standardized enterprise private cloud platform." },
      "highlights": [
        { "zh": "完成现状调研与演进规划。", "en": "Assessed the current estate and planned its evolution." },
        { "zh": "推动关键业务迁移上线。" }
      ]
    }
  ],
  "education": [
    {
      "institution": { "zh": "示例大学", "en": "Example University" },
      "qualification": { "zh": "计算机科学学士", "en": "BSc Computer Science" },
      "start": "2016",
      "end": "2020",
      "details": { "zh": "主修软件工程。" }
    }
  ],
  "certifications": [
    {
      "name": { "zh": "云架构认证", "en": "Cloud Architecture Certification" },
      "issuer": { "zh": "示例机构", "en": "Example Institute" },
      "date": "2024-06",
      "credentialUrl": "https://credentials.example.com/123"
    }
  ],
  "featuredProjects": [
    {
      "repository": "project-one",
      "summary": { "zh": "本地项目简介一。", "en": "Local project summary one." },
      "technologies": ["TypeScript", "Next.js"]
    },
    {
      "repository": "project-two",
      "summary": { "zh": "本地项目简介二。", "en": "Local project summary two." },
      "technologies": ["Go"]
    },
    {
      "repository": "project-three",
      "summary": { "zh": "本地项目简介三。", "en": "Local project summary three." },
      "technologies": ["Java"]
    }
  ],
  "projectRules": {
    "excludedRepositories": ["tutorial-repository"],
    "admittedForks": [
      {
        "repository": "adapted-fork",
        "upstream": "upstream/original",
        "attribution": {
          "zh": "重构了数据模型并新增离线支持。",
          "en": "Reworked the data model and added offline support."
        }
      }
    ]
  }
}
```
<!-- portfolio-profile:end -->
