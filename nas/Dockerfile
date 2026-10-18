# 小書包讀書計劃的資料庫（PocketBase）
FROM alpine:3.19
ARG PB_VERSION=0.22.21
# 一般群暉（Intel / AMD 處理器）用 amd64；ARM 處理器的機型改成 arm64
ARG PB_ARCH=amd64
RUN apk add --no-cache ca-certificates unzip wget \
 && wget -q -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip" \
 && unzip /tmp/pb.zip -d /pb && rm /tmp/pb.zip
COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks
EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations", "--hooksDir=/pb/pb_hooks"]
