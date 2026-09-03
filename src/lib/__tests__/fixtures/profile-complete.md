# Portfolio Profile fixture

<!-- portfolio-profile:start -->
```json
{
  "version": 1,
  "profile": {
    "name": { "zh": "王小明", "en": "Xiaoming Wang" },
    "title": { "zh": "软件工程师", "en": "Software Engineer" },
    "summary": { "zh": "专注于可靠的 Web 产品。" },
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
  "featuredProjects": ["project-one", "project-two", "project-three"],
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
