import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

interface Response {
  statusCode: number;
  body: string;
}

interface Post {
  createdAt: string;
  message: string;
}

/**
 * API成功時のレスポンスを返す
 */
const successResponse = (posts: [Post]): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
      posts: posts,
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
};

/**
 * メッセージをデータベースから取り出す
 */
const fetchPosts = async (): [Post] => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const command = new ScanCommand({
    TableName: 'ChatTable',
  });
  const data = await docClient.send(command);
  console.log(data);
  return data.Items.map((m) => {
    return {
      createdAt: m.createdAt,
      message: m.message,
    };
  });
}

/**
 * メッセージ取得API
 *
 * Request Bodyに以下の形式のJSONが含まれることを期待します。
 * { message: 'チャット投稿用メッセージ' }
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const posts = await fetchPosts();
    return successResponse(posts);
  } catch (err) {
    console.log(err);
    return errorResponse();
  }
};

