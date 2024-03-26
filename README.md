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
npm run test
```
