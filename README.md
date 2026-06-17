# 信驿 MailHub

邮件聚合转发系统 —— 汇聚各平台邮件，按规则自动转达至企微、飞书、邮箱。

## 项目结构

```
mail_1/
├── backend/                  # Python FastAPI 后端
│   ├── main.py               # 启动入口
│   ├── requirements.txt      # Python 依赖
│   ├── .env.example          # 环境变量模板
│   ├── config/
│   │   └── routes.yaml       # 路由规则人工备份
│   ├── data/                 # JSON 数据存储（.gitignore）
│   └── src/
│       ├── store.py          # JSON 文件读写（唯一数据层）
│       ├── receiver.py       # IMAP 轮询拉取邮件
│       ├── parser.py         # 邮件内容解析
│       ├── router.py         # 路由规则匹配引擎
│       ├── scheduler.py      # APScheduler 定时任务
│       ├── channels/
│       │   ├── base.py       # BaseChannel 抽象类
│       │   ├── email.py      # 邮箱转发渠道
│       │   └── wecom.py      # 企微群机器人渠道
│       └── api/
│           ├── deps.py       # JWT 校验依赖
│           └── routes.py     # REST API + WebSocket
│
├── frontend/                 # Next.js 14 前端
│   ├── src/
│   │   ├── app/              # App Router 页面
│   │   ├── components/       # 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── lib/              # API 封装 / Mock 数据
│   │   └── types/            # TypeScript 类型
│   ├── tailwind.config.ts
│   └── package.json
│
├── .env.example              # 根目录环境变量
└── README.md
```

## 本地开发启动步骤

### 1. 配置环境变量

```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env，填入 IMAP 邮箱信息和登录密码

# 前端
cd ../frontend
cp .env.local.example .env.local
```

### 2. 启动后端

```bash
cd backend
pip install -r requirements.txt
python main.py
# 后端运行在 http://localhost:8000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:3000
```

### 4. 访问

- 首页：http://localhost:3000
- 管理后台：http://localhost:3000/login
- 默认账号：admin@mailhub.local / changeme

## 技术栈

**后端**：Python 3.11+ / FastAPI / APScheduler / imap-tools / httpx / python-jose

**前端**：Next.js 14 (App Router) / TypeScript / Tailwind CSS / Framer Motion / Recharts

**数据存储**：JSON 文件（开发阶段，无数据库依赖）
