import { GetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

describe('Post message API integration tests', () => {
  let baseApiUrl: string;

  beforeAll(() => {
    if (!process.env.API_URL) {
      throw new Error('API_URL environment variable is not set.');
    }
    baseApiUrl = process.env.API_URL;
  });

  describe('Post valid message', () => {
    it('post 1 char message', async () => {
      const data = {
        message: '1',
      };
      const url = `${baseApiUrl}/postMessage`;

      // Postリクエストしてみてレスポンスを確認する
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const body = await res.json();

      expect(body.message).toBe('success');
      expect(body.postMessage).toBe('1');
      const id = body.id;

      // DynamoDBに問い合わせて確認する
      const client = new DynamoDBClient({});
      const command = new GetItemCommand({
        TableName: 'ChatTable',
        Key: {
          uuid: { S: id },
        },
      });
      const dynamoRes = await client.send(command);
      expect(dynamoRes?.Item?.uuid?.S).toBe(id);
    });
  });
});
