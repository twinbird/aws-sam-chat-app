# limited-chat-app

SAMによるとても簡易な掲示板APIサーバー

## デプロイ前検証

```
sam validate
```

## ビルド

```
sam build
```

## デプロイ

```
sam deploy --profile limited-chat-dev --parameter-overrides='Secret="THIS_IS_A_SECRET" DynamoDbEndpoint=""'
```

## テスト

```
cd post-message
AWS_PROFILE="limited-chat-dev" API_URL="xxxxxxx/Prod" npm run test
```
