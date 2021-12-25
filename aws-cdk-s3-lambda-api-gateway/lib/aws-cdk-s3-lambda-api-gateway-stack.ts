import * as s3 from "@aws-cdk/aws-s3";
import { BucketEncryption } from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class AwsCdkS3LambdaApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create content s3 bucket
    const inputBucket = new s3.Bucket(this, "sample-bucket", {
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
    });

    // create lambda policy statement for operating over s3
    var lambdaS3PolicyStatement = new iam.PolicyStatement();
    lambdaS3PolicyStatement.addActions("s3:PutObject", "s3:GetObject");
    lambdaS3PolicyStatement.addResources(inputBucket.bucketArn + "/*");

    const s3AuthLambda = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/s3-authorizer"),
      environment: {
        S3_BUCKET: inputBucket.bucketName,
      },
      initialPolicy: [lambdaS3PolicyStatement],
    });

    // give to apigateway permission to invoke the lambda
    new lambda.CfnPermission(this, "ApiGatewayPermission", {
      functionName: s3AuthLambda.functionArn,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
    });

    // defines an API Gateway REST API resource backed by our s3 uploader function.
    const uploadApiAuthorizer = new apigateway.LambdaRestApi(
      this,
      "UploadApi",
      {
        handler: s3AuthLambda,
      }
    );
  }
}
