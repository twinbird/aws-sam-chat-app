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
 * 削除対象の古い投稿ならtrue
 */
const isExpired = (baseDate: Date, date: Date) => {
  const limitMilliSeconds = 10 * 60 * 1000; // 10分をミリ秒に変換
  const diffInMilliseconds = baseDate.getTime() - date.getTime();

  return diffInMilliseconds >= limitMilliSeconds;
};

/**
 * 投稿から10分以上経過したメッセージをデータベースから取り出す
 */
const fetchOldPosts = async (): [Post] => {
  const command = new ScanCommand({
    TableName: 'ChatTable',
  });
  const now = new Date();
  const data = await docClient.send(command);
  return data.Items.filter((d) => {
    const createdDate = new Date(d.createdAt)
    return isExpired(now, createdDate);
  });
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


