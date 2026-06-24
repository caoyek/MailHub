# 信驿 MailHub

一站式邮件聚合转发系统 —— 汇聚各平台邮件，按规则自动转达至企微、飞书、邮箱。

水墨风格落地页在线预览：[https://caoyek.github.io/MailHub/](https://caoyek.github.io/MailHub/)

## 功能概览

- 多邮箱聚合接收（IMAP 协议，支持 QQ / 163 / Gmail / Outlook 等）
- 智能路由规则引擎（按发件人、主题、关键词匹配，自动分发到不同渠道）
- 多渠道转发（邮箱转发、企微群机器人，可扩展）
- 管理后台（邮箱账号管理、转发规则配置、日志查看、数据统计）
- 水墨风格落地页（书法字体、墨迹鼠标轨迹、滚动动画）

## 项目结构

```
MailHub/
├── backend/                       # Python FastAPI 后端
│   ├── main.py                    # 启动入口（Uvicorn，默认 :8000）
│   ├── requirements.txt           # Python 依赖
│   ├── config/
│   │   └── routes.yaml            # 路由规则人工备份
│   ├── data/                      # JSON 数据存储（.gitignore）
│   └── src/
│       ├── store.py               # JSON 文件读写（数据层）
│       ├── receiver.py            # IMAP 轮询拉取邮件
│       ├── parser.py              # 邮件内容解析
│       ├── router.py              # 路由规则匹配引擎
│       ├── scheduler.py           # APScheduler 定时任务
│       ├── channels/
│       │   ├── base.py            # BaseChannel 抽象类
│       │   ├── email.py           # 邮箱转发渠道
│       │   └── wecom.py           # 企微群机器人渠道
│       └── api/
│           ├── deps.py            # JWT 校验依赖
│           └── routes.py          # REST API + WebSocket
│
├── frontend/                      # Next.js 14 前端
│   ├── next.config.js             # 含静态导出配置（GitHub Pages）
│   ├── tailwind.config.ts         # Tailwind 主题（水墨色板）
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # 落地页主入口
│       │   ├── layout.tsx         # 全局布局 + 字体加载
│       │   ├── globals.css        # 水墨风格全局样式 + 书法字体
│       │   ├── login/page.tsx     # 登录页
│       │   └── dashboard/         # 管理后台（仪表盘、账号、规则、日志）
│       ├── components/
│       │   ├── landing/           # 落地页组件
│       │   │   ├── Hero.tsx       # 首屏（信驿标题 + 墨迹动效）
│       │   │   ├── Features.tsx   # 功能卡片（3×2 网格）
│       │   │   ├── HowItWorks.tsx  # 使用流程（3 步）
│       │   │   ├── DataBelt.tsx   # 数据统计带
│       │   │   ├── Footer.tsx     # 问道 CTA 区
│       │   │   ├── Navbar.tsx     # 顶部导航
│       │   │   ├── InkSplash.tsx  # 鼠标墨迹轨迹效果
│       │   │   └── VisualEffects.tsx # 视觉装饰组件
│       │   ├── Sidebar.tsx        # 后台侧边栏
│       │   └── Topbar.tsx         # 后台顶栏
│       ├── hooks/                 # 自定义 Hooks（WebSocket 直播流）
│       ├── lib/                   # API 封装 / Mock 数据
│       └── types/                 # TypeScript 类型定义
│
└── README.md
```

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Python 3.11+ · FastAPI · APScheduler · imap-tools · httpx · python-jose (JWT) |
| 前端框架 | Next.js 14 (App Router) · TypeScript · React 18 |
| UI | Tailwind CSS · Radix UI · Lucide Icons · class-variance-authority |
| 动效 | Framer Motion（滚动动画）· Canvas 2D（墨迹轨迹） |
| 表单 | React Hook Form · Zod 校验 |
| 图表 | Recharts |
| 字体 | Noto Serif SC · Ma Shan Zheng · Liu Jian Mao Cao · Zhi Mang Xing（Google Fonts） |
| 部署 | 静态导出 → GitHub Pages（gh-pages 分支） |
| 数据存储 | JSON 文件（开发阶段，零数据库依赖） |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/caoyek/MailHub.git
cd MailHub
```

### 2. 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入 IMAP 邮箱信息和管理后台密码

pip install -r requirements.txt
python main.py
# 后端运行在 http://localhost:8000
```

### 3. 前端

```bash
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:3000
```

### 4. 访问

| 页面 | 地址 |
|---|---|
| 落地页 | http://localhost:3000 |
| 登录 | http://localhost:3000/login |
| 管理后台 | http://localhost:3000/dashboard |

默认账号：`admin@mailhub.local` / `changeme`

## GitHub Pages 部署

前端已配置静态导出（`next.config.js` 中 `output: "export"` + `basePath: "/MailHub"`）。

```bash
# 构建静态文件
cd frontend
npm run build
# 产物在 frontend/out/ 目录

# 推送到 gh-pages 分支（项目根目录执行）
git checkout --orphan gh-pages
git rm -rf .
cp -r frontend/out/* .
touch .nojekyll          # 关键：禁止 Jekyll 处理，否则 _next/ 资源会 404
git add -A
git commit -m "GitHub Pages 静态导出"
git push origin gh-pages -f
git checkout main
```

GitHub 仓库 → Settings → Pages → Source 选 `gh-pages` 分支、`/ (root)` 目录即可。

## 环境变量说明

| 变量 | 说明 | 默认值 |
|---|---|---|
| `IMAP_HOST` | IMAP 服务器地址 | `imap.qq.com` |
| `IMAP_PORT` | IMAP 端口 | `993` |
| `IMAP_USER` | 邮箱账号 | — |
| `IMAP_PASS` | 邮箱授权码 | — |
| `IMAP_FOLDER` | 监听文件夹 | `INBOX` |
| `POLL_INTERVAL_SECONDS` | 轮询间隔（秒） | `60` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@mailhub.local` |
| `ADMIN_PASSWORD` | 管理员密码 | `changeme` |
| `NEXTAUTH_SECRET` | JWT 签名密钥 | — |
| `PORT` | 后端监听端口 | `8000` |

## 许可证

MIT
