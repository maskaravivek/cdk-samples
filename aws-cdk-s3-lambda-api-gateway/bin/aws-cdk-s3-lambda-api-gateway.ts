#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsCdkS3LambdaApiGatewayStack } from '../lib/aws-cdk-s3-lambda-api-gateway-stack';

const app = new cdk.App();
new AwsCdkS3LambdaApiGatewayStack(app, 'AwsCdkS3LambdaApiGatewayStack');
