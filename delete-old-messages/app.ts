import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

interface Response {
  statusCode: number;
  body: string;
}

interface Post {
  uuid: string;
  createdAt: string;
  message: string;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * API成功時のレスポンスを返す
 */
const successResponse = (): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
    }),
  };
};

/*
 * baseDateからmillisec前のdateオブジェクトを返す
 */
const beforeMillisec = (baseDate: Date, millisec: number): Date => {
  const t = baseDate.getTime() - millisec;
  const d = new Date();
  d.setTime(t);

  return d;
};

/**
 * 投稿から10分以上経過したメッセージをデータベースから取り出す
 */
const fetchOldPosts = async (): [Post] => {
  const now = new Date();
  const condDate = beforeMillisec(now, 10 * 60 * 1000);
  const command = new ScanCommand({
    TableName: 'ChatTable',
    FilterExpression: "createdAt < :d",
    ExpressionAttributeValues: {
      ":d": condDate.toISOString(),
    },
  });
  const data = await docClient.send(command);
  return data.Items;
};

/**
 * 引数の投稿を削除する
 */
const deletePost = async (post: Post) => {
  const command = new DeleteCommand({
    TableName: 'ChatTable',
    Key: {
      uuid: post.uuid,
    },
  });

  await docClient.send(command);
};

/*
 * 引数の投稿を削除する
 */
const deletePosts = async (posts: [Post]) => {
  for (const post of posts) {
    await deletePost(post);
  }
};

/**
 * メッセージ削除関数
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const posts = await fetchOldPosts();
  await deletePosts(posts);
  return successResponse();
};

