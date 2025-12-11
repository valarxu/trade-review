# Trade Review

## 概述
前端使用 React + Vite 构建，后端为 Node/Express 提供 JSON 与图片的本地文件存储，支持通过 PM2 持久运行。

## 目录结构
```
data/trades.json         # 交易数据
images/{tradeId}/        # 图片目录
server/index.js          # 后端服务
deploy/nginx/trade-review.conf
```

## 开发
```
pnpm install
pnpm dev
```

## 构建
```
pnpm build
```

## 后端启动（PM2）
```
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

后端默认监听 `127.0.0.1:3000`，Nginx 反向代理 `/api/`，并通过 `alias` 暴露 `/images/`。

## Nginx
参考 `deploy/nginx/trade-review.conf`，需确保：
- `root /var/www/trade-review/dist`
- `alias /var/www/trade-review/images/` 映射 `/images/`
- `proxy_pass http://127.0.0.1:3000/` 代理 `/api/`

## 数据备份
备份 `data/trades.json` 与整个 `images/` 目录即可迁移数据。
