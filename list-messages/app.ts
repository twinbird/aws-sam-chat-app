import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
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
      secret: process.env.SECRET,
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
  const config: DynamoDBClientConfig = {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  };
  const client = new DynamoDBClient(process.env.DYNAMODB_ENDPOINT ? config : {});
  const docClient = DynamoDBDocumentClient.from(client);

  let data = [];
  const getChunk = async (key: string): string => {
    const command = new ScanCommand({
      TableName: 'ChatTable',
      Limit: 10,
      ExclusiveStartKey: key,
    });
    const result = await docClient.send(command);
    data.push(...result.Items);

    return result.LastEvaluatedKey;
  };

  let key;
  do {
    key = await getChunk(key);
  } while (key);

  const mapped = data.map((m) => {
    return {
      createdAt: m.createdAt,
      message: m.message,
    };
  });
  return mapped.sort((a, b) => {
    const aday = new Date(a);
    const bday = new Date(b);
    return bday.getTime() - aday.getTime();
  });
};

/**
 * メッセージ取得API
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

