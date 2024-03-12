import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface Response {
  statusCode: number;
  body: string;
}

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
 * メッセージ取得API
 *
 * Request Bodyに以下の形式のJSONが含まれることを期待します。
 * { message: 'チャット投稿用メッセージ' }
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return successResponse();
  } catch (err) {
    console.log(err);
    return errorResponse();
  }
};

