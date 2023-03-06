import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  Duration
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NodejsLambdaS3DdbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // we will add all the constructs here
    const sampleBucket = new s3.Bucket(this, "my-sample-bucket-medium", {
      bucketName: "my-sample-bucket-medium",
    });

    const sampleTable = new dynamodb.Table(this, "SampleTable", {
      tableName: "SampleTable",
      partitionKey: { name: "jobId", type: dynamodb.AttributeType.STRING },
    });

    const sampleLambda = new lambda.Function(
      this,
      "SampleLambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        timeout: Duration.seconds(30),
        code: lambda.Code.fromAsset("lambda/"),
        environment: {
          TABLE_NAME: sampleTable.tableName,
          BUCKET_NAME: sampleBucket.bucketName
        },
      }
    );

    sampleBucket.grantPut(sampleLambda);
    sampleTable.grantReadWriteData(sampleLambda);
  }
}
