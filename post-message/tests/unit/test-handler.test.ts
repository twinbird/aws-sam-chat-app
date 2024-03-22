import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it } from '@jest/globals';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const postMessageEvent: APIGatewayProxyEvent = {
  httpMethod: 'post',
  body: '{ "message": "test message" }',
  headers: {},
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  path: '/postMessage',
  pathParameters: {},
  queryStringParameters: {},
  requestContext: {
    accountId: '123456789012',
    apiId: '1234',
    authorizer: {},
    httpMethod: 'post',
    identity: {
      accessKey: '',
      accountId: '',
      apiKey: '',
      apiKeyId: '',
      caller: '',
      clientCert: {
        clientCertPem: '',
        issuerDN: '',
        serialNumber: '',
        subjectDN: '',
        validity: { notAfter: '', notBefore: '' },
      },
      cognitoAuthenticationProvider: '',
      cognitoAuthenticationType: '',
      cognitoIdentityId: '',
      cognitoIdentityPoolId: '',
      principalOrgId: '',
      sourceIp: '',
      user: '',
      userAgent: '',
      userArn: '',
    },
    path: '/postMessage',
    protocol: 'HTTP/1.1',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTimeEpoch: 1428582896000,
    resourceId: '123456',
    resourcePath: '/postMessage',
    stage: 'dev',
  },
  resource: '',
  stageVariables: {},
};

const ddbMock = mockClient(DynamoDBClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('Post message API Tests', function () {
  it('valid parameter post', async () => {
    process.env.DYNAMODB_TABLE_NAME = 'unit_test_dynamodb_table';
    ddbMock.onAnyCommand().resolves({}); // 全Command に対して定義
    ddbMock.on(PutItemCommand).resolves({
      '$metadata': {
        httpStatusCode: 200,
        requestId: 'e230fba2-732b-4f44-a0f2-ddca742f63fe',
        extendedRequestId: undefined,
        cfId: undefined,
        attempts: 1,
        totalRetryDelay: 0
      },
      Attributes: undefined,
      ConsumedCapacity: undefined,
      ItemCollectionMetrics: undefined
    });
    const expectMessage = "TEST_MESSAGE";
    postMessageEvent.body = JSON.stringify({ message: expectMessage });
    const result: APIGatewayProxyResult = await lambdaHandler(postMessageEvent);

    expect(result.statusCode).toEqual(200);
    const resultObj = JSON.parse(result.body);
    expect(resultObj.message).toEqual('success');
    expect(resultObj.postMessage).toEqual(expectMessage);
    expect(resultObj.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID
  });
});
