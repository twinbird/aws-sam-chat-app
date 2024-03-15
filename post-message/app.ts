import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

interface Response {
  statusCode: number;
  body: string;
}

/**
 * API呼び出し時引数の中からメッセージを取得する
 */
const getPostMessage = (event: APIGatewayProxyEvent): string => {
  try {
    const body = JSON.parse(event.body);
    return body.message;
  } catch (err) {
    console.log(err);
    return "";
  }
};

/**
 * メッセージをデータベースへ保存する
 */
const storePost = async (message: string): string => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const uuid = crypto.randomUUID();
  const now = new Date();
  const createdAt = now.toISOString();

  const command = new PutItemCommand({
    TableName: 'ChatTable',
    Item: {
      uuid: { S: uuid },
      createdAt: { S: createdAt },
      message: { S: message },
    },
  });

  const response = await client.send(command);
  return uuid;
};

/**
 * API成功時のレスポンスを返す
 */
const successResponse = (id: string, message: string): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
      postMessage: message,
      id: id,
    }),
  };
};

/**
 * パラメータ不正時のレスポンスを返す
 */
const invalidRequestResponse = (): Response => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'invalid parameter',
    }),
  };
};

/**
 * エラー発生時のレスポンスを返す
 */
const errorResponse = (): Response => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'some error happened',
    }),
  };
}

/**
 * メッセージ投稿API
 *
 * Request Bodyに以下の形式のJSONが含まれることを期待します。
 * { message: 'チャット投稿用メッセージ' }
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const message = getPostMessage(event);
    if (!message) {
      return invalidRequestResponse();
    }

    const id = await storePost(message);
    return successResponse(id, message);
  } catch (err) {
    console.log(err);
    return errorResponse();
  }
};
