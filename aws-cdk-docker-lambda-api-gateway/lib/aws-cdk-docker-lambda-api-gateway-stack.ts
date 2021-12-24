import * as path from "path";
import * as cdk from "@aws-cdk/core";
import { Duration } from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class AwsCdkDockerLambdaApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Configure path to Dockerfile
    const dockerfile = path.join(__dirname, "../lambda/");

    // Create AWS Lambda function and push image to ECR
    const myLambda = new lambda.DockerImageFunction(this, "LambdaFunction", {
      code: lambda.DockerImageCode.fromImageAsset(dockerfile),
      timeout: Duration.minutes(15),
    });

    // give to apigateway permission to invoke the lambda
    new lambda.CfnPermission(this, "ApiGatewayPermission", {
      functionName: myLambda.functionArn,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
    });

    const api = new apigateway.RestApi(this, "API", {
      restApiName: "Service",
      description: "Description",
    });

    const resource = api.root.addResource("inference");

    const lambdaIntegration = new apigateway.LambdaIntegration(myLambda);
    resource.addMethod("POST", lambdaIntegration);
  }
}
