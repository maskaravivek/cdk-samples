#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsCdkDockerLambdaApiGatewayStack } from '../lib/aws-cdk-docker-lambda-api-gateway-stack';

const app = new cdk.App();
new AwsCdkDockerLambdaApiGatewayStack(app, 'AwsCdkDockerLambdaApiGatewayStack');
